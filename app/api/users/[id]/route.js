import { respond } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { canSee } from "@/lib/api/privacy";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public — matches the original (no authMiddleware on this route), but a
// signed-in viewer still gets privacy-aware fields where an anonymous
// visitor only ever sees 'everyone'-visibility fields.
export async function GET(request, { params }) {
  const { id } = await params;

  // Postgres rejects a non-uuid as a cast error rather than an empty result,
  // so screen it here and treat it the same as any other unknown user.
  if (!UUID_RE.test(id)) return respond(404, "No user found");

  const supabase = await createClient();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: target, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, about, avatar_url, is_online, last_seen, created_at, last_seen_privacy, profile_photo_privacy, about_privacy"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {

    console.error("app/api/users/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!target) return respond(404, "No user found");

  if (viewer && viewer.id !== id) {
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("blocker_id", id)
      .eq("blocked_id", viewer.id)
      .maybeSingle();
    if (blocked) return respond(403, "This user is unavailable");
  }

  let isContact = false;
  if (viewer && viewer.id !== id) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("user_id", id)
      .eq("contact_id", viewer.id)
      .maybeSingle();
    isContact = !!contact;
  }

  const isSelf = viewer?.id === id;
  const canSeeAvatar = isSelf || canSee(target.profile_photo_privacy, isContact);
  const canSeeAbout = isSelf || canSee(target.about_privacy, isContact);
  const canSeeLastSeen = isSelf || canSee(target.last_seen_privacy, isContact);

  return respond(200, "User found", {
    id: target.id,
    username: target.username,
    display_name: target.display_name,
    created_at: target.created_at,
    avatar_url: canSeeAvatar ? target.avatar_url : null,
    about: canSeeAbout ? target.about : null,
    last_seen: canSeeLastSeen ? target.last_seen : null,
    is_online: canSeeLastSeen ? target.is_online : false,
  });
}
