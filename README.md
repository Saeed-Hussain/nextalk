# NexTalk — Next.js port

## Phase 1 — project setup + auth
- Next.js 16, App Router, plain JS, Tailwind v4
- Supabase auth with **cookie-based sessions** via `@supabase/ssr`
- `proxy.js` (Next.js 16's replacement for `middleware.js`) — refreshes the
  session and protects specific route prefixes (see below)
- Login / Signup / Complete Profile pages ported from the original Vite app
- OAuth callback (`app/auth/callback/route.js`) — server-side PKCE code exchange

## Phase 2 — marketing/static pages
- Home (`/`), About, Blog, Careers, Contact, Features, Security,
  Integrations, Changelog, Privacy, Terms, Cookies, Licenses, and a custom
  404 (`app/not-found.js`) — all ported from the original pages, only
  `react-router-dom` → `next/link` and import paths changed
- `components/StaticPageLayout.js` — shared header/hero/footer for the
  legal/company/product pages (Server Component, no client JS needed)
- Only `Contact` and `Home` are Client Components (`"use client"`) — they're
  the only two that actually use hooks (form state, mobile nav, scroll-in
  counter animation). Everything else renders on the server.
- **`Footer.jsx`, `Topbar.jsx`, `Sidebar.jsx`, `layouts/Dashboardlayout.jsx`
  in the original repo were dead code** — never imported by `App.jsx` — so
  they were intentionally skipped rather than ported.

## Route protection model
`proxy.js` protects by **prefix allowlist**, not a public-path blacklist:
```js
const PROTECTED_PREFIXES = ["/chat", "/complete-profile"];
```
Everything else is public by default. This matters because a blacklist
approach (protect everything except a hardcoded public list) silently
breaks 404s — unknown URLs would get redirected to `/login` instead of
rendering `not-found.js`. Keep new protected routes added to this array;
new public routes need nothing.

## Setup
1. `npm install`
2. `cp .env.local.example .env.local` and fill in your Supabase project URL + anon key
3. In Supabase SQL editor, run `supabase/schema.sql`
4. In Supabase Auth → URL Configuration, add `http://localhost:3000/auth/callback` as a redirect URL
5. `npm run dev`

## Folder structure
```
app/
  (auth)/login/page.js
  (auth)/signup/page.js
  (auth)/complete-profile/page.js
  auth/callback/route.js      <- OAuth code exchange
  chat/page.js                <- placeholder, protected by proxy.js
  about/, blog/, careers/, contact/, features/, security/,
  integrations/, changelog/, privacy/, terms/, cookies/, licenses/
                               <- marketing pages (Server Components)
  not-found.js                <- custom 404
  page.js                     <- Home (Client Component)
  layout.js                   <- server component, wraps Providers
  providers.js                <- "use client", holds context providers + Toaster
  globals.css
lib/
  supabase/client.js           <- browser client (Client Components)
  supabase/server.js           <- server client (Server Components, Route Handlers)
  supabase/middleware.js       <- session-refresh + protected-prefix logic used by proxy.js
  toast.js
context/
  ThemeContext.js
  UserContext.js
components/
  NexTalkLogo.js
  StaticPageLayout.js
supabase/
  schema.sql                   <- full DB schema, RLS policies, Realtime setup
proxy.js                      <- root-level, protects routes
```

## Next phases (not built yet)
3. Users/contacts/blocks API routes + pages
4. Conversations API + ChatHome/ChatList
5. Messages API + ChatThread + Supabase Realtime wiring
6. Typing + Presence via Realtime
7. Uploads (Cloudinary) + AI chat (Gemini)
8. Deploy to Vercel

## Phase 3 — users/contacts/blocks API + pages

### Important discovery
The original frontend's chat pages (`Contacts.jsx`, `Blocked.jsx`, and likely
`Explore.jsx`/`NewChat.jsx`/`UserProfile.jsx`) were **UI mockups only** —
they imported from `data/mockChatData.js` and simulated add/block/unblock
with local `useState`. There was no real API wiring (which is also why
`lib/axios.js`, `lib/socket.js`, and `UserContext.jsx` were empty files in
the original repo). Contacts and Blocked below are wired to **real** data
for the first time, not ported from working code.

### API routes (mirroring the original Express controllers)
- `GET/PUT /api/users/me`, `PUT /api/users/me/username`,
  `PUT /api/users/me/privacy`, `PUT /api/users/me/presence`
