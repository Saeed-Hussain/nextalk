import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { data, error } = await supabase
    .from("contacts")
    .select(
      `id, nickname, created_at,
      contact:contact_id (
        id, username, display_name, avatar_url, is_online, last_seen
      )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error("app/api/contacts/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Contacts fetched", data);
}

export async function POST(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { contact_id, nickname } = await request.json();
  if (!contact_id) return respond(400, "contact_id is required");
  if (contact_id === user.id)
    return respond(400, "You cannot add yourself as a contact");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", contact_id)
    .maybeSingle();

  if (profileError) {

    console.error("app/api/contacts/route.js:", profileError);

    return respond(500, "Internal Server error");

  }
  if (!profile) return respond(404, "User not found");

  const { data: block, error: blockError } = await supabase
    .from("blocked_users")
    .select("id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${contact_id}),and(blocker_id.eq.${contact_id},blocked_id.eq.${user.id})`
    )
    .maybeSingle();

  if (blockError) {

    console.error("app/api/contacts/route.js:", blockError);

    return respond(500, "Internal Server error");

  }
  if (block) return respond(403, "Cannot add this user");

  const { data, error } = await supabase
    .from("contacts")
    .insert({ user_id: user.id, contact_id, nickname: nickname || null })
    .select(
      `id, nickname, created_at,
      contact:profiles!contacts_contact_id_fkey (
        id, username, display_name, avatar_url, is_online, last_seen
      )`
    )
    .single();

  if (error) {
    if (error.code === "23505") return respond(409, "Contact already added");
    return respond(500, "Internal Server error");
  }

  return respond(201, "Contact added", data);
}
