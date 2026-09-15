import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id, userId: targetUserId } = await params;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("is_group")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (convError) {

    console.error("app/api/conversations/[id]/members/[userId]/route.js:", convError);

    return respond(500, "Internal Server error");

  }
  if (!conversation) return respond(404, "Conversation not found");
  if (!conversation.is_group) return respond(400, "Cannot remove members from a DM");

  const { data: requester, error: requesterError } = await supabase
    .from("conversation_members")
    .select("role")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (requesterError) {

    console.error("app/api/conversations/[id]/members/[userId]/route.js:", requesterError);

    return respond(500, "Internal Server error");

  }
  if (!requester) return respond(403, "Not a member of this conversation");
  if (!["admin", "owner"].includes(requester.role))
    return respond(403, "Only admin/owner can remove members");

  const { data: target, error: targetError } = await supabase
    .from("conversation_members")
    .select("id, role")
    .eq("conversation_id", id)
    .eq("user_id", targetUserId)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (targetError) {

    console.error("app/api/conversations/[id]/members/[userId]/route.js:", targetError);

    return respond(500, "Internal Server error");

  }
  if (!target) return respond(404, "Member not found");
  if (target.role === "owner") return respond(403, "Cannot remove the owner");

  const { error } = await supabase
    .from("conversation_members")
    .update({ removed_at: new Date().toISOString(), removed_by: user.id })
    .eq("id", target.id);

  if (error) {

    console.error("app/api/conversations/[id]/members/[userId]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Member removed");
}
