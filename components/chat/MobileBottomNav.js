"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Users, Compass, Settings } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 cursor-pointer relative group"
      aria-label={label}
    >
      <div className="relative">
        <Icon
          className={`w-5 h-5 transition-all duration-200 ${
            active
              ? "text-amber-500 scale-110"
              : t("text-stone-500 group-active:text-stone-300", "text-stone-400 group-active:text-stone-600")
          }`}
          strokeWidth={active ? 2.5 : 1.8}
        />
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] leading-none tracking-tight transition-colors ${
          active ? "text-amber-500 font-semibold" : t("text-stone-500", "text-stone-400")
        }`}
      >
        {label}
      </span>
    </button>
  );
};

const MobileBottomNav = ({ active = "chats" }) => {
  const { t } = useTheme();
  const router = useRouter();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 flex border-t z-30 pb-[env(safe-area-inset-bottom)] ${t(
        "bg-stone-950 border-white/5",
        "bg-white border-stone-200"
      )}`}
    >
      <NavItem icon={MessageSquare} label="Chats" active={active === "chats"} onClick={() => router.push("/chat")} />
      <NavItem icon={Users} label="Contacts" active={active === "contacts"} onClick={() => router.push("/chat/contacts")} />
      <NavItem icon={Compass} label="Explore" active={active === "explore"} onClick={() => router.push("/chat/explore")} />
      <NavItem icon={Settings} label="Settings" active={active === "settings"} onClick={() => router.push("/chat/settings")} />
    </nav>
  );
};

export default MobileBottomNav;
