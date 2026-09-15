import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { getMessageAndMembership } from "@/lib/api/messages";

export async function POST(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { message, error } = await getMessageAndMembership(supabase, id, user.id);
  if (error) return error;
  if (message.sender_id === user.id)
    return respond(400, "Cannot mark your own message as seen");

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("read_receipts_privacy")
    .eq("id", message.sender_id)
    .maybeSingle();

  if (senderProfile?.read_receipts_privacy === "nobody")
    return respond(200, "Read receipts disabled by sender");

  const { error: upsertError } = await supabase
    .from("message_seen_by")
    .upsert(
      { message_id: id, user_id: user.id, seen_at: new Date().toISOString() },
      { onConflict: "message_id,user_id" }
    );

  if (upsertError) {

    console.error("app/api/messages/[id]/seen/route.js:", upsertError);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Marked as seen");
}

export async function GET(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");
  const { id } = await params;

  const { error } = await getMessageAndMembership(supabase, id, user.id, {
    requireNotDeleted: false,
  });
  if (error) return error;

  const { data, error: fetchError } = await supabase
    .from("message_seen_by")
    .select("seen_at, profile:user_id ( id, username, display_name, avatar_url )")
    .eq("message_id", id);

  if (fetchError) {

    console.error("app/api/messages/[id]/seen/route.js:", fetchError);

    return respond(500, "Internal Server error");

  }
  return respond(200, "Seen by", data);
}
