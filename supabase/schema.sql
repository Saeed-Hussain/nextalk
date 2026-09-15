-- ============================================================================
-- NexTalk — Supabase schema
-- Reconstructed from every .from("...") query in the original Express
-- controllers + the two direct-from-frontend writes (CompleteProfile,
-- AuthCallback). Run this in the Supabase SQL editor on a fresh project.
--
-- Notes on things that had to be inferred / decided, flagged inline with ⚠:
--   - `notifications` was never actually inserted into anywhere in the
--     original backend (routes existed, but nothing wrote rows). I've given
--     it a reasonable shape; adjust when you build that feature.
--   - `conversation_members.role`: createGroup only ever assigns 'admin' to
--     the creator, never 'owner' — but leaveGroup/removeMember/changeRole
--     all branch on 'owner'. That looks like a bug in the original app
--     (no one can ever become owner). The schema supports all three roles;
--     you'll want to fix createGroup to assign 'owner' to the creator.
--   - RLS: the original Express backend used a single shared anon-key
--     Supabase client with no per-request user JWT, so RLS was effectively
--     bypassed and the Express layer was the *only* authorization boundary.
--     Our Next.js setup uses @supabase/ssr, which DOES attach the user's
--     JWT per-request (browser client + server client both read the auth
--     cookie) — so real RLS enforcement is not just possible here, it's a
--     genuine security upgrade over the original. I've written policies
--     that mirror what the controllers checked manually.
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ─── Reusable updated_at trigger ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- profiles
-- ============================================================================
create table profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  username                text unique,
  display_name            text,
  about                   text,
  avatar_url              text,
  gender                  text check (gender in ('not_selected','male','female','other','prefer_not_to_say')) default 'not_selected',
  is_online               boolean not null default false,
  last_seen               timestamptz,
  last_seen_privacy       text check (last_seen_privacy in ('everyone','contacts','nobody')) default 'everyone',
  profile_photo_privacy   text check (profile_photo_privacy in ('everyone','contacts','nobody')) default 'everyone',
  about_privacy           text check (about_privacy in ('everyone','contacts','nobody')) default 'everyone',
  read_receipts_privacy   text check (read_receipts_privacy in ('everyone','contacts','nobody')) default 'everyone',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- username validation mirrors setUsername()'s isValidUsername() in profileController.js
alter table profiles add constraint username_format
  check (username is null or username ~ '^[a-z0-9._]{3,15}$');

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================================
-- contacts
-- ============================================================================
create table contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  contact_id  uuid not null references profiles(id) on delete cascade,
  nickname    text,
  created_at  timestamptz not null default now(),
  unique (user_id, contact_id),
  check (user_id <> contact_id)
);

create index idx_contacts_user_id on contacts(user_id);
create index idx_contacts_contact_id on contacts(contact_id);

