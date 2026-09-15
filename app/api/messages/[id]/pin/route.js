import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { getMessageAndMembership } from "@/lib/api/messages";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { error } = await getMessageAndMembership(supabase, id, user.id);
  if (error) return error;

  const { data, error: updateError } = await supabase
    .from("messages")
    .update({ is_pinned: true })
    .eq("id", id)
    .select("id, is_pinned")
    .single();

  if (updateError) {

    console.error("app/api/messages/[id]/pin/route.js:", updateError);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Message pinned", data);
}
