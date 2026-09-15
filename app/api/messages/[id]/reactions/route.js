import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { getMessageAndMembership } from "@/lib/api/messages";

export async function GET(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { error } = await getMessageAndMembership(supabase, id, user.id, {
    requireNotDeleted: false,
  });
  if (error) return error;

  const { data, error: fetchError } = await supabase
    .from("message_reactions")
    .select("id, emoji, profile:user_id ( id, username, display_name, avatar_url )")
    .eq("message_id", id);

  if (fetchError) {

    console.error("app/api/messages/[id]/reactions/route.js:", fetchError);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Reactions", data);
}
