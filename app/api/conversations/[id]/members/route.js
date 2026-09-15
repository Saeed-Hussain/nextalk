import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { user_id: newUserId } = await request.json();
  if (!newUserId) return respond(400, "user_id required");

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("is_group")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (convError) {

    console.error("app/api/conversations/[id]/members/route.js:", convError);

    return respond(500, "Internal Server error");

  }
  if (!conversation) return respond(404, "Conversation not found");
  if (!conversation.is_group) return respond(400, "Cannot add members to a DM");

  const { data: requester, error: requesterError } = await supabase
    .from("conversation_members")
    .select("role")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (requesterError) {

    console.error("app/api/conversations/[id]/members/route.js:", requesterError);

    return respond(500, "Internal Server error");

  }
  if (!requester) return respond(403, "Not a member of this conversation");
  if (!["admin", "owner"].includes(requester.role))
    return respond(403, "Only admin/owner can add members");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", newUserId)
    .maybeSingle();

  if (profileError) {

    console.error("app/api/conversations/[id]/members/route.js:", profileError);

    return respond(500, "Internal Server error");

  }
  if (!profile) return respond(404, "User not found");

  const { data: existing } = await supabase
    .from("conversation_members")
    .select("id, left_at, removed_at")
    .eq("conversation_id", id)
    .eq("user_id", newUserId)
    .maybeSingle();

  if (existing && !existing.left_at && !existing.removed_at)
    return respond(409, "User is already a member");

  if (existing) {
    const { error } = await supabase
      .from("conversation_members")
      .update({ left_at: null, removed_at: null, role: "member" })
      .eq("id", existing.id);
    if (error) {
      console.error("app/api/conversations/[id]/members/route.js:", error);
      return respond(500, "Internal Server error");
    }
  } else {
    const { error } = await supabase
      .from("conversation_members")
      .insert({ conversation_id: id, user_id: newUserId, role: "member" });
    if (error) {
      console.error("app/api/conversations/[id]/members/route.js:", error);
      return respond(500, "Internal Server error");
    }
  }

  return respond(201, "Member added");
}
