import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function PATCH(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id, userId: targetUserId } = await params;
  const { role } = await request.json();

  if (!role || !["admin", "member"].includes(role))
    return respond(400, 'role must be "admin" or "member"');

  const { data: requester, error: requesterError } = await supabase
    .from("conversation_members")
    .select("role")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (requesterError) {

    console.error("app/api/conversations/[id]/members/[userId]/role/route.js:", requesterError);

    return respond(500, "Internal Server error");

  }
  if (!requester) return respond(403, "Not a member of this conversation");
  if (requester.role !== "owner") return respond(403, "Only the owner can change roles");

  const { data: target, error: targetError } = await supabase
    .from("conversation_members")
    .select("id, role")
    .eq("conversation_id", id)
    .eq("user_id", targetUserId)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (targetError) {

    console.error("app/api/conversations/[id]/members/[userId]/role/route.js:", targetError);

    return respond(500, "Internal Server error");

  }
  if (!target) return respond(404, "Member not found");
  if (target.role === "owner") return respond(403, "Cannot change the owner's role");

  const { error } = await supabase
    .from("conversation_members")
    .update({ role })
    .eq("id", target.id);

  if (error) {

    console.error("app/api/conversations/[id]/members/[userId]/role/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Role updated");
}
