import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after a successful OAuth (Google/GitHub) login,
// with a `code` query param we exchange for a session. This replaces the
// client-side getSession()-in-a-useEffect approach from the Vite app —
// on Next.js we can do the exchange server-side before ever rendering a page.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Returning OAuth user vs first-time user: same check the old app did.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.session.user.id)
    .maybeSingle();

  return NextResponse.redirect(
    `${origin}${profile ? "/chat" : "/complete-profile"}`
  );
}
