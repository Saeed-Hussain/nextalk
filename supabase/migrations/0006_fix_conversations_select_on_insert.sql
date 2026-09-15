-- Run this in the Supabase SQL editor. This is the actual fix for the
-- "new row violates row-level security policy for table conversations"
-- error on conversation creation.
--
-- Root cause: `.insert({...}).select("id").single()` asks Postgres to
-- RETURN the new row, which Postgres checks against the SELECT policy —
-- not the INSERT policy. The SELECT policy required is_conversation_member(id),
-- but the conversation_members row that would make the creator a member
-- doesn't exist yet at that point (it's a separate, later insert). So the
-- INSERT's own check (created_by = auth.uid()) passed, but returning the
-- row failed the SELECT check, and Postgres reports the whole statement
-- as an RLS violation.
--
-- Fix: let the creator see their own conversation immediately, in addition
-- to existing members.

drop policy if exists "conversations_select_member" on conversations;

create policy "conversations_select_member" on conversations
  for select to authenticated using (is_conversation_member(id) or created_by = auth.uid());
