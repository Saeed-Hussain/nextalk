import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { id } = await params; // blocked_users row id

  const { data, error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("id", id)
    .eq("blocker_id", user.id)
    .select("id");

  if (error) {

    console.error("app/api/blocks/[id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!data || data.length === 0) return respond(404, "Block not found");

  return respond(200, "User unblocked");
}
