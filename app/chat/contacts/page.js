"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import { useOnlineIds } from "@/context/PresenceContext";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
};

export default function Contacts() {
  const { t } = useTheme();
  const onlineIds = useOnlineIds();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/contacts")
      .then((res) => {
        if (!cancelled) setContacts(res.data || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.contact?.display_name?.toLowerCase().includes(q) ||
        c.contact?.username?.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      const name = c.contact?.display_name || c.contact?.username || "?";
      const key = name[0].toUpperCase();
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return Object.keys(map)
      .sort()
      .map((letter) => ({
        letter,
        contacts: map[letter].sort((a, b) =>
          (a.contact?.display_name || "").localeCompare(b.contact?.display_name || "")
        ),
      }));
  }, [filtered]);

  return (
    <ChatShell active="contacts">
    <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
      <ChatTopBar
        title="Contacts"
        subtitle={`${contacts.length} contacts`}
        right={
          <button
            onClick={() => router.push("/chat/new")}
            className={`p-2 rounded-lg cursor-pointer ${t(
              "text-stone-400 hover:bg-white/5",
              "text-stone-500 hover:bg-stone-100"
            )}`}
          >
            <UserPlus className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${t("bg-white/5", "bg-stone-100")}`}>
          <Search className={`w-4 h-4 ${t("text-stone-500", "text-stone-400")}`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
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
      </div>

      {loading ? (
        <div className="px-6 py-16 text-center">
          <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>
            {query ? `No contacts match "${query}".` : "No contacts yet."}
          </p>
          <button
            onClick={() => router.push("/chat/new")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Find people
          </button>
        </div>
      ) : (
        <div className="pb-12">
          {grouped.map((group) => (
            <div key={group.letter}>
              <div
                className={`sticky top-14 px-4 py-1 text-xs font-bold ${t(
                  "bg-stone-950/90 text-amber-500",
                  "bg-stone-50/90 text-amber-600"
                )}`}
              >
                {group.letter}
              </div>
              {group.contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/chat/profile/${c.contact.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer ${t(
                    "hover:bg-white/5",
                    "hover:bg-stone-100"
                  )}`}
                >
                  <Avatar
                    initials={getInitials(c.contact?.display_name || c.contact?.username)}
                    color={avatarColor(c.contact?.id)}
                    status={onlineIds.has(c.contact?.id) ? "online" : "offline"}
                    size="md"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
                      {c.nickname || c.contact?.display_name}
                    </p>
                    <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
                      @{c.contact?.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
    </ChatShell>
  );
}
