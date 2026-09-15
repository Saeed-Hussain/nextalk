"use client";

import { MessageCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LeftRail from "./LeftRail";
import MobileBottomNav from "./MobileBottomNav";
import ChatWelcome from "./ChatWelcome";

const SubPagePlaceholder = ({ message = "Select an item to view it here" }) => {
  const { t } = useTheme();
  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center px-8 text-center ${t(
        "bg-stone-900/30",
        "bg-stone-100"
      )}`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${t(
          "bg-white/5",
          "bg-stone-200/60"
        )}`}
      >
        <MessageCircle className={`w-6 h-6 ${t("text-stone-500", "text-stone-400")}`} />
      </div>
      <p className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>{message}</p>
    </div>
  );
};

// Wraps a chat sub-page with the persistent left rail (desktop) and bottom nav (mobile).
const ChatShell = ({
  children,
  active = "chats",
  hideMobileNav = false,
  fullWidth = false,
  rightPane,
  placeholderMessage,
  showRightOnMobile = false,
}) => {
  const { t } = useTheme();

  if (fullWidth) {
    return (
      <div className={`md:flex md:h-screen ${t("bg-stone-950", "bg-stone-50")}`}>
        <LeftRail active={active} />
        <div
          className={`md:ml-14 flex-1 md:h-full md:overflow-y-auto md:scrollbar-hide ${
            hideMobileNav ? "" : "pb-14 md:pb-0"
          }`}
        >
          {children}
        </div>
        {!hideMobileNav && <MobileBottomNav active={active} />}
      </div>
    );
  }

  const leftClass = showRightOnMobile ? "hidden md:block" : "block";
  const rightClass = showRightOnMobile ? "block" : "hidden md:block";

  return (
    <div className={`md:flex md:h-screen ${t("bg-stone-950", "bg-stone-50")}`}>
      <LeftRail active={active} />

      <div
        className={`${leftClass} md:ml-14 md:w-[340px] md:shrink-0 md:h-full md:overflow-y-auto md:scrollbar-hide md:border-r ${t(
          "md:border-white/5",
          "md:border-stone-200"
        )} ${hideMobileNav ? "" : "pb-14 md:pb-0"}`}
      >
        {children}
      </div>

      <div className={`${rightClass} flex-1 h-screen md:h-full md:overflow-hidden`}>
        {rightPane !== undefined ? rightPane : <SubPagePlaceholder message={placeholderMessage} />}
      </div>

      {!hideMobileNav && !showRightOnMobile && <MobileBottomNav active={active} />}
    </div>
  );
};

export { ChatWelcome, SubPagePlaceholder };
export default ChatShell;
