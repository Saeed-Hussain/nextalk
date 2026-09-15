"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, StarOff } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import BottomSheet, { SheetItem } from "@/components/chat/BottomSheet";
import { useLongPress } from "@/components/chat/useLongPress";

const previewText = (msg) => {
  if (!msg) return "";
  if (msg.message_type === "text") return msg.content;
  return (
    { image: "📷 Photo", video: "🎥 Video", audio: "🎵 Audio", document: "📄 Document" }[
      msg.message_type
    ] || "Attachment"
  );
};

const formatTime = (iso) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });

const StarredRow = ({ item, onLongPress, onClick }) => {
  const { t } = useTheme();
  const { didTriggerLongPress, ...longPressHandlers } = useLongPress(() => onLongPress(item));
  const msg = item.message;
  return (
    <button
      {...longPressHandlers}
      onClick={() => {
        if (didTriggerLongPress()) return;
        onClick(item);
      }}
      className={`w-full flex flex-col gap-1 px-4 py-3 text-left cursor-pointer border-b ${t(
        "hover:bg-white/5 border-white/5",
        "hover:bg-stone-50 border-stone-100"
      )}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-amber-500">{msg?.sender?.display_name}</p>
        <span className={`text-[11px] ${t("text-stone-500", "text-stone-400")}`}>
          {msg && formatTime(msg.created_at)}
        </span>
      </div>
      <p className={`text-sm truncate ${t("text-stone-200", "text-stone-800")}`}>{previewText(msg)}</p>
    </button>
  );
};

export default function Starred() {
  const { t } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionItem, setActionItem] = useState(null);

  useEffect(() => {
    api
      .get("/messages/starred")
      .then((res) => setItems(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const unstar = async (item) => {
    try {
      await api.delete(`/messages/${item.message?.id}/star`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      toast.error(err.message);
    }
    setActionItem(null);
  };

  return (
    <ChatShell active="chats" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="Starred messages" subtitle={`${items.length} starred`} />

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Star className={`w-10 h-10 mx-auto mb-3 ${t("text-stone-500", "text-stone-400")}`} />
            <p className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>No starred messages yet.</p>
            <p className={`text-xs mt-1 ${t("text-stone-500", "text-stone-400")}`}>
              Long-press any message and tap Star.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <StarredRow
              key={item.id}
              item={item}
              onClick={(i) => i.message && router.push(`/chat/${i.message.conversation_id}`)}
              onLongPress={setActionItem}
            />
          ))
        )}

        <BottomSheet open={!!actionItem} onClose={() => setActionItem(null)}>
          <SheetItem icon={StarOff} label="Unstar" onClick={() => unstar(actionItem)} />
        </BottomSheet>
      </div>
    </ChatShell>
  );
}
