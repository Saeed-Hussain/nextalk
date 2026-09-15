-- Backfills a `profiles` row for any auth.users that don't have one yet —
-- e.g. accounts created via Supabase Dashboard → Authentication → Add User,
-- which never go through the app's /complete-profile screen.
-- Safe to re-run; skips users who already have a profile.

insert into profiles (id, username, display_name)
select
  u.id,
  -- derive a username from the email's local part, lowercased,
  -- stripped of anything outside a-z0-9._ so it passes the format check
  regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9._]', '', 'g'),
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
from auth.users u
left join profiles p on p.id = u.id
where p.id is null;
