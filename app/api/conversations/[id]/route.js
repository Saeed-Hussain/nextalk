import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { shapeConversation } from "@/lib/api/conversations";

async function getMembership(supabase, conversationId, userId) {
  const { data } = await supabase
    .from("conversation_members")
    .select("id, role, is_archived, is_pinned, muted_until, last_read_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("left_at", null)
    .is("removed_at", null)
    .maybeSingle();
  return data;
}

export async function GET(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const membership = await getMembership(supabase, id, user.id);
  if (!membership) return respond(404, "Conversation not found");

  const { data: conv, error } = await supabase
    .from("conversations")
    .select(
      `id, is_group, group_name, group_avatar, group_description, created_by,
      last_message_at, created_at,
      last_message:last_message_id ( id, content, message_type, sender_id, created_at ),
      members:conversation_members (
        user_id, role, left_at, removed_at,
        profile:user_id ( id, username, display_name, avatar_url, is_online, last_seen )
      )`
    )
    .eq("id", id)
    .single();

  if (error) {

    console.error("app/api/conversations/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Conversation found", shapeConversation(conv, membership, user.id));
}

const ACTIONS = ["pin", "unpin", "mute", "unmute", "archive", "unarchive", "read", "clear"];

export async function PATCH(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { action, mute_hours } = await request.json();

  if (!ACTIONS.includes(action))
    return respond(400, `action must be one of: ${ACTIONS.join(", ")}`);

  const membership = await getMembership(supabase, id, user.id);
  if (!membership) return respond(404, "Conversation not found");

  const updates = {};
  if (action === "pin") Object.assign(updates, { is_pinned: true, pinned_at: new Date().toISOString() });
  if (action === "unpin") Object.assign(updates, { is_pinned: false, pinned_at: null });
  if (action === "mute") {
    const hours = mute_hours ?? 8760; // default ~1 year ("mute forever" in the UI)
    updates.muted_until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  }
  if (action === "unmute") updates.muted_until = null;
  if (action === "archive") updates.is_archived = true;
  if (action === "unarchive") updates.is_archived = false;
  if (action === "read") updates.last_read_at = new Date().toISOString();
  if (action === "clear") updates.cleared_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("conversation_members")
    .update(updates)
    .eq("id", membership.id)
    .select("id, is_pinned, is_archived, muted_until, last_read_at")
    .single();

  if (error) {

    console.error("app/api/conversations/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Conversation updated", data);
}

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const membership = await getMembership(supabase, id, user.id);
  if (!membership) return respond(404, "Conversation not found");

  // "Delete chat" only removes it from your own list, same as WhatsApp —
  // it doesn't delete messages or affect the other participant(s). Leaving
  // a group entirely is a separate action (Phase 5+, group management).
  const { error } = await supabase
    .from("conversation_members")
    .update({ deleted_for_me_at: new Date().toISOString() })
    .eq("id", membership.id);

  if (error) {

    console.error("app/api/conversations/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Conversation deleted");
}
