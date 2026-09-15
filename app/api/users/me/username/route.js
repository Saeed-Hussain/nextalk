import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";

function isValidUsername(value) {
  if (value.length < 3 || value.length > 15) return false;
  if (!/^[a-z0-9._]+$/.test(value)) return false;
  if (value.includes("..") || value.includes("__")) return false;
  if (
    value.startsWith(".") ||
    value.endsWith(".") ||
    value.startsWith("_") ||
    value.endsWith("_")
  )
    return false;
  return true;
}

export async function PUT(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { username } = await request.json();
  if (!username) return respond(400, "Username is required");

  const cleanUsername = username.trim().toLowerCase();
  if (!isValidUsername(cleanUsername)) {
    return respond(
      400,
      "Invalid username (3–15 chars, letters/numbers/._ only, no consecutive symbols, no leading/trailing dot or underscore)"
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ username: cleanUsername, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, username, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") return respond(409, "Username already taken");
    console.error("app/api/users/me/username/route.js:", error);
    return respond(500, "Internal Server error");
  }
  if (!data) return respond(404, "User not found");

  return respond(200, "Username updated", data);
}
