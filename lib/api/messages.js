import { respond } from "@/lib/api/respond";

// Most message actions (pin, react, star, seen, delete) start the same way:
// load the message, make sure it's not deleted, and confirm the caller is
// an active member of its conversation. Returns { message } on success or
// { error: <NextResponse> } on failure.
export async function getMessageAndMembership(supabase, messageId, userId, { requireNotDeleted = true } = {}) {
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, message_type, created_at, deleted_for_everyone_at")
    .eq("id", messageId)
    .maybeSingle();

  if (msgError) return { error: respond(500, "Internal Server error") };
  if (!message) return { error: respond(404, "Message not found") };
  if (requireNotDeleted && message.deleted_for_everyone_at)
    return { error: respond(400, "Message has been deleted") };

  const { data: membership, error: memberError } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", message.conversation_id)
    .eq("user_id", userId)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (memberError) return { error: respond(500, "Internal Server error") };
  if (!membership) return { error: respond(403, "Not a member of this conversation") };

  return { message };
}

export const MESSAGE_SELECT = `
  id, conversation_id, sender_id, message_type, content,
  file_url, file_type, reply_to_id, edited_at, is_pinned, created_at,
  deleted_for_everyone_at, deleted_for_me_at,
  reply_to:reply_to_id ( id, content, message_type, sender_id ),
  reactions:message_reactions ( id, emoji, user_id ),
  seen_by:message_seen_by ( user_id, seen_at ),
  sender:sender_id ( id, username, display_name, avatar_url )
`;
