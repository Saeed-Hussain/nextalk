import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { conversation_ids } = await request.json();

  if (!Array.isArray(conversation_ids) || conversation_ids.length === 0)
    return respond(400, "conversation_ids array is required");

  const { data: original, error: fetchError } = await supabase
    .from("messages")
    .select("content, message_type, file_url, file_type")
    .eq("id", id)
    .is("deleted_for_everyone_at", null)
    .maybeSingle();

  if (fetchError) {

    console.error("app/api/messages/[id]/forward/route.js:", fetchError);

    return respond(500, "Internal Server error");

  }
  if (!original) return respond(404, "Message not found");

  const { data: memberships, error: memberError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id)
    .in("conversation_id", conversation_ids)
    .is("left_at", null)
    .is("removed_at", null);

  if (memberError) {

    console.error("app/api/messages/[id]/forward/route.js:", memberError);

    return respond(500, "Internal Server error");

  }

  const validIds = memberships?.map((m) => m.conversation_id) || [];
  const invalidIds = conversation_ids.filter((cid) => !validIds.includes(cid));
  if (invalidIds.length > 0) return respond(403, "Not a member of some target conversations");

  const inserts = conversation_ids.map((cid) => ({
    conversation_id: cid,
    sender_id: user.id,
    content: original.content,
    message_type: original.message_type,
    file_url: original.file_url || null,
    file_type: original.file_type || null,
  }));

  const { data: forwarded, error: insertError } = await supabase
    .from("messages")
    .insert(inserts)
    .select("id, conversation_id, content, message_type, created_at");

  if (insertError) {

    console.error("app/api/messages/[id]/forward/route.js:", insertError);

    return respond(500, "Internal Server error");

  }

  await Promise.all(
    forwarded.map((msg) =>
      supabase
        .from("conversations")
        .update({
          last_message_id: msg.id,
          last_message_at: msg.created_at,
          updated_at: msg.created_at,
        })
        .eq("id", msg.conversation_id)
    )
  );

  return respond(201, "Message forwarded", forwarded);
}
