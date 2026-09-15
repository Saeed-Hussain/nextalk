-- Run this in the Supabase SQL editor. It's safe to run even if some of
-- these policies already exist (drops first, then recreates) — use this
-- if schema.sql appears to have stopped partway through on your project
-- (the "42501: new row violates row-level security policy" error on
-- conversation creation is the symptom: the INSERT policy below was
-- missing, meaning everything in schema.sql after this point may not
-- have run either).

drop policy if exists "conversations_select_member" on conversations;
drop policy if exists "conversations_insert_authenticated" on conversations;
drop policy if exists "conversations_update_member" on conversations;

create policy "conversations_select_member" on conversations
  for select to authenticated using (is_conversation_member(id) or created_by = auth.uid());

create policy "conversations_insert_authenticated" on conversations
  for insert to authenticated with check (created_by = auth.uid());

create policy "conversations_update_member" on conversations
  for update to authenticated using (is_conversation_member(id));
