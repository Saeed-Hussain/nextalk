import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { MESSAGE_SELECT } from "@/lib/api/messages";

const DEFAULT_LIMIT = 30;
const VALID_TYPES = [
  "text", "image", "video", "audio", "document", "sticker", "gif", "location", "contact",
];

export async function GET(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { searchParams } = request.nextUrl;
  const conversationId = searchParams.get("conversation_id");
  const limit = parseInt(searchParams.get("limit"), 10) || DEFAULT_LIMIT;
  const cursor = searchParams.get("cursor");

  if (!conversationId) return respond(400, "conversation_id is required");

  const { data: membership, error: memberError } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (memberError) {

    console.error("app/api/messages/route.js:", memberError);

    return respond(500, "Internal Server error");

  }
  if (!membership) return respond(403, "You are not a member of this conversation");

  let query = supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .is("deleted_for_everyone_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) {
    console.error("GET /api/messages:", error);
    return respond(500, "Internal Server error");
  }

  const filtered = data.filter((msg) => !msg.deleted_for_me_at);

  return respond(200, "Messages fetched", {
    messages: filtered.reverse(), // oldest -> newest for rendering
    next_cursor: filtered.length === limit ? filtered[filtered.length - 1].created_at : null,
  });
}

export async function POST(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const {
    conversation_id,
    content,
    message_type = "text",
    file_url,
    file_type,
    reply_to_id,
  } = await request.json();

  if (!conversation_id) return respond(400, "conversation_id is required");
  if (!content && !file_url) return respond(400, "content or file_url is required");
  if (!VALID_TYPES.includes(message_type)) return respond(400, "Invalid message_type");

  const { data: membership, error: memberError } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversation_id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();

  if (memberError) {

    console.error("app/api/messages/route.js:", memberError);

    return respond(500, "Internal Server error");

  }
  if (!membership) return respond(403, "You are not a member of this conversation");

  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      sender_id: user.id,
      content: content || null,
      message_type,
      file_url: file_url || null,
      file_type: file_type || null,
      reply_to_id: reply_to_id || null,
    })
    .select(
      `id, conversation_id, sender_id, message_type, content, file_url, file_type,
      edited_at, is_pinned, created_at,
      reply_to:reply_to_id ( id, content, message_type, sender_id ),
      sender:sender_id ( id, username, display_name, avatar_url )`
    )
    .single();

  if (msgError) {
    console.error("POST /api/messages:", msgError);
    return respond(500, "Internal Server error");
  }

  // Update conversation's last message pointer — Realtime picks up the
  // message insert itself; this just keeps the conversation list's
  // preview/sort order correct without a second round trip from the client.
  await supabase
    .from("conversations")
    .update({
      last_message_id: message.id,
      last_message_at: message.created_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation_id);

  return respond(201, "Message sent", message);
}
