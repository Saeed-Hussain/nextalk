import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { data, error } = await supabase
    .from("starred_messages")
    .select(
      `id, created_at,
      message:message_id (
        id, conversation_id, sender_id, message_type, content,
        file_url, file_type, created_at,
        sender:sender_id ( id, username, display_name, avatar_url )
      )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error("app/api/messages/starred/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Starred messages", data);
}
