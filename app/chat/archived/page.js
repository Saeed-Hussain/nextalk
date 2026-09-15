"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveX } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const previewText = (msg) => {
  if (!msg) return "No messages yet";
  if (msg.message_type === "text") return msg.content;
  return (
    { image: "📷 Photo", video: "🎥 Video", audio: "🎵 Audio", document: "📄 Document" }[
      msg.message_type
    ] || "Attachment"
  );
};

export default function Archived() {
  const { t } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/conversations")
      .then((res) => setConversations(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const archived = useMemo(() => conversations.filter((c) => c.is_archived), [conversations]);

  const unarchive = async (id) => {
    try {
      await api.patch(`/conversations/${id}`, { action: "unarchive" });
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, is_archived: false } : c)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <ChatShell active="chats" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="Archived" subtitle={`${archived.length} archived chats`} />

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          </div>
        ) : archived.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ArchiveX className={`w-10 h-10 mx-auto mb-3 ${t("text-stone-500", "text-stone-400")}`} />
            <p className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>No archived chats.</p>
          </div>
        ) : (
          <div className={`divide-y ${t("divide-white/5", "divide-stone-100")}`}>
            {archived.map((conv) => {
              const initials = conv.is_group ? getInitials(conv.title) : getInitials(conv.other_user?.display_name);
              const color = avatarColor(conv.is_group ? conv.id : conv.other_user?.id);
              return (
                <div
                  key={conv.id}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 ${t("hover:bg-white/5", "hover:bg-stone-100")}`}
                >
                  <button onClick={() => router.push(`/chat/${conv.id}`)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left">
                    <Avatar initials={initials} color={color} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
                        {conv.title || "Unknown"}
                      </p>
                      <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
                        {previewText(conv.last_message)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => unarchive(conv.id)}
                    className="text-xs font-medium text-amber-500 hover:underline cursor-pointer shrink-0"
                  >
                    Unarchive
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChatShell>
  );
}
