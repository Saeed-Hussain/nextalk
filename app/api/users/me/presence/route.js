import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

// Ported for parity with the original API. Once Phase 6 wires up Realtime
// Presence (channel.track()), that becomes the source of truth for live
// online/offline state — this endpoint is still useful for an explicit
// "set myself offline" call (e.g. on logout) since Presence alone can lag
// slightly behind a deliberate sign-out.
export async function PUT(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { is_online } = await request.json();
  if (is_online === undefined) return respond(400, "is_online is required");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_online,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id, is_online, last_seen")
    .single();

  if (error) {

    console.error("app/api/users/me/presence/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Presence updated", data);
}
