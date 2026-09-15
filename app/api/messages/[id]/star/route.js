import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { getMessageAndMembership } from "@/lib/api/messages";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { error } = await getMessageAndMembership(supabase, id, user.id);
  if (error) return error;

  const { error: upsertError } = await supabase
    .from("starred_messages")
    .upsert({ message_id: id, user_id: user.id }, { onConflict: "user_id,message_id" });

  if (upsertError) {

    console.error("app/api/messages/[id]/star/route.js:", upsertError);

    return respond(500, "Internal Server error");

  }
  return respond(201, "Message starred");
}

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { error } = await supabase
    .from("starred_messages")
    .delete()
    .eq("message_id", id)
    .eq("user_id", user.id);

  if (error) {

    console.error("app/api/messages/[id]/star/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Message unstarred");
}
