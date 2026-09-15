"use client";

import { useEffect, useState } from "react";
import { ShieldOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import BottomSheet, { SheetItem } from "@/components/chat/BottomSheet";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
};

export default function Blocked() {
  const { t } = useTheme();
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadBlocked = () =>
    api
      .get("/blocks")
      .then((res) => setBlocked(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadBlocked();
  }, []);

  useEffect(() => {
    if (!pickerOpen || !pickerQuery.trim()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for a debounced fetch kicked off by this effect
    setSearching(true);
    const timeout = setTimeout(() => {
      api
        .get(`/users/search?search=${encodeURIComponent(pickerQuery.trim())}`)
        .then((res) => setCandidates(res.data || []))
        .catch((err) => toast.error(err.message))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [pickerOpen, pickerQuery]);

  const handlePickerQueryChange = (value) => {
    setPickerQuery(value);
    if (!value.trim()) setCandidates([]);
  };

  const block = async (blocked_id) => {
    try {
      await api.post("/blocks", { blocked_id });
      toast.success("User blocked");
      setPickerOpen(false);
      setPickerQuery("");
      loadBlocked();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unblock = async (id) => {
    try {
      await api.delete(`/blocks/${id}`);
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <ChatShell active="settings">
    <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
      <ChatTopBar
        title="Blocked contacts"
        subtitle={`${blocked.length} blocked`}
        right={
          <button
            onClick={() => setPickerOpen(true)}
            className={`p-2 rounded-lg cursor-pointer ${t(
              "text-stone-400 hover:bg-white/5",
              "text-stone-500 hover:bg-stone-100"
            )}`}
          >
            <UserPlus className="w-5 h-5" />
          </button>
        }
      />

      <p className={`px-4 pt-3 text-xs ${t("text-stone-400", "text-stone-500")}`}>
        Blocked users can&apos;t message you or see your last seen and online status.
      </p>

      {loading ? (
        <div className="px-6 py-16 text-center">
          <div className="w-6 h-6 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      ) : blocked.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <ShieldOff className={`w-10 h-10 mx-auto mb-3 ${t("text-stone-500", "text-stone-400")}`} />
          <p className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>
            You haven&apos;t blocked anyone.
          </p>
        </div>
      ) : (
        <div className={`mt-3 ${t("bg-stone-900/40", "bg-white")} divide-y ${t("divide-white/5", "divide-stone-100")}`}>
          {blocked.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar
                initials={getInitials(b.blocked?.display_name || b.blocked?.username)}
                color={avatarColor(b.blocked?.id)}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
                  {b.blocked?.display_name}
                </p>
                <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
                  @{b.blocked?.username}
                </p>
              </div>
              <button
                onClick={() => unblock(b.id)}
                className="text-xs font-medium text-amber-500 hover:underline cursor-pointer"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomSheet
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerQuery("");
          setCandidates([]);
        }}
        title="Block contact"
      >
        <div className="px-5 pb-2">
          <input
            autoFocus
            value={pickerQuery}
            onChange={(e) => handlePickerQueryChange(e.target.value)}
            placeholder="Search by username or name..."
            className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${t(
              "bg-white/5 text-stone-200 placeholder-stone-600",
              "bg-stone-100 text-stone-700 placeholder-stone-400"
            )}`}
          />
        </div>
        {searching && (
          <p className={`px-5 py-2 text-xs ${t("text-stone-500", "text-stone-400")}`}>Searching...</p>
        )}
        {!searching && pickerQuery.trim() && candidates.length === 0 && (
          <p className={`px-5 py-2 text-xs ${t("text-stone-500", "text-stone-400")}`}>No users found.</p>
        )}
        {candidates.map((u) => (
          <SheetItem
            key={u.id}
            label={u.display_name}
            hint={`@${u.username}`}
            onClick={() => block(u.id)}
          />
        ))}
      </BottomSheet>
    </div>
    </ChatShell>
  );
}
