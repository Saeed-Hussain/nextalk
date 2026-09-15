import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { getMessageAndMembership } from "@/lib/api/messages";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { emoji } = await request.json();

  if (!emoji) return respond(400, "emoji is required");

  const { error } = await getMessageAndMembership(supabase, id, user.id);
  if (error) return error;

  const { data, error: upsertError } = await supabase
    .from("message_reactions")
    .upsert(
      { message_id: id, user_id: user.id, emoji },
      { onConflict: "message_id,user_id,emoji" }
    )
    .select("id, emoji, user_id")
    .single();

  if (upsertError) {

    console.error("app/api/messages/[id]/react/route.js:", upsertError);

    return respond(500, "Internal Server error");

  }
  return respond(201, "Reaction added", data);
}

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;
  const { emoji } = await request.json();

  if (!emoji) return respond(400, "emoji is required");

  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", id)
    .eq("user_id", user.id)
    .eq("emoji", emoji);

  if (error) {

    console.error("app/api/messages/[id]/react/route.js:", error);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Reaction removed");
}
