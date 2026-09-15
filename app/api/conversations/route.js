import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { shapeConversation } from "@/lib/api/conversations";

// NOTE on unread counts: this issues one count query per conversation.
// Fine for the list sizes a chat app has in practice, but if this ever
// needs to scale to users with hundreds of conversations, replace it with
// a Postgres view/RPC that computes unread counts in a single query.
async function withUnreadCounts(supabase, userId, memberships) {
  return Promise.all(
    memberships.map(async (m) => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", m.conversation.id)
        .neq("sender_id", userId)
        .gt("created_at", m.last_read_at ?? "1970-01-01T00:00:00Z");
      return { ...m, unread_count: count ?? 0 };
    })
  );
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      `id, is_archived, is_pinned, pinned_at, muted_until, last_read_at,
      conversation:conversations!inner (
        id, is_group, group_name, group_avatar, last_message_at, created_at,
        last_message:last_message_id ( id, content, message_type, sender_id, created_at ),
        members:conversation_members (
          user_id, left_at, removed_at,
          profile:user_id ( id, username, display_name, avatar_url, is_online, last_seen )
        )
      )`
    )
    .eq("user_id", user.id)
    .is("left_at", null)
    .is("removed_at", null)
    .is("deleted_for_me_at", null);

  if (error) {
    console.error("GET /api/conversations:", error);
    return respond(500, "Internal Server error");
  }

  const withCounts = await withUnreadCounts(supabase, user.id, data);

  const shaped = withCounts
    .map((m) => {
      const conv = m.conversation;
      return {
        ...shapeConversation(conv, m, user.id),
        unread_count: m.unread_count,
      };
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_message_at) - new Date(a.last_message_at);
    });

  return respond(200, "Conversations fetched", shaped);
}

async function areBlocked(supabase, aId, bId) {
  const { data } = await supabase
    .from("blocked_users")
    .select("id")
    .or(`and(blocker_id.eq.${aId},blocked_id.eq.${bId}),and(blocker_id.eq.${bId},blocked_id.eq.${aId})`)
    .maybeSingle();
  return !!data;
}

export async function POST(request) {
  const { supabase, user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const body = await request.json();

  try {
    return await handlePost(supabase, user, body);
  } catch (err) {
    // Catches raw JS exceptions that bypass the normal {error} checks below
    // (e.g. a thrown error, a bad query building step) so they don't just
    // silently show as an unlogged 500.
    console.error("app/api/conversations/route.js POST (uncaught):", err);
    return respond(500, "Internal Server error", {
      debug: err?.message || String(err),
    });
  }
}

async function handlePost(supabase, user, body) {
  if (body.type === "dm") {
    const { user_id: otherId } = body;
    if (!otherId) return respond(400, "user_id is required");
    if (otherId === user.id) return respond(400, "Cannot start a chat with yourself");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", otherId)
      .maybeSingle();
    if (!profile) return respond(404, "User not found");

    if (await areBlocked(supabase, user.id, otherId))
      return respond(403, "You cannot message this user");

    // Look for an existing DM between exactly these two active members
    const { data: myDMs } = await supabase
      .from("conversation_members")
      .select("conversation_id, conversation:conversations!inner(is_group)")
      .eq("user_id", user.id)
      .eq("conversation.is_group", false)
      .is("left_at", null)
      .is("removed_at", null);

    for (const row of myDMs ?? []) {
      const { data: otherMembership } = await supabase
        .from("conversation_members")
        .select("id")
        .eq("conversation_id", row.conversation_id)
        .eq("user_id", otherId)
        .is("left_at", null)
        .is("removed_at", null)
        .maybeSingle();
      if (otherMembership) {
        // Existing DM found — un-hide it if it was previously deleted-for-me
        await supabase
          .from("conversation_members")
          .update({ deleted_for_me_at: null })
          .eq("conversation_id", row.conversation_id)
          .eq("user_id", user.id);
        return respond(200, "Conversation found", { id: row.conversation_id });
      }
    }

    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({ is_group: false, created_by: user.id })
      .select("id")
      .single();
    if (convError) {
      console.error("app/api/conversations/route.js:", convError, "attempted created_by:", user.id);
      return respond(500, "Internal Server error", { debug: convError.message, attempted_created_by: user.id });
    }

    const { error: membersError } = await supabase.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: user.id, role: "member" },
      { conversation_id: conv.id, user_id: otherId, role: "member" },
    ]);
    if (membersError) {
      console.error("app/api/conversations/route.js:", membersError);
      return respond(500, "Internal Server error");
    }

    return respond(201, "Conversation created", { id: conv.id });
  }

  if (body.type === "group") {
    const { group_name, member_ids } = body;
    if (!group_name?.trim()) return respond(400, "group_name is required");
    if (!Array.isArray(member_ids) || member_ids.length < 1)
      return respond(400, "At least one other member is required");

    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({ is_group: true, group_name: group_name.trim(), created_by: user.id })
      .select("id")
      .single();
    if (convError) {
      console.error("app/api/conversations/route.js:", convError);
      return respond(500, "Internal Server error");
    }

    // Creator becomes 'owner' — see supabase/schema.sql notes: the original
    // app never assigned this role to anyone, which is a bug fixed here.
    const rows = [
      { conversation_id: conv.id, user_id: user.id, role: "owner" },
      ...member_ids
        .filter((id) => id !== user.id)
        .map((id) => ({ conversation_id: conv.id, user_id: id, role: "member" })),
    ];
    const { error: membersError } = await supabase.from("conversation_members").insert(rows);
    if (membersError) {
      console.error("app/api/conversations/route.js:", membersError);
      return respond(500, "Internal Server error");
    }

    return respond(201, "Group created", { id: conv.id });
  }

  return respond(400, "type must be 'dm' or 'group'");
}
