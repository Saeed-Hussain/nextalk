import { createClient } from "@/lib/supabase/server";

// Every protected route handler starts with this. Returns { supabase, user }
// or { supabase, user: null } — callers respond 401 when user is null.
// (mirrors the old authMiddleware.js, but there's no separate middleware
// layer needed here since @supabase/ssr already validated the JWT cookie.)
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
