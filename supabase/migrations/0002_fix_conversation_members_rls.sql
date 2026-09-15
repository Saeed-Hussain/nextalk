-- Run this in the Supabase SQL editor if you already ran the Phase 3
-- schema.sql. It fixes a gap: conversation_members had no INSERT policy
-- broad enough for admins adding members after group creation, and no
-- UPDATE policy letting an admin/owner manage *other* members' rows
-- (remove member, change role). Group creation, DMs, and your own
-- archive/pin/mute/etc. already worked fine — this only affects the
-- Phase 4 group-management actions (add/remove member, change role).

drop policy if exists "conv_members_insert_creator" on conversation_members;
drop policy if exists "conv_members_update_own" on conversation_members;

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
