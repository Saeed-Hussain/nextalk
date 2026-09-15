"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare, UserPlus, UserMinus, ShieldOff, ShieldCheck, MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useIsOnline } from "@/context/PresenceContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import DropdownMenu, { MenuItem } from "@/components/chat/DropdownMenu";
import ConfirmModal from "@/components/chat/ConfirmModal";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

export default function UserProfile() {
  const { t } = useTheme();
  const { id } = useParams();
  const router = useRouter();
  const { user: me } = useUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContact, setIsContact] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedRowId, setBlockedRowId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [starting, setStarting] = useState(false);

  const isOnline = useIsOnline(id, profile?.is_online);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the fetch this effect kicks off
    setLoading(true);

    Promise.all([
      api.get(`/users/${id}`),
      api.get("/contacts"),
      api.get("/blocks"),
    ])
      .then(([userRes, contactsRes, blocksRes]) => {
        if (cancelled) return;
        setProfile(userRes.data);
        const contact = (contactsRes.data || []).find((c) => c.contact?.id === id);
        setIsContact(!!contact);
        setContactId(contact?.id || null);
        const block = (blocksRes.data || []).find((b) => b.blocked?.id === id);
        setIsBlocked(!!block);
        setBlockedRowId(block?.id || null);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const startChat = async () => {
    setStarting(true);
    try {
      const res = await api.post("/conversations", { type: "dm", user_id: id });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      toast.error(err.message);
      setStarting(false);
    }
  };

  const toggleContact = async () => {
    try {
      if (isContact) {
        await api.delete(`/contacts/${id}`);
        setIsContact(false);
        toast.success("Removed from contacts");
      } else {
        const res = await api.post("/contacts", { contact_id: id });
        setIsContact(true);
        setContactId(res.data.id);
        toast.success("Added to contacts");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleBlock = async () => {
    setMenuOpen(false);
    try {
      if (isBlocked) {
        await api.delete(`/blocks/${blockedRowId}`);
        setIsBlocked(false);
        toast.success("Unblocked");
      } else {
        const res = await api.post("/blocks", { blocked_id: id });
        setIsBlocked(true);
        setBlockedRowId(res.data.id);
        setIsContact(false);
        toast.success("Blocked");
      }
    } catch (err) {
      toast.error(err.message);
    }
    setConfirmBlock(false);
  };

  if (loading) {
    return (
      <ChatShell active="chats" fullWidth>
        <div className={`min-h-screen flex items-center justify-center ${t("bg-stone-950", "bg-stone-50")}`}>
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      </ChatShell>
    );
  }

  if (!profile) {
    return (
      <ChatShell active="chats" fullWidth>
        <div className={`min-h-screen flex flex-col items-center justify-center ${t("bg-stone-950 text-stone-300", "bg-stone-50 text-stone-700")}`}>
          <p className="mb-4">User not found.</p>
          <button onClick={() => router.push("/chat")} className="text-amber-500 underline cursor-pointer">
            Back to chats
          </button>
        </div>
      </ChatShell>
    );
  }

  const isSelf = me?.id === id;

  return (
    <ChatShell active="chats" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar
          title="Profile"
          right={
            !isSelf && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`p-2 rounded-lg cursor-pointer ${t("text-stone-400 hover:bg-white/5", "text-stone-500 hover:bg-stone-100")}`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <DropdownMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
                  <MenuItem
                    icon={isBlocked ? ShieldCheck : ShieldOff}
                    label={isBlocked ? "Unblock" : "Block"}
                    danger={!isBlocked}
                    onClick={() => (isBlocked ? toggleBlock() : setConfirmBlock(true))}
                  />
                </DropdownMenu>
              </div>
            )
          }
        />

        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <Avatar
            initials={getInitials(profile.display_name || profile.username)}
            color={avatarColor(profile.id)}
            avatarUrl={profile.avatar_url}
            status={isOnline ? "online" : null}
            size="xl"
          />
          <h1 className={`mt-4 text-xl font-bold ${t("text-stone-100", "text-stone-900")}`}>
            {profile.display_name || "Unnamed"}
          </h1>
          <p className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>@{profile.username}</p>
          {profile.about && (
            <p className={`mt-2 text-sm text-center max-w-sm ${t("text-stone-300", "text-stone-600")}`}>
              {profile.about}
            </p>
          )}

          {!isSelf && (
            <div className="flex gap-3 mt-6 w-full max-w-xs">
              <button
                onClick={startChat}
                disabled={starting || isBlocked}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                {starting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" /> Message
                  </>
                )}
              </button>
              <button
                onClick={toggleContact}
                disabled={isBlocked}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50 ${t(
                  "bg-white/5 hover:bg-white/10 text-stone-200",
                  "bg-stone-100 hover:bg-stone-200 text-stone-700"
                )}`}
              >
                {isContact ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isContact ? "Remove" : "Add"}
              </button>
            </div>
          )}

          {isBlocked && (
            <p className="mt-4 text-xs text-red-500">You&apos;ve blocked this user.</p>
          )}
        </div>

        <ConfirmModal
          open={confirmBlock}
          onClose={() => setConfirmBlock(false)}
          onConfirm={toggleBlock}
          variant="danger"
          title={`Block ${profile.display_name || "this user"}?`}
          message="They won't be able to message you or see your online status. They also won't be notified."
          confirmLabel="Block"
          cancelLabel="Cancel"
        />
      </div>
    </ChatShell>
  );
}