-- ============================================================================
-- blocked_users
-- ============================================================================
create table blocked_users (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references profiles(id) on delete cascade,
  blocked_id  uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index idx_blocked_users_blocker on blocked_users(blocker_id);
create index idx_blocked_users_blocked on blocked_users(blocked_id);

-- ============================================================================
-- conversations
-- (last_message_id FK added after `messages` exists, see bottom of file)
-- ============================================================================
create table conversations (
  id                  uuid primary key default gen_random_uuid(),
  is_group            boolean not null default false,
  group_name          text,
  group_avatar        text,
  group_description   text,
  created_by          uuid references profiles(id) on delete set null,
  last_message_id     uuid, -- FK added later
  last_message_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function set_updated_at();

create index idx_conversations_last_message_at on conversations(last_message_at desc);

-- ============================================================================
-- conversation_members
-- ============================================================================
create table conversation_members (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references conversations(id) on delete cascade,
  user_id             uuid not null references profiles(id) on delete cascade,
  role                text not null check (role in ('owner','admin','member')) default 'member',
  last_read_at        timestamptz,
  is_archived         boolean not null default false,
  is_pinned           boolean not null default false,
  pinned_at           timestamptz,
  muted_until         timestamptz,
  cleared_at          timestamptz,
  deleted_for_me_at   timestamptz,
  left_at             timestamptz,
  removed_at          timestamptz,
  removed_by          uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create index idx_conv_members_user on conversation_members(user_id);
create index idx_conv_members_conversation on conversation_members(conversation_id);

-- ============================================================================
-- messages
-- ============================================================================
create table messages (
  id                        uuid primary key default gen_random_uuid(),
  conversation_id           uuid not null references conversations(id) on delete cascade,
  sender_id                 uuid not null references profiles(id) on delete cascade,
  message_type              text not null check (
                              message_type in ('text','image','video','audio','document','sticker','gif','location','contact')
                            ),
  content                   text,
  file_url                  text,
  file_type                 text,
  reply_to_id               uuid references messages(id) on delete set null,
  is_pinned                 boolean not null default false,
  edited_at                 timestamptz,
  deleted_for_me_at         timestamptz,
  deleted_for_everyone_at   timestamptz,
  created_at                timestamptz not null default now(),
  check (content is not null or file_url is not null)
);

create index idx_messages_conversation_created on messages(conversation_id, created_at desc);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_reply_to on messages(reply_to_id);

-- Now that `messages` exists, wire up conversations.last_message_id
alter table conversations
  add constraint conversations_last_message_fk
  foreign key (last_message_id) references messages(id) on delete set null;

-- ============================================================================
-- message_reactions  (onConflict: message_id,user_id,emoji)
-- ============================================================================
create table message_reactions (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references messages(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

create index idx_reactions_message on message_reactions(message_id);

-- ============================================================================
-- message_seen_by  (onConflict: message_id,user_id — composite PK)
-- ============================================================================
create table message_seen_by (
  message_id  uuid not null references messages(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  seen_at     timestamptz not null default now(),
  primary key (message_id, user_id)
);

-- ============================================================================
-- starred_messages  (onConflict: user_id,message_id)
-- ============================================================================
create table starred_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  message_id  uuid not null references messages(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, message_id)
);

create index idx_starred_user on starred_messages(user_id);

-- ============================================================================
-- notifications  ⚠ design proposal — see note at top of file
-- ============================================================================
create table notifications (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references profiles(id) on delete cascade,
  type                      text not null check (
                              type in ('message','mention','contact_request','group_add','group_role_change','reaction')
                            ),
  title                     text,
  body                      text,
  actor_id                  uuid references profiles(id) on delete set null,
  related_conversation_id   uuid references conversations(id) on delete cascade,
  related_message_id        uuid references messages(id) on delete cascade,
  is_read                   boolean not null default false,
  created_at                timestamptz not null default now()
);

create index idx_notifications_user_created on notifications(user_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table blocked_users enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table message_reactions enable row level security;
alter table message_seen_by enable row level security;
alter table starred_messages enable row level security;
alter table notifications enable row level security;

-- Helper: is the current user an active member of a conversation?
create or replace function is_conversation_member(conv_id uuid)
returns boolean as $$
  select exists (
    select 1 from conversation_members
    where conversation_id = conv_id
      and user_id = auth.uid()
      and left_at is null
      and removed_at is null
  );
$$ language sql security definer stable;

-- profiles: readable by anyone signed in (privacy fields are filtered in
-- application code per canSee() in utils/privacy.js — RLS just gates rows,
-- not columns); writable only by the owner.
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on profiles
  for update to authenticated using (id = auth.uid());

-- contacts: only visible/editable by their owner
create policy "contacts_owner_all" on contacts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- blocked_users: only visible/editable by the blocker
create policy "blocked_users_owner_all" on blocked_users
  for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- conversations: visible/editable only to active members
create policy "conversations_select_member" on conversations
  for select to authenticated using (is_conversation_member(id) or created_by = auth.uid());
create policy "conversations_insert_authenticated" on conversations
  for insert to authenticated with check (created_by = auth.uid());
create policy "conversations_update_member" on conversations
  for update to authenticated using (is_conversation_member(id));

-- conversation_members: members can see their conversations' rosters.
-- INSERT is allowed for the conversation creator (initial member batch at
-- creation time) OR an existing active admin/owner (adding someone later).
-- UPDATE is allowed on your own row (personal prefs: archive/pin/mute/etc.)
-- OR, if you're an active admin/owner, on any row in that conversation
-- (removing a member, changing a role, reactivating a re-added member).
create policy "conv_members_select_member" on conversation_members
  for select to authenticated using (is_conversation_member(conversation_id));

create policy "conv_members_insert" on conversation_members
  for insert to authenticated
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.created_by = auth.uid()
    )
    or exists (
      select 1 from conversation_members admin_row
      where admin_row.conversation_id = conversation_members.conversation_id
        and admin_row.user_id = auth.uid()
        and admin_row.role in ('owner', 'admin')
        and admin_row.left_at is null
        and admin_row.removed_at is null
    )
  );

create policy "conv_members_update_own_or_admin" on conversation_members
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from conversation_members admin_row
      where admin_row.conversation_id = conversation_members.conversation_id
        and admin_row.user_id = auth.uid()
        and admin_row.role in ('owner', 'admin')
        and admin_row.left_at is null
        and admin_row.removed_at is null
    )
  );

-- messages: only active members of the conversation
create policy "messages_select_member" on messages
  for select to authenticated using (is_conversation_member(conversation_id));
create policy "messages_insert_member" on messages
  for insert to authenticated
  with check (sender_id = auth.uid() and is_conversation_member(conversation_id));
create policy "messages_update_own_or_member" on messages
  for update to authenticated using (is_conversation_member(conversation_id));

-- message_reactions / message_seen_by / starred_messages: gated by
-- membership in the parent message's conversation
create policy "reactions_select_member" on message_reactions
  for select to authenticated using (
    exists (select 1 from messages m where m.id = message_id and is_conversation_member(m.conversation_id))
  );
create policy "reactions_write_own" on message_reactions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "seen_by_select_member" on message_seen_by
  for select to authenticated using (
    exists (select 1 from messages m where m.id = message_id and is_conversation_member(m.conversation_id))
  );
create policy "seen_by_write_own" on message_seen_by
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "starred_owner_all" on starred_messages
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- notifications: only visible/editable by their recipient
create policy "notifications_owner_all" on notifications
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- Realtime
-- Enable Postgres Changes on `messages` so clients can subscribe to new
-- messages per conversation (replaces the old Socket.IO `message:new`
-- broadcast). Typing indicators and presence don't need tables — use
-- Realtime Broadcast and Presence channels client-side instead.
-- ============================================================================
alter publication supabase_realtime add table messages;
-- Optional: also add these if you want live UI updates when a member
-- archives/pins/mutes from another device, or when a conversation's
-- last_message_at changes without a fresh message fetch.
-- alter publication supabase_realtime add table conversation_members;
-- alter publication supabase_realtime add table conversations;
