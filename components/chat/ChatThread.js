"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Reply, Copy, Star, Pin, PinOff, Trash2, Pencil,
  Check, CheckCheck, X, MoreVertical, Users, Paperclip, Image as ImageIcon,
  FileText, Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useWallpaper } from "@/context/WallpaperContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import { useConversationRealtime } from "@/lib/hooks/useConversationRealtime";
import { useTypingChannel } from "@/lib/hooks/useTypingChannel";
import { useIsOnline } from "@/context/PresenceContext";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import Avatar from "@/components/chat/Avatar";
import BottomSheet, { SheetItem } from "@/components/chat/BottomSheet";
import DropdownMenu, { MenuItem } from "@/components/chat/DropdownMenu";
import { useLongPress } from "@/components/chat/useLongPress";

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];
const EDIT_WINDOW_MS = 15 * 60 * 1000;

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatDayLabel = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};

function groupByDay(messages) {
  const groups = [];
  let currentDay = null;
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== currentDay) {
      groups.push({ day, label: formatDayLabel(msg.created_at), messages: [] });
      currentDay = day;
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

export default function ChatThread({ conversationId }) {
  const { t, dark } = useTheme();
  const { wallpaper } = useWallpaper();
  const { profile: me } = useUser();
  const router = useRouter();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sheetMessage, setSheetMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { typingUserIds, sendTyping } = useTypingChannel(conversationId, me?.id);
  const isOtherOnline = useIsOnline(conversation?.other_user?.id, conversation?.other_user?.is_online);
  const typingTimeoutRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null); // { name, percent } | null
  const fileInputRef = useRef(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const sentSeenIds = useRef(new Set());
  const pendingScrollAdjust = useRef(null);
  const isLoadingOlderRef = useRef(false);

  const scrollToBottom = useCallback((behavior = "auto") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // ─── Initial load ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the fetch this effect kicks off
    setLoading(true);
    Promise.all([
      api.get(`/conversations/${conversationId}`),
      api.get(`/messages?conversation_id=${conversationId}&limit=50`),
    ])
      .then(([convRes, msgRes]) => {
        if (cancelled) return;
        setConversation(convRes.data);
        setMessages(msgRes.data.messages || []);
        setCursor(msgRes.data.next_cursor || null);
        setHasMore(!!msgRes.data.next_cursor);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (loading) return;
    if (isLoadingOlderRef.current) return; // layout effect below handles scroll position instead
    scrollToBottom("smooth");
  }, [messages.length, loading, scrollToBottom]);

  // Restore scroll position after prepending older messages, so the view
  // doesn't jump — runs before paint (useLayoutEffect), synchronously after
  // the DOM has the new (taller) content but before the browser draws it.
  useLayoutEffect(() => {
    if (!pendingScrollAdjust.current || !scrollRef.current) return;
    const { prevScrollHeight, prevScrollTop } = pendingScrollAdjust.current;
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight - prevScrollHeight + prevScrollTop;
    pendingScrollAdjust.current = null;
    isLoadingOlderRef.current = false;
  }, [messages]);

  const loadOlderMessages = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const container = scrollRef.current;
    try {
      const res = await api.get(
        `/messages?conversation_id=${conversationId}&cursor=${encodeURIComponent(cursor)}&limit=50`
      );
      if (container) {
        pendingScrollAdjust.current = {
          prevScrollHeight: container.scrollHeight,
          prevScrollTop: container.scrollTop,
        };
      }
      isLoadingOlderRef.current = true;
      setMessages((prev) => [...(res.data.messages || []), ...prev]);
      setCursor(res.data.next_cursor || null);
      setHasMore(!!res.data.next_cursor);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Mark the last received (not mine) message as read, once per message
  useEffect(() => {
    if (!me || messages.length === 0) return;
    const lastFromOther = [...messages].reverse().find((m) => m.sender_id !== me.id);
    if (!lastFromOther || sentSeenIds.current.has(lastFromOther.id)) return;
    sentSeenIds.current.add(lastFromOther.id);
    api.post(`/messages/${lastFromOther.id}/seen`, {}).catch(() => {});
    api.patch(`/conversations/${conversationId}`, { action: "read" }).catch(() => {});
  }, [messages, me, conversationId]);

  // ─── Realtime ────────────────────────────────────────────────────
  const memberProfile = useCallback(
    (userId) => conversation?.members?.find((m) => m.id === userId) || conversation?.other_user,
    [conversation]
  );

  useConversationRealtime(conversationId, {
    onInsert: (row) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        const sender = memberProfile(row.sender_id);
        return [
          ...prev,
          {
            ...row,
            sender: sender
              ? { id: sender.id, display_name: sender.display_name, username: sender.username, avatar_url: sender.avatar_url }
              : null,
            reactions: [],
            seen_by: [],
          },
        ];
      });
    },
    onUpdate: (row) => {
      setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)));
    },
    onReactionInsert: (row) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== row.message_id) return m;
          // Own reactions are already applied optimistically in toggleReaction —
          // avoid double-adding when our own insert echoes back over Realtime.
          if (m.reactions?.some((r) => r.user_id === row.user_id && r.emoji === row.emoji)) return m;
          return { ...m, reactions: [...(m.reactions || []), { user_id: row.user_id, emoji: row.emoji }] };
        })
      );
    },
    onReactionDelete: (row) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === row.message_id
            ? { ...m, reactions: (m.reactions || []).filter((r) => !(r.user_id === row.user_id && r.emoji === row.emoji)) }
            : m
        )
      );
    },
    onSeenChange: (row) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== row.message_id) return m;
          if (m.seen_by?.some((s) => s.user_id === row.user_id)) return m;
          return { ...m, seen_by: [...(m.seen_by || []), { user_id: row.user_id, seen_at: row.seen_at }] };
        })
      );
    },
  });

  const dayGroups = useMemo(() => groupByDay(messages.filter((m) => !m.deleted_for_me_at)), [messages]);

  // ─── Actions ─────────────────────────────────────────────────────
  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    if (editingId) {
      setSending(true);
      try {
        const res = await api.put(`/messages/${editingId}`, { content });
        setMessages((prev) =>
          prev.map((m) => (m.id === editingId ? { ...m, content, edited_at: res.data.edited_at } : m))
        );
        setEditingId(null);
        setDraft("");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSending(false);
      }
      return;
    }

    setDraft("");
    clearTimeout(typingTimeoutRef.current);
    sendTyping(false);
    const replyToId = replyTo?.id;
    setReplyTo(null);
    setSending(true);
    try {
      const res = await api.post("/messages", {
        conversation_id: conversationId,
        content,
        message_type: "text",
        reply_to_id: replyToId,
      });
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, { ...res.data, reactions: [], seen_by: [] }]
      );
    } catch (err) {
      toast.error(err.message);
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDraftChange = (value) => {
    setDraft(value);
    if (editingId) return; // don't broadcast typing while editing an old message
    sendTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
  };

  const messageTypeForFile = (file) => {
    if (file.type.startsWith("image/")) return { message_type: "image", purpose: "message_image" };
    if (file.type.startsWith("video/")) return { message_type: "video", purpose: "message_video" };
    if (file.type.startsWith("audio/")) return { message_type: "audio", purpose: "message_audio" };
    return { message_type: "document", purpose: "message_document" };
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow selecting the same file again later
    if (!file) return;

    const { message_type, purpose } = messageTypeForFile(file);
    setUploadProgress({ name: file.name, percent: 0 });

    try {
      const uploaded = await uploadToCloudinary(file, purpose, (percent) =>
        setUploadProgress({ name: file.name, percent })
      );
      const res = await api.post("/messages", {
        conversation_id: conversationId,
        message_type,
        content: message_type === "document" ? file.name : null,
        file_url: uploaded.url,
        file_type: uploaded.file_type,
      });
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, { ...res.data, reactions: [], seen_by: [] }]
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const openFilePicker = (accept) => {
    setAttachMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.accept = accept;
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      sendTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run cleanup on unmount/conversation change, not on every sendTyping identity change
  }, [conversationId]);

  const openMessageSheet = (msg) => {
    const isMineTextNotDeleted =
      msg.sender_id === me?.id && msg.message_type === "text" && !msg.deleted_for_everyone_at;
    // eslint-disable-next-line react-hooks/purity -- runs inside the onLongPress event handler only, never during render
    const withinEditWindow = Date.now() - new Date(msg.created_at).getTime() < EDIT_WINDOW_MS;
    setSheetMessage({ ...msg, _canEdit: isMineTextNotDeleted && withinEditWindow });
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setDraft(msg.content || "");
    setSheetMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const deleteMessage = async (msg, mode) => {
    try {
      await api.delete(`/messages/${msg.id}`, { mode });
      if (mode === "for_everyone") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, deleted_for_everyone_at: new Date().toISOString(), content: null } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }
    } catch (err) {
      toast.error(err.message);
    }
    setSheetMessage(null);
  };

  const toggleReaction = async (msg, emoji) => {
    const mine = msg.reactions?.some((r) => r.user_id === me?.id && r.emoji === emoji);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msg.id) return m;
        const reactions = mine
          ? m.reactions.filter((r) => !(r.user_id === me?.id && r.emoji === emoji))
          : [...(m.reactions || []), { user_id: me?.id, emoji }];
        return { ...m, reactions };
      })
    );
    try {
      if (mine) await api.delete(`/messages/${msg.id}/react`, { emoji });
      else await api.post(`/messages/${msg.id}/react`, { emoji });
    } catch (err) {
      toast.error(err.message);
    }
    setSheetMessage(null);
  };

  const togglePin = async (msg) => {
    try {
      await api.post(`/messages/${msg.id}/${msg.is_pinned ? "unpin" : "pin"}`, {});
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_pinned: !m.is_pinned } : m)));
      toast.success(msg.is_pinned ? "Unpinned" : "Pinned to chat");
    } catch (err) {
      toast.error(err.message);
    }
    setSheetMessage(null);
  };

  const starMessage = async (msg) => {
    try {
      await api.post(`/messages/${msg.id}/star`, {});
      toast.success("Added to starred messages");
    } catch (err) {
      toast.error(err.message);
    }
    setSheetMessage(null);
  };

  const copyMessage = (msg) => {
    navigator.clipboard.writeText(msg.content || "");
    toast.success("Copied");
    setSheetMessage(null);
  };

  const leaveGroup = async () => {
    try {
      await api.post(`/conversations/${conversationId}/leave`, {});
      toast.success("Left the group");
      router.push("/chat");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ─── Header info ─────────────────────────────────────────────────
  const title = conversation?.is_group ? conversation.group_name : conversation?.other_user?.display_name;
  const someoneTyping = typingUserIds.size > 0;
  const typingLabel = conversation?.is_group
    ? `${typingUserIds.size} typing...`
    : "typing...";
  const subtitle = someoneTyping
    ? typingLabel
    : conversation?.is_group
    ? `${conversation.member_count || 0} members`
    : isOtherOnline
    ? "Online"
    : conversation?.other_user?.last_seen
    ? `Last seen ${formatTime(conversation.other_user.last_seen)}`
    : "";

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center ${t("bg-stone-900/30", "bg-stone-100")}`}>
        <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className={`shrink-0 flex items-center gap-3 px-4 py-2.5 border-b ${t(
          "bg-stone-950/95 border-white/5",
          "bg-white border-stone-200"
        )}`}
      >
        <button onClick={() => router.push("/chat")} className={`md:hidden p-1 -ml-1 ${t("text-stone-400", "text-stone-500")}`}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            router.push(
              conversation?.is_group ? `/chat/${conversationId}/info` : `/chat/profile/${conversation?.other_user?.id}`
            )
          }
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
        >
          {conversation?.is_group ? (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${avatarColor(conversationId)}`}>
              <Users className="w-5 h-5 text-white" />
            </div>
          ) : (
            <Avatar
              initials={getInitials(title)}
              color={avatarColor(conversation?.other_user?.id)}
              status={isOtherOnline ? "online" : null}
              size="md"
            />
          )}
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>{title || "Unknown"}</p>
            {subtitle && <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>{subtitle}</p>}
          </div>
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`p-2 rounded-lg cursor-pointer ${t("text-stone-400 hover:bg-white/5", "text-stone-500 hover:bg-stone-100")}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <DropdownMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
            {conversation?.is_group && (
              <MenuItem
                label="Leave group"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  leaveGroup();
                }}
              />
            )}
            <MenuItem
              label="Clear chat"
              onClick={async () => {
                setMenuOpen(false);
                try {
                  await api.patch(`/conversations/${conversationId}`, { action: "clear" });
                  setMessages([]);
                  toast.success("Chat cleared");
                } catch (err) {
                  toast.error(err.message);
                }
              }}
            />
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto px-3 sm:px-8 py-4 relative ${wallpaper?.gradient || ""}`}>
        {hasMore && (
          <div className="flex justify-center mb-3">
            <button
              onClick={loadOlderMessages}
              disabled={loadingMore}
              className={`text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-60 ${t(
                "bg-white/10 text-stone-300 hover:bg-white/15",
                "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
              )}`}
            >
              {loadingMore ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                "Load earlier messages"
              )}
            </button>
          </div>
        )}
        {dayGroups.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>No messages yet. Say hi 👋</p>
          </div>
        ) : (
          dayGroups.map((group) => (
            <div key={group.day}>
              <div className="flex justify-center my-3">
                <span
                  className={`text-[11px] font-medium px-3 py-1 rounded-full ${t(
                    "bg-white/10 text-stone-300",
                    "bg-white text-stone-500 shadow-sm"
                  )}`}
                >
                  {group.label}
                </span>
              </div>
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMine={msg.sender_id === me?.id}
                  isGroup={conversation?.is_group}
                  onLongPress={() => openMessageSheet(msg)}
                  t={t}
                />
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply/Edit banner */}
      {(replyTo || editingId) && (
        <div className={`shrink-0 flex items-center gap-2 px-4 py-2 border-t ${t("bg-stone-900 border-white/5", "bg-stone-50 border-stone-200")}`}>
          {editingId ? <Pencil className="w-4 h-4 text-amber-500 shrink-0" /> : <Reply className="w-4 h-4 text-amber-500 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-500">
              {editingId ? "Editing message" : `Replying to ${replyTo?.sender?.display_name || "message"}`}
            </p>
            <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>{editingId ? "" : replyTo?.content}</p>
          </div>
          <button onClick={() => (editingId ? cancelEdit() : setReplyTo(null))} className={t("text-stone-500", "text-stone-400")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <div className={`shrink-0 px-4 py-2 border-t text-xs ${t("bg-stone-900 border-white/5 text-stone-300", "bg-stone-50 border-stone-200 text-stone-600")}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="truncate">Uploading {uploadProgress.name}...</span>
            <span>{uploadProgress.percent}%</span>
          </div>
          <div className={`h-1 rounded-full overflow-hidden ${t("bg-white/10", "bg-stone-200")}`}>
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress.percent}%` }} />
          </div>
        </div>
      )}

      {/* Composer */}
      <div className={`shrink-0 flex items-end gap-2 px-3 sm:px-4 py-3 border-t ${t("bg-stone-950 border-white/5", "bg-white border-stone-200")}`}>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
        <div className="relative">
          <button
            onClick={() => setAttachMenuOpen((v) => !v)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full cursor-pointer ${t(
              "text-stone-400 hover:bg-white/5",
              "text-stone-500 hover:bg-stone-100"
            )}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <DropdownMenu open={attachMenuOpen} onClose={() => setAttachMenuOpen(false)} direction="up" align="left">
            <MenuItem icon={ImageIcon} label="Photo or video" onClick={() => openFilePicker("image/*,video/*")} />
            <MenuItem icon={FileText} label="Document" onClick={() => openFilePicker(".pdf,.doc,.docx,.txt,.zip,.xlsx,.pptx")} />
          </DropdownMenu>
        </div>
        <textarea
          rows={1}
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={`flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl text-sm outline-none ${t(
            "bg-white/5 text-stone-200 placeholder-stone-600",
            "bg-stone-100 text-stone-700 placeholder-stone-400"
          )}`}
        />
        <button
          onClick={sendMessage}
          disabled={!draft.trim() || sending}
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-full cursor-pointer transition-colors"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : editingId ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Long-press action sheet */}
      <BottomSheet open={!!sheetMessage} onClose={() => setSheetMessage(null)} title="Message">
        {sheetMessage && (
          <>
            <div className="flex items-center justify-center gap-2 px-5 pb-3">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(sheetMessage, emoji)}
                  className="w-9 h-9 flex items-center justify-center text-lg rounded-full hover:bg-white/10 cursor-pointer transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <SheetItem icon={Reply} label="Reply" onClick={() => { setReplyTo(sheetMessage); setSheetMessage(null); }} />
            {sheetMessage.message_type === "text" && !sheetMessage.deleted_for_everyone_at && (
              <SheetItem icon={Copy} label="Copy" onClick={() => copyMessage(sheetMessage)} />
            )}
            <SheetItem icon={Star} label="Star" onClick={() => starMessage(sheetMessage)} />
            <SheetItem
              icon={sheetMessage.is_pinned ? PinOff : Pin}
              label={sheetMessage.is_pinned ? "Unpin" : "Pin"}
              onClick={() => togglePin(sheetMessage)}
            />
            {sheetMessage._canEdit && (
              <SheetItem icon={Pencil} label="Edit" onClick={() => startEdit(sheetMessage)} />
            )}
            <SheetItem icon={Trash2} label="Delete for me" danger onClick={() => deleteMessage(sheetMessage, "for_me")} />
            {sheetMessage.sender_id === me?.id && !sheetMessage.deleted_for_everyone_at && (
              <SheetItem icon={Trash2} label="Delete for everyone" danger onClick={() => deleteMessage(sheetMessage, "for_everyone")} />
            )}
          </>
        )}
      </BottomSheet>
    </div>
  );
}

function MessageContent({ msg }) {
  switch (msg.message_type) {
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, remote, variable dimensions; next/image adds no value here
        <img
          src={msg.file_url}
          alt="Shared image"
          className="max-w-full max-h-72 rounded-lg object-cover cursor-pointer"
          onClick={() => window.open(msg.file_url, "_blank")}
        />
      );
    case "video":
      return (
        <video src={msg.file_url} controls className="max-w-full max-h-72 rounded-lg" />
      );
    case "audio":
      return <audio src={msg.file_url} controls className="max-w-[240px]" />;
    case "document":
      return (
        <a
          href={msg.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span className="text-sm truncate flex-1">{msg.content || "Document"}</span>
          <Download className="w-4 h-4 shrink-0 opacity-70" />
        </a>
      );
    default:
      return <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>;
  }
}

function MessageBubble({ msg, isMine, isGroup, onLongPress, t }) {
  const { didTriggerLongPress, ...longPressHandlers } = useLongPress(onLongPress);
  const deleted = !!msg.deleted_for_everyone_at;
  const reactionCounts = useMemo(() => {
    const counts = {};
    (msg.reactions || []).forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    return counts;
  }, [msg.reactions]);
  const seenByOthers = (msg.seen_by || []).length > 0;

  return (
    <div className={`flex mb-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        {...longPressHandlers}
        onDoubleClick={onLongPress}
        className={`group relative max-w-[78%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl cursor-pointer select-none ${
          isMine
            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-md"
            : t("bg-white/10 text-stone-100 rounded-bl-md", "bg-white text-stone-900 rounded-bl-md shadow-sm")
        }`}
      >
        {isGroup && !isMine && msg.sender?.display_name && (
          <p className="text-xs font-semibold text-amber-400 mb-0.5">{msg.sender.display_name}</p>
        )}
        {msg.reply_to && (
          <div
            className={`mb-1.5 px-2 py-1 rounded-lg border-l-2 ${
              isMine ? "bg-white/15 border-white/40" : t("bg-white/5 border-amber-500/50", "bg-stone-100 border-amber-500/50")
            }`}
          >
            <p className="text-xs truncate opacity-80">{msg.reply_to.content}</p>
          </div>
        )}
        {deleted ? (
          <p className="text-sm italic opacity-60">This message was deleted</p>
        ) : (
          <div className="flex items-start gap-1">
            {msg.is_pinned && <Pin className="w-3 h-3 mt-1 shrink-0 opacity-60" />}
            <MessageContent msg={msg} />
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
          {msg.edited_at && <span className="text-[10px] opacity-60">edited</span>}
          <span className="text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
          {isMine && !deleted && (seenByOthers ? <CheckCheck className="w-3.5 h-3.5 opacity-90" /> : <Check className="w-3.5 h-3.5 opacity-70" />)}
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div
            className={`absolute -bottom-3 ${isMine ? "right-2" : "left-2"} flex gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] ${t(
              "bg-stone-800 border border-white/10",
              "bg-white border border-stone-200 shadow-sm"
            )}`}
          >
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span key={emoji}>
                {emoji}
                {count > 1 && <span className="ml-0.5 opacity-70">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
