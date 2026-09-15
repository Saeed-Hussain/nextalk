"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ArrowRight, X } from "lucide-react";
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

export default function NewGroup() {
  const { t } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState("members"); // "members" | "details"
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Map());
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get("/contacts")
      .then((res) => setContacts((res.data || []).map((c) => c.contact).filter(Boolean)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (u) => u.display_name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  const toggle = (u) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(u.id)) next.delete(u.id);
      else next.set(u.id, u);
      return next;
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) return toast.error("Give your group a name");
    setCreating(true);
    try {
      const res = await api.post("/conversations", {
        type: "group",
        group_name: groupName.trim(),
        member_ids: [...selected.keys()],
      });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      toast.error(err.message);
      setCreating(false);
    }
  };

  return (
    <ChatShell active="chats" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        {step === "members" ? (
          <>
            <ChatTopBar
              title="Add group members"
              subtitle={selected.size > 0 ? `${selected.size} selected` : "Select from your contacts"}
              right={
                selected.size > 0 ? (
                  <button
                    onClick={() => setStep("details")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : null
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
              </div>
            </div>

            {selected.size > 0 && (
              <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
                {[...selected.values()].map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggle(u)}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <div className="relative">
                      <Avatar initials={getInitials(u.display_name)} color={avatarColor(u.id)} size="md" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-700 text-white flex items-center justify-center">
                        <X className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <span className={`text-[10px] max-w-[48px] truncate ${t("text-stone-400", "text-stone-500")}`}>
                      {u.display_name?.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className={`text-sm ${t("text-stone-500", "text-stone-400")}`}>
                  {contacts.length === 0
                    ? "Add some contacts first to start a group."
                    : `No contacts match "${query}".`}
                </p>
              </div>
            ) : (
              <div>
                {filtered.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggle(u)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer ${t(
                      "hover:bg-white/5",
                      "hover:bg-stone-100"
                    )}`}
                  >
                    <Avatar initials={getInitials(u.display_name)} color={avatarColor(u.id)} size="md" />
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
                        {u.display_name}
                      </p>
                      <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>@{u.username}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected.has(u.id)
                          ? "bg-amber-500 border-amber-500"
                          : t("border-stone-600", "border-stone-300")
                      }`}
                    >
                      {selected.has(u.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <ChatTopBar title="Name your group" onBack={() => setStep("members")} />
            <div className="px-6 py-8 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-6">
                {groupName ? getInitials(groupName) : "?"}
              </div>
              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                maxLength={60}
                className={`w-full max-w-sm text-center text-lg font-semibold bg-transparent outline-none border-b-2 pb-2 ${t(
                  "text-stone-100 border-stone-700 focus:border-amber-500 placeholder-stone-600",
                  "text-stone-900 border-stone-300 focus:border-amber-500 placeholder-stone-400"
                )}`}
              />
              <p className={`mt-4 text-xs ${t("text-stone-500", "text-stone-400")}`}>
                {selected.size} member{selected.size === 1 ? "" : "s"} + you
              </p>
              <button
                onClick={createGroup}
                disabled={creating || !groupName.trim()}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-60 cursor-pointer"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create group <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </ChatShell>
  );
}
