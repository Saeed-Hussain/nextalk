import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, about, avatar_url, is_online, last_seen, created_at"
    )
    .eq("id", user.id)
    .single();

  if (error) {

    console.error("app/api/users/me/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!profile) return respond(404, "No user found");

  return respond(200, "User found", { ...profile, email: user.email ?? null });
}

export async function PUT(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { display_name, about, avatar_url } = await request.json();

  if (!display_name && !about && !avatar_url)
    return respond(400, "No fields provided to update");

  const updates = { updated_at: new Date().toISOString() };
  if (display_name !== undefined) updates.display_name = display_name;
  if (about !== undefined) updates.about = about;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, username, display_name, about, avatar_url, updated_at")
    .single();

  if (error) {

    console.error("app/api/users/me/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!data) return respond(404, "User not found");
  return respond(200, "Profile updated", data);
}
