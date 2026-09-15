import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function PUT(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { group_name, group_avatar, group_description } = await request.json();

  const { data: member } = await supabase
    .from("conversation_members")
    .select("role")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (!member) return respond(403, "Not allowed");
  if (!["admin", "owner"].includes(member.role))
    return respond(403, "Only admin/owner can update");

  const updates = { updated_at: new Date().toISOString() };
  if (group_name !== undefined) updates.group_name = group_name;
  if (group_avatar !== undefined) updates.group_avatar = group_avatar;
  if (group_description !== undefined) updates.group_description = group_description;

  if (Object.keys(updates).length === 1)
    return respond(400, "No fields to update");

  const { data, error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", id)
    .eq("is_group", true)
    .is("deleted_at", null)
    .select("id, group_name, group_avatar, group_description, updated_at")
    .maybeSingle();

  if (error) {

    console.error("app/api/conversations/[id]/group-info/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Updated", data);
}
