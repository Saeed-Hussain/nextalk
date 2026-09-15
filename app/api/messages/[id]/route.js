import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function PUT(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { content } = await request.json();

  if (!content) return respond(400, "content is required");

  const { data: message, error: fetchError } = await supabase
    .from("messages")
    .select("id, sender_id, message_type, created_at, deleted_for_everyone_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {

    console.error("app/api/messages/[id]/route.js:", fetchError);

    return respond(500, "Internal Server error");

  }
  if (!message) return respond(404, "Message not found");
  if (message.sender_id !== user.id) return respond(403, "You can only edit your own messages");
  if (message.message_type !== "text") return respond(400, "Only text messages can be edited");
  if (message.deleted_for_everyone_at) return respond(400, "Cannot edit a deleted message");

  const ageMs = Date.now() - new Date(message.created_at).getTime();
  if (ageMs > EDIT_WINDOW_MS) return respond(403, "Edit window of 15 minutes has passed");

  const { data, error } = await supabase
    .from("messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, content, edited_at")
    .single();

  if (error) {

    console.error("app/api/messages/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Message edited", data);
}

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { mode } = await request.json(); // "for_me" | "for_everyone"

  if (!mode || !["for_me", "for_everyone"].includes(mode))
    return respond(400, 'mode must be "for_me" or "for_everyone"');

  const { data: message, error: fetchError } = await supabase
    .from("messages")
    .select("id, sender_id, conversation_id, deleted_for_everyone_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {

    console.error("app/api/messages/[id]/route.js:", fetchError);

    return respond(500, "Internal Server error");

  }
  if (!message) return respond(404, "Message not found");
  if (message.deleted_for_everyone_at) return respond(400, "Message already deleted for everyone");

  if (mode === "for_everyone") {
    if (message.sender_id !== user.id)
      return respond(403, "You can only delete your own messages for everyone");

    const { error } = await supabase
      .from("messages")
      .update({ deleted_for_everyone_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {

      console.error("app/api/messages/[id]/route.js:", error);

      return respond(500, "Internal Server error");

    }
    return respond(200, "Message deleted for everyone");
  }

  const { data: membership, error: memberError } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", message.conversation_id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (memberError) {

    console.error("app/api/messages/[id]/route.js:", memberError);

    return respond(500, "Internal Server error");

  }
  if (!membership) return respond(403, "You are not a member of this conversation");

  const { error } = await supabase
    .from("messages")
    .update({ deleted_for_me_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {

    console.error("app/api/messages/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Message deleted for you");
}
