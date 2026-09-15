"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Lock, Bell, MessageSquare, HelpCircle, LogOut, Sparkles,
  Database, KeyRound, Languages, Palette, Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useWallpaper } from "@/context/WallpaperContext";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";
import { avatarColor } from "@/lib/avatarColor";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import ConfirmModal from "@/components/chat/ConfirmModal";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const comingSoon = () => toast("Coming soon", { icon: "🚧" });

export default function Settings() {
  const { t, dark, toggle } = useTheme();
  const { wallpaper } = useWallpaper();
  const { user, profile } = useUser();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => {});
    // The service worker caches rendered pages, so drop them on the way out
    // rather than leaving this account's UI on disk for the next sign-in.
    navigator.serviceWorker?.controller?.postMessage("CLEAR_CACHES");
    router.push("/login");
    router.refresh();
  };

  return (
    <ChatShell active="settings" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="Settings" />

        <button
          onClick={() => router.push("/chat/settings/profile")}
          className={`w-full flex items-center gap-3 px-4 py-4 cursor-pointer ${t(
            "bg-stone-900/40 hover:bg-white/5",
            "bg-white hover:bg-stone-50"
          )}`}
        >
          <Avatar
            initials={getInitials(profile?.display_name || profile?.username)}
            color={avatarColor(user?.id)}
            avatarUrl={profile?.avatar_url}
            size="lg"
          />
          <div className="flex-1 text-left min-w-0">
            <p className={`text-base font-semibold ${t("text-stone-100", "text-stone-900")}`}>
              {profile?.display_name || profile?.username || "Set up your profile"}
            </p>
            <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
              {profile?.about || `@${profile?.username || "username"}`}
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${t("text-stone-600", "text-stone-300")}`} />
        </button>

        <Section>
          <Row
            icon={Lock}
            label="Privacy"
            hint="Last seen, photo, about, read receipts"
            onClick={() => router.push("/chat/settings/privacy")}
          />
          <Row
            icon={ImageIcon}
            label="Chat wallpaper"
            hint={wallpaper.name}
            onClick={() => router.push("/chat/settings/wallpaper")}
          />
          <Row icon={MessageSquare} label="Chats" hint="Theme, history" onClick={comingSoon} />
          <Row icon={Bell} label="Notifications" hint="Messages, groups, calls" onClick={comingSoon} />
          <Row icon={Database} label="Storage and data" hint="Network usage, auto-download" onClick={comingSoon} />
        </Section>

        <Section>
          <Row icon={Palette} label="Theme" hint={dark ? "Dark" : "Light"} onClick={toggle} />
          <Row icon={Languages} label="App language" hint="English" onClick={comingSoon} />
        </Section>

        <Section>
          <Row icon={KeyRound} label="Account" hint={user?.email} onClick={comingSoon} />
          <Row icon={Sparkles} label="What's new" onClick={() => router.push("/changelog")} />
          <Row icon={HelpCircle} label="Help" hint="Help center, contact us" onClick={() => router.push("/contact")} />
        </Section>

        <Section>
          <Row icon={LogOut} label="Log out" danger onClick={() => setLogoutOpen(true)} />
        </Section>

        <p className={`text-center py-6 text-xs ${t("text-stone-500", "text-stone-400")}`}>
          NexTalk · Built with{" "}
          <span className="text-rose-500">♡</span> in Next.js
        </p>

        <ConfirmModal
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
          variant="logout"
          title="Log out of NexTalk?"
          message="You'll need to sign in again to access your messages and contacts."
          confirmLabel="Log out"
          cancelLabel="Stay signed in"
        />
      </div>
    </ChatShell>
  );
}

const Section = ({ children }) => {
  const { t } = useTheme();
  return (
    <div className={`mt-2 ${t("bg-stone-900/40", "bg-white")} divide-y ${t("divide-white/5", "divide-stone-100")}`}>
      {children}
    </div>
  );
};

const Row = ({ icon: Icon, label, hint, danger, onClick }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${t(
        "hover:bg-white/5",
        "hover:bg-stone-50"
      )}`}
    >
      <Icon className={`w-5 h-5 ${danger ? "text-red-500" : t("text-stone-400", "text-stone-500")}`} />
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm ${danger ? "text-red-500" : t("text-stone-100", "text-stone-900")}`}>{label}</p>
        {hint && <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>{hint}</p>}
      </div>
      <ChevronRight className={`w-4 h-4 ${t("text-stone-600", "text-stone-300")}`} />
    </button>
  );
};
