import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { data, error } = await supabase
    .from("blocked_users")
    .select(
      `id, created_at,
      blocked:blocked_id (
        id, username, display_name, avatar_url
      )`
    )
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error("app/api/blocks/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Blocked users fetched", data);
}

export async function POST(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { blocked_id } = await request.json();
  if (!blocked_id) return respond(400, "blocked_id is required");
  if (blocked_id === user.id) return respond(400, "You cannot block yourself");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", blocked_id)
    .single();

  if (profileError || !profile) return respond(404, "User not found");

  // Remove from contacts (both directions) before blocking
  await supabase
    .from("contacts")
    .delete()
    .or(
      `and(user_id.eq.${user.id},contact_id.eq.${blocked_id}),and(user_id.eq.${blocked_id},contact_id.eq.${user.id})`
    );

  const { data, error } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: user.id, blocked_id })
    .select(
      `id, created_at,
      blocked:blocked_id (
        id, username, display_name, avatar_url
      )`
    )
    .single();

  if (error) {
    if (error.code === "23505") return respond(409, "User already blocked");
    return respond(500, "Internal Server error");
  }

  return respond(201, "User blocked", data);
}
