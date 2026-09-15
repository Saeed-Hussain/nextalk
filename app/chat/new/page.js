"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UsersRound, UserPlus, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import { useIsOnline } from "@/context/PresenceContext";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

export default function NewChat() {
  const { t } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [everyone, setEveryone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/contacts"), api.get("/users/all")])
      .then(([contactsRes, usersRes]) => {
        setContacts(contactsRes.data || []);
        setEveryone(usersRes.data || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const contactIds = useMemo(() => new Set(contacts.map((c) => c.contact?.id)), [contacts]);
  const others = useMemo(() => everyone.filter((u) => !contactIds.has(u.id)), [everyone, contactIds]);

  const matches = (u, q) =>
    u.display_name?.toLowerCase().includes(q) ||
    u.username?.toLowerCase().includes(q) ||
    u.about?.toLowerCase().includes(q);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = contacts.map((c) => c.contact).filter(Boolean);
    return q ? list.filter((u) => matches(u, q)) : list;
  }, [query, contacts]);

  const filteredOthers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? others.filter((u) => matches(u, q)) : others;
  }, [query, others]);

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
    <ChatShell active="chats">
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="New chat" subtitle={`${everyone.length} users on NexTalk`} />

        <div className="px-3 py-2.5">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${t("bg-white/5", "bg-stone-100")}`}>
            <Search className={`w-3.5 h-3.5 ${t("text-stone-500", "text-stone-400")}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username..."
              className={`flex-1 bg-transparent outline-none text-[13px] ${t(
                "text-stone-200 placeholder-stone-600",
                "text-stone-700 placeholder-stone-400"
              )}`}
            />
            {query && (
              <button onClick={() => setQuery("")} className={t("text-stone-500", "text-stone-400")}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-2 pb-1">
          <ActionRow
            icon={UsersRound}
            label="New group"
            subtitle="Start a chat with multiple people"
            onClick={() => router.push("/chat/new-group")}
          />
          <ActionRow
            icon={UserPlus}
            label="New contact"
            subtitle="Save someone to your contacts"
            onClick={() => router.push("/chat/contacts")}
          />
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          </div>
        ) : (
          <>
            {filteredContacts.length > 0 && (
              <Section title="Contacts on NexTalk">
                {filteredContacts.map((u) => (
                  <UserRow key={u.id} user={u} loading={starting === u.id} onClick={() => startChat(u.id)} />
                ))}
              </Section>
            )}

            {filteredOthers.length > 0 && (
              <Section title="Discover people on NexTalk" subtitle="Anyone on NexTalk can be messaged." icon={Sparkles}>
                {filteredOthers.map((u) => (
                  <UserRow key={u.id} user={u} loading={starting === u.id} onClick={() => startChat(u.id)} />
                ))}
              </Section>
            )}

            {filteredContacts.length === 0 && filteredOthers.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>
                  No users match &quot;{query}&quot;.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ChatShell>
  );
}

const Section = ({ title, subtitle, icon: Icon, children }) => {
  const { t } = useTheme();
  return (
    <div className="mt-2">
      <div className="px-3 pb-1.5 flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-amber-500" />}
        <p className={`text-[10.5px] font-semibold uppercase tracking-wider ${t("text-stone-400", "text-stone-500")}`}>
          {title}
        </p>
      </div>
      {subtitle && <p className={`px-3 pb-1.5 text-xs ${t("text-stone-500", "text-stone-400")}`}>{subtitle}</p>}
      <div>{children}</div>
    </div>
  );
};

const ActionRow = ({ icon: Icon, label, subtitle, onClick }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors ${t(
        "hover:bg-white/5",
        "hover:bg-stone-100"
      )}`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-[13px] font-semibold ${t("text-stone-100", "text-stone-900")}`}>{label}</p>
        <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>{subtitle}</p>
      </div>
    </button>
  );
};

const UserRow = ({ user, onClick, loading }) => {
  const { t } = useTheme();
  const isOnline = useIsOnline(user.id, user.is_online);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors disabled:opacity-60 ${t(
        "hover:bg-white/5",
        "hover:bg-stone-100"
      )}`}
    >
      <Avatar
        initials={getInitials(user.display_name || user.username)}
        color={avatarColor(user.id)}
        size="md"
        status={isOnline ? "online" : null}
      />
      <div className="flex-1 text-left min-w-0">
        <p className={`text-[13px] font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
          {user.display_name}
        </p>
        <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
          {user.about || `@${user.username}`}
        </p>
      </div>
      {loading && (
        <div className="w-4 h-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin shrink-0" />
      )}
    </button>
  );
};
