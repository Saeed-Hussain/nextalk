"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Users, Compass, Archive, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

const RailButton = ({ icon: Icon, label, active, onClick, badge }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative w-11 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors group ${
        active
          ? t("bg-amber-500/15 text-amber-400", "bg-amber-50 text-amber-600")
          : t(
              "text-stone-400 hover:bg-white/5 hover:text-stone-100",
              "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            )
      }`}
    >
      <Icon className="w-[17px] h-[17px]" />
      {badge > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <span
        className={`absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 ${t(
          "bg-stone-800 text-stone-100 border border-white/10",
          "bg-stone-900 text-white"
        )}`}
      >
        {label}
      </span>
    </button>
  );
};

// Compact desktop-only left rail (14 = 56px, was 16 = 64px in the original).
const LeftRail = ({ active = "chats" }) => {
  const { t, dark, toggle } = useTheme();
  const router = useRouter();
  const { profile } = useUser();

  return (
    <aside
      className={`hidden md:flex flex-col items-center justify-between fixed left-0 top-0 bottom-0 w-14 border-r z-30 py-2.5 ${t(
        "bg-stone-950/95 border-white/5",
        "bg-white border-stone-200"
      )}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <RailButton icon={MessageSquare} label="Chats" active={active === "chats"} onClick={() => router.push("/chat")} />
        <RailButton icon={Users} label="Contacts" active={active === "contacts"} onClick={() => router.push("/chat/contacts")} />
        <RailButton icon={Compass} label="Explore" active={active === "explore"} onClick={() => router.push("/chat/explore")} />
        <RailButton icon={Archive} label="Archived" active={active === "archived"} onClick={() => router.push("/chat/archived")} />
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <RailButton icon={dark ? Sun : Moon} label={dark ? "Light mode" : "Dark mode"} onClick={toggle} />
        <RailButton icon={Settings} label="Settings" active={active === "settings"} onClick={() => router.push("/chat/settings")} />
        <button
          onClick={() => router.push("/chat/settings")}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all"
          title="Profile"
        >
          {getInitials(profile?.display_name)}
        </button>
      </div>
    </aside>
  );
};

export default LeftRail;
