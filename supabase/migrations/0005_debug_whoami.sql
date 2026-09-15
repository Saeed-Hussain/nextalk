-- Temporary diagnostic function. Lets us directly compare what auth.uid()
-- resolves to inside a real authenticated PostgREST request against what
-- supabase.auth.getUser() returns in application code. If these differ
-- (or this returns null), that's the actual bug — not the policy itself,
-- which has already been verified correct.
create or replace function debug_whoami()
returns uuid as $$
  select auth.uid();
$$ language sql stable;
