"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Search,
  MoreVertical,
  Plus,
  Pin,
  Volume2,
  VolumeX,
  Archive,
  Trash2,
  CheckCheck,
  X,
  UsersRound,
  Star,
  Settings,
  Bell,
  MessageSquarePlus,
  ShieldOff,
  CircleUser,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "./Avatar";
import BottomSheet, { SheetItem } from "./BottomSheet";
import DropdownMenu, { MenuItem } from "./DropdownMenu";
import { useLongPress } from "./useLongPress";
import { useIsOnline } from "@/context/PresenceContext";
import NexTalkLogo from "@/components/NexTalkLogo";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "pinned", label: "Pinned" },
];

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const daysAgo = Math.floor((now - d) / 86400000);
  if (daysAgo < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

const previewText = (msg) => {
  if (!msg) return "No messages yet";
  if (msg.message_type === "text") return msg.content;
  return { image: "📷 Photo", video: "🎥 Video", audio: "🎵 Audio", document: "📄 Document" }[
    msg.message_type
  ] || "Attachment";
};

const ChatRow = ({ conv, onLongPress, onClick, active }) => {
  const { t } = useTheme();
  const { didTriggerLongPress, ...longPressHandlers } = useLongPress(() => onLongPress(conv));
  const initials = conv.is_group ? getInitials(conv.title) : getInitials(conv.other_user?.display_name);
  const color = avatarColor(conv.is_group ? conv.id : conv.other_user?.id);
  const isOnline = useIsOnline(conv.other_user?.id, conv.other_user?.is_online);
  const status = !conv.is_group && isOnline ? "online" : null;

  return (
    <button
      {...longPressHandlers}
      onClick={() => {
        if (didTriggerLongPress()) return;
        onClick(conv);
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-left ${
        active
          ? t("bg-amber-500/10", "bg-amber-50")
          : t("hover:bg-white/5 active:bg-white/10", "hover:bg-stone-50 active:bg-stone-100")
      }`}
    >
      <Avatar initials={initials} color={color} size="md" status={status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-[13px] font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
            {conv.title || "Unknown"}
          </p>
          <span
            className={`text-[10.5px] shrink-0 ${
              conv.unread_count > 0 ? "text-amber-500 font-semibold" : t("text-stone-500", "text-stone-400")
            }`}
          >
            {formatTime(conv.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              conv.unread_count > 0 ? t("text-stone-200", "text-stone-700") : t("text-stone-400", "text-stone-500")
            }`}
          >
            {previewText(conv.last_message)}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {conv.is_muted && <VolumeX className={`w-3.5 h-3.5 ${t("text-stone-500", "text-stone-400")}`} />}
            {conv.is_pinned && <Pin className={`w-3.5 h-3.5 ${t("text-stone-500", "text-stone-400")}`} />}
            {conv.unread_count > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 min-w-[17px] h-[17px] rounded-full flex items-center justify-center">
                {conv.unread_count > 99 ? "99+" : conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const ChatListPane = () => {
  const { t } = useTheme();
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.id?.[0];

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionConv, setActionConv] = useState(null);

  const load = () =>
    api
      .get("/conversations")
      .then((res) => setConversations(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    let list = conversations.filter((c) => !c.is_archived);
    if (filter === "unread") list = list.filter((c) => c.unread_count > 0);
    if (filter === "groups") list = list.filter((c) => c.is_group);
    if (filter === "pinned") list = list.filter((c) => c.is_pinned);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          previewText(c.last_message)?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, filter, search]);

  const archivedCount = conversations.filter((c) => c.is_archived).length;

  const handleAction = async (action) => {
    if (!actionConv) return;
    const id = actionConv.id;
    setActionConv(null);
    try {
      if (action === "delete") {
        await api.delete(`/conversations/${id}`);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      const res = await api.patch(`/conversations/${id}`, { action });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                is_pinned: res.data.is_pinned ?? c.is_pinned,
                is_archived: res.data.is_archived ?? c.is_archived,
                is_muted: !!res.data.muted_until,
                unread_count: action === "read" ? 0 : c.unread_count,
              }
            : c
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const empty = !loading && conversations.length === 0;

  return (
    <div className={`h-full flex flex-col ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
      <header className={`shrink-0 border-b ${t("bg-stone-950/80 border-white/5", "bg-white border-stone-200")}`}>
        <div className="flex items-center justify-between px-3 h-12">
          <div className="flex items-center gap-2">
            <NexTalkLogo className="w-7 h-7" />
            <h1 className={`text-base font-bold ${t("text-stone-100", "text-stone-900")}`}>
              Nex<span className="text-amber-500">Talk</span>
            </h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-1.5 rounded-lg cursor-pointer ${t(
                "text-stone-400 hover:bg-white/5",
                "text-stone-500 hover:bg-stone-100"
              )}`}
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
            <DropdownMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
              <MenuItem icon={UsersRound} label="New group" onClick={() => { setMenuOpen(false); router.push("/chat/new-group"); }} />
              <MenuItem icon={CircleUser} label="Contacts" onClick={() => { setMenuOpen(false); router.push("/chat/contacts"); }} />
              <MenuItem icon={Star} label="Starred messages" onClick={() => { setMenuOpen(false); router.push("/chat/starred"); }} />
              <MenuItem icon={Archive} label="Archived" onClick={() => { setMenuOpen(false); router.push("/chat/archived"); }} hint={archivedCount > 0 ? String(archivedCount) : null} />
              <MenuItem icon={ShieldOff} label="Blocked users" onClick={() => { setMenuOpen(false); router.push("/chat/blocked"); }} />
              <MenuItem icon={Bell} label="Notifications" onClick={() => { setMenuOpen(false); router.push("/chat/settings"); }} />
              <MenuItem icon={Settings} label="Settings" onClick={() => { setMenuOpen(false); router.push("/chat/settings"); }} />
            </DropdownMenu>
          </div>
        </div>

        <div className="px-2.5 pb-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${t("bg-white/5", "bg-stone-100")}`}>
            <Search className={`w-3.5 h-3.5 ${t("text-stone-500", "text-stone-400")}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className={`flex-1 bg-transparent outline-none text-[13px] ${t(
                "text-stone-200 placeholder-stone-600",
                "text-stone-700 placeholder-stone-400"
              )}`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={t("text-stone-500", "text-stone-400")}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 pb-1.5 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                filter === f.id
                  ? "bg-amber-500 text-white"
                  : t("bg-white/5 text-stone-400 hover:bg-white/10", "bg-stone-100 text-stone-600 hover:bg-stone-200")
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {archivedCount > 0 && filter === "all" && !search && (
        <button
          onClick={() => router.push("/chat/archived")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 border-b cursor-pointer ${t(
            "border-white/5 hover:bg-white/5",
            "border-stone-100 hover:bg-stone-50"
          )}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t("bg-stone-800", "bg-stone-100")}`}>
            <Archive className={`w-4 h-4 ${t("text-stone-300", "text-stone-500")}`} />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-[13px] font-semibold ${t("text-stone-100", "text-stone-900")}`}>Archived</p>
          </div>
          <span className="text-[11px] font-semibold text-amber-500">{archivedCount}</span>
        </button>
      )}

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          </div>
        ) : empty ? (
          <EmptyState onStart={() => router.push("/chat/explore")} />
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>No chats match your search.</p>
          </div>
        ) : (
          <div className={`divide-y ${t("divide-white/5", "divide-stone-100")}`}>
            {visible.map((conv) => (
              <ChatRow
                key={conv.id}
                conv={conv}
                active={activeChatId === conv.id}
                onClick={(c) => router.push(`/chat/${c.id}`)}
                onLongPress={(c) => setActionConv(c)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => router.push("/chat/explore")}
        className="fixed md:hidden bottom-20 right-5 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer z-20"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      <BottomSheet open={!!actionConv} onClose={() => setActionConv(null)} title={actionConv?.title}>
        {actionConv?.is_pinned ? (
          <SheetItem icon={Pin} label="Unpin chat" onClick={() => handleAction("unpin")} />
        ) : (
          <SheetItem icon={Pin} label="Pin chat" onClick={() => handleAction("pin")} />
        )}
        {actionConv?.is_muted ? (
          <SheetItem icon={Volume2} label="Unmute notifications" onClick={() => handleAction("unmute")} />
        ) : (
          <SheetItem icon={VolumeX} label="Mute notifications" onClick={() => handleAction("mute")} />
        )}
        {actionConv?.unread_count > 0 && (
          <SheetItem icon={CheckCheck} label="Mark as read" onClick={() => handleAction("read")} />
        )}
        <SheetItem icon={Archive} label="Archive chat" onClick={() => handleAction("archive")} />
        <SheetItem icon={Trash2} label="Delete chat" danger onClick={() => handleAction("delete")} />
      </BottomSheet>
    </div>
  );
};

const EmptyState = ({ onStart }) => {
  const { t } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
        <MessageSquarePlus className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className={`text-base font-semibold ${t("text-stone-100", "text-stone-900")}`}>Welcome to NexTalk!</h2>
      <p className={`mt-1 text-sm max-w-xs ${t("text-stone-400", "text-stone-500")}`}>
        You don&apos;t have any chats yet. Tap below to find friends and start a conversation.
      </p>
      <button
        onClick={onStart}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Explore people
      </button>
    </div>
  );
};

export default ChatListPane;
