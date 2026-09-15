import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function PATCH(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { contact_id } = await params;
  const { nickname } = await request.json();
  if (nickname === undefined) return respond(400, "nickname is required");

  const { data, error } = await supabase
    .from("contacts")
    .update({ nickname })
    .eq("user_id", user.id)
    .eq("contact_id", contact_id)
    .select("contact_id, nickname")
    .maybeSingle();

  if (error) {

    console.error("app/api/contacts/[contact_id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!data) return respond(404, "Contact not found");

  return respond(200, "Contact updated", data);
}

export async function DELETE(request, { params }) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { contact_id } = await params;

  const { data, error } = await supabase
    .from("contacts")
    .delete()
    .eq("user_id", user.id)
    .eq("contact_id", contact_id)
    .select("id")
    .maybeSingle();

  if (error) {

    console.error("app/api/contacts/[contact_id]/route.js:", error);

    return respond(500, "Internal Server error");

  }
  if (!data) return respond(404, "Contact not found");

  return respond(200, "Contact removed");
}
