"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, MessageSquare, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import { useIsOnline, useOnlineIds } from "@/context/PresenceContext";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const PersonCard = ({ user, onMessage, loading }) => {
  const { t } = useTheme();
  const isOnline = useIsOnline(user.id, user.is_online);
  return (
    <div
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${t(
        "bg-white/[0.03] border-white/5",
        "bg-white border-stone-200"
      )}`}
    >
      <Avatar
        initials={getInitials(user.display_name || user.username)}
        color={avatarColor(user.id)}
        size="xl"
        status={isOnline ? "online" : null}
      />
      <div className="text-center min-w-0 w-full">
        <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
          {user.display_name}
        </p>
        <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>@{user.username}</p>
        {user.about && (
          <p className={`mt-1 text-xs truncate ${t("text-stone-500", "text-stone-400")}`}>{user.about}</p>
        )}
      </div>
      <button
        onClick={() => onMessage(user.id)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg disabled:opacity-60 cursor-pointer transition-colors"
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </>
        )}
      </button>
    </div>
  );
};

export default function Explore() {
  const { t } = useTheme();
  const router = useRouter();
  const onlineIds = useOnlineIds();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    api
      .get("/users/all")
      .then((res) => setUsers(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.display_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.about?.toLowerCase().includes(q)
    );
  }, [query, users]);

  const online = filtered.filter((u) => onlineIds.has(u.id)).slice(0, 8);

  const startChat = async (userId) => {
    setStarting(userId);
    try {
      const res = await api.post("/conversations", { type: "dm", user_id: userId });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      toast.error(err.message);
      setStarting(null);
    }
  };

  return (
    <ChatShell active="explore" fullWidth>
      <div className={`min-h-screen ${t("text-stone-100", "text-stone-900")}`}>
        <ChatTopBar title="Explore" subtitle={`Discover ${users.length} people on NexTalk`} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${t(
              "bg-white/5",
              "bg-white border border-stone-200"
            )}`}
          >
            <Search className={`w-4 h-4 ${t("text-stone-500", "text-stone-400")}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className={`flex-1 bg-transparent outline-none text-sm ${t(
                "text-stone-200 placeholder-stone-600",
                "text-stone-700 placeholder-stone-400"
              )}`}
            />
            {query && (
              <button onClick={() => setQuery("")} className={t("text-stone-500", "text-stone-400")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>
                {query ? `No one matches "${query}".` : "No one else has joined NexTalk yet."}
              </p>
            </div>
          ) : (
            <>
              {online.length > 0 && !query && (
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <p className={`text-xs font-semibold uppercase tracking-wider ${t("text-stone-400", "text-stone-500")}`}>
                      Online now
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {online.map((u) => (
                      <PersonCard key={u.id} user={u} onMessage={startChat} loading={starting === u.id} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <p className={`text-xs font-semibold uppercase tracking-wider ${t("text-stone-400", "text-stone-500")}`}>
                    {query ? "Results" : "Everyone on NexTalk"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-8">
                  {filtered.map((u) => (
                    <PersonCard key={u.id} user={u} onMessage={startChat} loading={starting === u.id} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ChatShell>
  );
}