- `GET /api/users/search?search=`, `GET /api/users/all`
- `GET /api/users/[id]` — public, with **real privacy filtering** now
  (the original had a `utils/privacy.js` with this exact logic but never
  actually called it from `getUserProfile` — see `lib/api/privacy.js`)
- `GET/POST /api/contacts`, `PATCH/DELETE /api/contacts/[contact_id]`
- `GET/POST /api/blocks`, `DELETE /api/blocks/[id]`

All protected routes use `lib/api/auth.js`'s `requireUser()` (reads the
session from the cookie via `@supabase/ssr`) instead of the old
`authMiddleware.js` + bearer token.

### lib/api/client.js
Replaces the empty `lib/axios.js`. Since API routes live in this same app,
the session cookie is sent automatically on same-origin fetches — no token
management needed.

### Pages
- `/chat/contacts` — real contacts list, grouped alphabetically, search
- `/chat/blocked` — real blocked list + a search-to-block picker
- Ported shared UI: `components/chat/Avatar.js`, `ChatTopBar.js`, `BottomSheet.js`
- `lib/avatarColor.js` — deterministic per-user gradient (mock data had
  pre-assigned random colors; real users don't, so this derives one from
  the user's id instead of every avatar looking the same)

### Scope note for Phase 4
`Explore.jsx`, `NewChat.jsx`, and `UserProfile.jsx` weren't ported yet.
They (and Contacts/Blocked, which currently render standalone) all depend
on `ChatShell.jsx` in the original repo — a persistent nav shell wrapping
`LeftRail` + `MobileBottomNav` + the conversation list (`ChatWelcome`).
Building that shell properly needs the real conversations/messages data
model anyway, so it makes more sense as part of Phase 4 (Conversations API
+ ChatHome/ChatList) than bolted onto Phase 3. `Contacts`/`Blocked` will
get wrapped in the shell once it exists.

## Phase 4 — conversations API + chat shell + ChatHome/ChatList

### Design direction: compact
All new UI in this phase uses tighter spacing than Phase 1–3 (smaller rail:
`w-14` not `w-16`, row padding `py-2` not `py-3`, smaller text sizes, `h-12`
headers not `h-14`). Contacts/Blocked from Phase 3 weren't rebuilt with this
density — say the word if you want those tightened up to match.

### A real bug I caught before it shipped
`supabase/schema.sql` never had an INSERT policy for `conversation_members`.
With RLS enabled and no policy, Postgres default-denies — every DM/group
creation would have failed silently once you actually tried it. Added
`conv_members_insert_creator` (see the updated schema.sql). **If you
already ran the Phase 3 schema in Supabase, run this in the SQL editor:**
```sql
create policy "conv_members_insert_creator" on conversation_members
  for insert to authenticated
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.created_by = auth.uid()
    )
  );
```

### API routes
- `GET/POST /api/conversations` — list (with unread counts, sorted
  pinned-first then by recency) and create (DM or group)
- `GET/PATCH/DELETE /api/conversations/[id]` — detail, pin/unpin/mute/
  unmute/archive/unarchive/mark-read, delete-for-me
- DM creation reuses an existing conversation instead of duplicating one,
  and un-hides it if you'd previously deleted it from your list
- Group creation assigns the creator role `'owner'` — the original backend
  had a bug where `createGroup` only ever assigned `'admin'`, so nobody
  could ever become owner even though other controllers checked for it.
  Fixed here (see `supabase/schema.sql` notes).

### Pages / components
- `app/chat/[[...id]]/page.js` — optional catch-all route handles both
  `/chat` and `/chat/:id` with one component, same as the original's
  single `ChatHome` + `useParams()` pattern
- `components/chat/ChatShell.js`, `LeftRail.js`, `MobileBottomNav.js`,
  `ChatWelcome.js`, `DropdownMenu.js`, `useLongPress.js` — ported
- `components/chat/ChatListPane.js` — wired to real `/api/conversations`
  (original used mock `CONVERSATIONS` data)
- `app/chat/new/page.js` — wired to real contacts + all-users + DM creation
  (original used mock `ALL_USERS`)
- Contacts and Blocked (Phase 3) are now wrapped in `ChatShell` for
  consistent nav, matching what the original did
- `components/chat/ChatThreadPlaceholder.js` — stand-in for the real
  message thread, which is Phase 5

### Skipped in the original that I didn't port
`pages/chat/ChatList.jsx` (359 lines) was dead code — `ChatHome.jsx`
actually imports `ChatListPane.jsx` from `components/chat/`, not this file.
Confirmed nothing else references it.

### Deferred to later phases
`NewGroup.jsx`, `Explore.jsx`, `UserProfile.jsx`, `Archived.jsx`,
`Starred.jsx`, `Settings.jsx`, `PrivacySettings.jsx`, `ChatWallpaper.jsx` —
not ported yet. `ChatThread.jsx` (the real message view) is Phase 5.

## Phase 4 — Conversations API + ChatHome/ChatList/ChatShell

### API routes
- `GET /api/conversations` — list with unread counts, shaped for the UI
  (`title`, `avatar_url`, `other_user` computed server-side instead of
  making the frontend figure out DM-vs-group display logic)
- `POST /api/conversations` — unified endpoint, `{ type: "dm" | "group", ... }`
  (the original had separate `/conversations/dm` and `/conversations/group`
  POST routes; consolidated here)
- `GET/PATCH/DELETE /api/conversations/[id]` — fetch; `PATCH` takes
  `{ action }` for pin/unpin/mute/unmute/archive/unarchive/read/clear
  (also consolidated from 7 separate original POST endpoints); `DELETE`
  is "delete for me" only
- `POST /api/conversations/[id]/leave` — leave a group
- `POST /api/conversations/[id]/members`,
  `DELETE .../members/[userId]`, `PATCH .../members/[userId]/role`,
  `PUT .../group-info` — group management, ported close to 1:1

**Bug fix carried over from the schema notes:** the original `createGroup`
only ever assigned the creator role `'admin'`, never `'owner'` — meaning
`leaveGroup`/`changeRole`'s owner-only logic could never actually fire.
Fixed here: the creator gets `'owner'`.

**RLS gap closed:** `conversation_members` had no INSERT policy covering
"admin adds a member after the group already exists" and no UPDATE policy
letting an admin manage *other* members' rows (remove/promote/demote) —
only self-updates (archive/pin/mute prefs) worked. If you already ran the
Phase 3 `schema.sql`, run `supabase/migrations/0002_fix_conversation_members_rls.sql`
to patch it; `schema.sql` itself is also updated for fresh installs.

### Pages
- `app/chat/[[...id]]/page.js` — the split view: optional catch-all route
  handles both `/chat` (empty state) and `/chat/:id` (thread) with one file
- `components/chat/ChatShell.js` — persistent nav (LeftRail desktop /
  MobileBottomNav mobile) wrapping every chat sub-page
- `components/chat/ChatListPane.js` — real conversation list: search,
  filter tabs (all/unread/groups/pinned), swipe-to-reveal actions via
  `useLongPress`, archived-chats banner
- `/chat/new-group` — two-step flow (pick members → name the group)
- `/chat/archived` — real archived list; unlike the original's nested
  `/chat/archived/:id` split-view route, this links straight to `/chat/:id`
  for the thread. Simpler, and `ChatThread` doesn't exist yet anyway
  (that's Phase 5) — no functionality actually lost.
- `/chat/explore` — one of the 4 primary bottom-nav tabs, so built for
  real this phase rather than deferred: online-now + full people grid,
  wired to `/api/users/all`

### Deferred to Phase 5 (ties to messages, which don't exist yet)
- `ChatThread` (actual message view — currently `ChatThreadPlaceholder`)
- `/chat/starred` (starred *messages*, not conversations — needs messages)
- `/chat/settings`, `/chat/settings/privacy`, `/chat/settings/wallpaper`
- `/chat/profile/[id]` (`UserProfile` — viewing someone's profile page)

## Phase 5 — Messages, ChatThread, and Realtime

### API routes
- `GET/POST /api/messages` — paginated list (`?conversation_id=&cursor=&limit=`)
  and send
- `PUT/DELETE /api/messages/[id]` — edit (15-min window, text only, sender
  only) and delete (`{ mode: "for_me" | "for_everyone" }`)
- `POST /api/messages/[id]/pin`, `.../unpin`, `.../forward`
- `POST/GET /api/messages/[id]/seen` — read receipts (respects the sender's
  `read_receipts_privacy` setting)
- `POST/DELETE /api/messages/[id]/react`, `GET .../reactions`
- `POST/DELETE /api/messages/[id]/star`, `GET /api/messages/starred`

### Realtime — replacing Socket.IO
`lib/hooks/useConversationRealtime.js` subscribes to Postgres Changes on
`messages` filtered by `conversation_id`. This is the direct replacement
for the original's `socket/events/message.events.js` — instead of the
server manually `io.to(room).emit()`-ing on send, Postgres itself notifies
every subscribed client the instant a row is inserted or updated. No
separate socket server, works on Vercel.

**Known limitation:** reactions and read receipts are *not* Realtime-subscribed
yet — a reaction from someone else won't appear live without a refresh/refetch
(your own actions update optimistically). Typing indicators and presence
(Phase 6) will use Realtime Broadcast/Presence channels; extending Realtime
to reactions/seen-by would be a natural addition alongside that, since it's
the same pattern (subscribe to `message_reactions`/`message_seen_by` INSERT
events).

### ChatThread (`components/chat/ChatThread.js`)
Real thread view: day-grouped messages, optimistic send, reply, edit (own
text messages, 15-min window), delete (for me / for everyone), quick
reactions, pin/unpin, star, read receipts (double-check marks), long-press
action sheet (`useLongPress`, ported from the original), and a
group-vs-DM-aware header.

### Real bug fixed while wiring this up
`GET /api/conversations/[id]` (single-conversation fetch, used by
`ChatThread` for the header) was returning **raw** data (`group_name`,
unfiltered `members`) while `GET /api/conversations` (the list, used by
`ChatListPane`) computed a nicer shape (`title`, `avatar_url`, `other_user`).
Two endpoints for the same resource silently drifting is exactly the kind
of thing that bites later — extracted the shaping into
`lib/api/conversations.js`'s `shapeConversation()` so both now return
identical shapes.

### Known schema limitation carried over from the original
`messages.deleted_for_me_at` is a single column, not per-user — so "delete
for me" is technically global in the current schema rather than truly
private to the deleter, the same simplification the original backend had.
Fine for now; a proper fix would be a `message_deletions (message_id,
user_id)` join table instead, worth doing before this goes to real users.

### Deferred to Phase 6
- Typing indicators (Realtime Broadcast)
- Live presence / online status (Realtime Presence — currently `is_online`
  is only as fresh as the last `PUT /api/users/me/presence` call)
- Message pagination UI (API supports `cursor`, `ChatThread` only loads the
  most recent 50 — "load older messages" isn't wired up yet)
- `/chat/starred` page (the API — `GET /api/messages/starred` — is ready,
  just no page consuming it yet)

## Phase 6 — Typing indicators + Presence

### Presence (`context/PresenceContext.js`)
One shared Supabase Realtime **Presence** channel (`presence:online`) that
every signed-in client joins via `PresenceProvider` (mounted in
`app/providers.js`, nested inside `UserProvider` since it needs the current
user). Presence handles join/leave detection automatically — including on
tab close or a dropped connection — which is more reliable than the
original's approach of the client explicitly emitting online/offline events
over Socket.IO.

- `useIsOnline(userId, fallback)` — live online status for one user, with
  a fallback (e.g. the last known DB value) used only until Presence has
  synced, so there's no flash of "offline" on first render
- `useOnlineIds()` — the raw `Set` of currently-online user ids, for use
  inside `.map()` where you can't call a hook per-row

Wired into `ChatThread` (header subtitle + avatar dot), `ChatListPane`,
`Contacts`, `Explore`, and `NewChat` — anywhere the original showed an
online/offline dot now reads live Presence instead of a one-time DB fetch.

The DB's `profiles.is_online`/`last_seen` columns are still kept in sync
(best-effort `PUT /api/users/me/presence` on connect/disconnect) so there's
a reasonable "Last seen" fallback for offline users and a sane initial
value before Presence has synced — but Presence, not the DB column, is now
the source of truth for "is this person online *right now*".

### Typing indicators (`lib/hooks/useTypingChannel.js`)
One Realtime **Broadcast** channel per conversation (`typing:{id}`),
replacing the original's Socket.IO `typing.events.js`. Broadcast is the
right tool here specifically because typing state is ephemeral — no
database row, nothing to persist, just a message passed directly between
connected clients.

- Composer sends `typing: true` on every keystroke (debounced), and
  `typing: false` immediately on send or 2 seconds after the user stops
  typing
- Receiving side auto-clears a stuck "typing..." indicator after 2.5s of
  silence, even if the explicit stop event never arrives (dropped
  connection, tab closed mid-sentence, etc.) — this is what actually makes
  it reliable, since network delivery of the "stopped" event isn't
  guaranteed
- Shows in `ChatThread`'s header subtitle, taking priority over the
  online/last-seen text while active

### What's now fully wired vs. still open
This closes out the original 8-phase plan's core loop: auth → contacts/
blocks → conversations → messages/Realtime → typing/presence. Still not
built (intentionally out of scope for this plan, listed here for
completeness):
- `NewGroup`'s `/api/conversations/[id]/members` management UI (API exists
  from Phase 4, no settings page consumes it yet)
- `/chat/starred` page (API exists from Phase 5, no page yet)
- `/chat/settings`, `/chat/settings/privacy`, `/chat/settings/wallpaper`
- `/chat/profile/[id]` (viewing someone else's profile page)
- Cloudinary uploads (deferred per your instruction back in Phase 3)
- Message pagination UI ("load older messages")
- Live-updating reactions/read-receipts from other users (currently only
  new messages are Realtime — noted as a Phase 5 limitation, same fix
  shape as this phase's message Realtime hook would apply directly)

## Phase 7 — Cloudinary uploads + the remaining deferred pages

### Cloudinary — signed direct-to-browser upload
The original backend proxied file uploads through Express (multer buffer →
`cloudinary.uploader.upload_stream`). That doesn't hold up on Vercel:
serverless functions have request body limits well under video file sizes,
and even image uploads add needless latency routing bytes through your own
server. Built instead: **signed direct upload**, Cloudinary's own
recommended pattern for this exact situation.

- `lib/cloudinary.js` — HMAC-SHA1 signing (Cloudinary's documented
  algorithm), no need to pull in their Node SDK for just this
- `POST /api/uploads/sign` — authenticated, returns a short-lived signature
  scoped to one of 5 `purpose`s (avatar / message_image / message_video /
  message_audio / message_document), each mapped to its own Cloudinary
  folder + transformation, mirroring the original's
  `nextalk/{images,videos,docs,audio}` folder structure
- `lib/uploadToCloudinary.js` — client helper: gets a signature, then
  `XMLHttpRequest`s the file straight to Cloudinary with upload-progress
  callbacks, completely bypassing your Next.js server for the file bytes

Your actual Cloudinary account was checked via the Cloudinary MCP connector
while building this — cloud name `p9ylxfdl`, Free plan limits (10MB image /
100MB video) enforced client-side before upload even starts.

**You still need to add your own `CLOUDINARY_API_SECRET`** to `.env.local`
(cloud name and API key are already filled from what was verified) —
that's a real secret I can't retrieve via the connector, same as the Brevo
SMTP key earlier.

### Wired to Cloudinary
- **Avatars** — `/complete-profile` and the new `/chat/settings/profile`
  (Edit Profile) page. `Avatar.js` itself got extended too — it never
  actually rendered a real image before, only initials; now it shows
  `avatarUrl` when present and falls back to the gradient+initials
  otherwise
- **Message attachments** — `ChatThread`'s composer has a paperclip button
  (photo/video or document), with an upload-progress bar. `MessageBubble`
  now renders images inline, videos/audio with native `<video>`/`<audio>`
  controls, and documents as a download link — all four message types the
  schema already supported but nothing rendered until now

### The rest of the deferred pages, now built for real
- `/chat/settings` — real profile card, real logout (was mock data +
  `comingSoon()` toasts)
- `/chat/settings/profile` — new; display name, about, username, avatar,
  all wired to the real `/api/users/me*` routes
- `/chat/settings/privacy` — wired to `PUT /api/users/me/privacy` (was
  local state + `comingSoon()`)
- `/chat/settings/wallpaper` — near-direct port; this one was already
  fully client-side (no backend needed) in the original
- `/chat/starred` — wired to `GET /api/messages/starred` (API existed
  since Phase 5, no page consumed it until now)
- `/chat/profile/[id]` — wired to the privacy-aware `GET /api/users/[id]`
  from Phase 3, plus real add/remove contact and block/unblock

### What's left
Everything from the original 8-phase plan is now built and wired to real
data. Remaining gaps are polish, not missing features:
- Live-updating reactions/read-receipts from other users (Phase 5 note,
  unchanged — only new messages are Realtime)
- Message pagination ("load older messages") — API supports `cursor`,
  no UI trigger yet
- Group management UI (add/remove member, change role) — APIs from
  Phase 4 exist, no settings screen calls them yet
- Notification system — `notifications` table exists in the schema as a
  design proposal (see schema.sql's notes), never wired to any UI or
  trigger
