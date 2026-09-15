import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

export async function GET(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const search = request.nextUrl.searchParams.get("search");
  if (!search) return respond(400, "No query provided");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_online")
    .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);

  if (error) {

    console.error("app/api/users/search/route.js:", error);

    return respond(500, "Internal Server error");

  }

  const { data: blocks, error: blocksError } = await supabase
    .from("blocked_users")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

  if (blocksError) {

    console.error("app/api/users/search/route.js:", blocksError);

    return respond(500, "Internal Server error");

  }

  const excludeIds = new Set(blocks.flatMap((b) => [b.blocker_id, b.blocked_id]));
  const filtered = data.filter((u) => !excludeIds.has(u.id) && u.id !== user.id);

  return respond(200, "Users found", filtered);
}
