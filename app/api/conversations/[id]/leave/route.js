import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("is_group")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (convError) {

    console.error("app/api/conversations/[id]/leave/route.js:", convError);

    return respond(500, "Internal Server error");

  }
  if (!conversation) return respond(404, "Conversation not found");
  if (!conversation.is_group) return respond(400, "Cannot leave a DM");

  const { data: member, error: memberError } = await supabase
    .from("conversation_members")
    .select("id, role")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (memberError) {

    console.error("app/api/conversations/[id]/leave/route.js:", memberError);

    return respond(500, "Internal Server error");

  }
  if (!member) return respond(403, "Not a member of this conversation");
  if (member.role === "owner")
    return respond(400, "Transfer ownership to someone else before leaving");

  const { error } = await supabase
    .from("conversation_members")
    .update({ left_at: new Date().toISOString() })
    .eq("id", member.id);

  if (error) {

    console.error("app/api/conversations/[id]/leave/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Left group");
}
