// Computes the same display-ready shape (title, avatar_url, other_user)
// used by both GET /api/conversations (list) and GET /api/conversations/[id]
// (single). Keeping this in one place avoids the two endpoints drifting —
// which they did before this was extracted: the single-item route returned
// raw group_name/members instead of the same title/other_user fields the
// list route computes, so ChatThread would've had to duplicate this logic
// or show the wrong header.
export function shapeConversation(conv, memberRow, userId) {
  const otherMember = !conv.is_group
    ? conv.members?.find((m) => m.user_id !== userId && !m.left_at && !m.removed_at)
    : null;

  return {
    id: conv.id,
    is_group: conv.is_group,
    title: conv.is_group ? conv.group_name : otherMember?.profile?.display_name,
    avatar_url: conv.is_group ? conv.group_avatar : otherMember?.profile?.avatar_url,
    group_description: conv.group_description,
    other_user: otherMember?.profile ?? null,
    members: conv.is_group
      ? conv.members
          ?.filter((m) => !m.left_at && !m.removed_at)
          .map((m) => ({ ...m.profile, role: m.role }))
      : null,
    member_count: conv.is_group
      ? conv.members?.filter((m) => !m.left_at && !m.removed_at).length
      : null,
    last_message: conv.last_message,
    last_message_at: conv.last_message_at ?? conv.created_at,
    created_by: conv.created_by,
    is_archived: memberRow?.is_archived ?? false,
    is_pinned: memberRow?.is_pinned ?? false,
    pinned_at: memberRow?.pinned_at,
    is_muted: !!memberRow?.muted_until && new Date(memberRow.muted_until) > new Date(),
    my_role: memberRow?.role,
  };
}
