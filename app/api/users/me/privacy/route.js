import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

const VALID = ["everyone", "contacts", "nobody"];
const FIELDS = [
  "last_seen_privacy",
  "profile_photo_privacy",
  "about_privacy",
  "read_receipts_privacy",
];

export async function PUT(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const body = await request.json();
  const updates = {};

  for (const field of FIELDS) {
    if (body[field] === undefined) continue;
    if (!VALID.includes(body[field]))
      return respond(400, `${field} must be 'everyone', 'contacts', or 'nobody'`);
    updates[field] = body[field];
  }

  if (!Object.keys(updates).length)
    return respond(400, "No privacy fields provided");

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(
      "id, last_seen_privacy, profile_photo_privacy, about_privacy, read_receipts_privacy, updated_at"
    )
    .single();

  if (error) {

    console.error("app/api/users/me/privacy/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Privacy settings updated", data);
}
