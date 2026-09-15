"use client";

import { createBrowserClient } from "@supabase/ssr";

// Use this inside Client Components ("use client" files).
// It stores the session in cookies (not localStorage) so the server
// (Route Handlers, Server Components, middleware) can also read it.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
