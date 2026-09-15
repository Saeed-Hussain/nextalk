"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Reusable top bar for all chat sub-pages (Settings, Contacts, NewChat, etc.)
const ChatTopBar = ({ title, subtitle, onBack, right = null, sticky = true }) => {
  const router = useRouter();
  const { t, dark, toggle } = useTheme();
  const handleBack = onBack || (() => router.back());

  return (
    <header
      className={`${sticky ? "sticky top-0 z-30" : ""} border-b backdrop-blur-xl ${t(
        "bg-stone-950/80 border-white/5",
        "bg-white/85 border-stone-200"
      )}`}
    >
      <div className="flex items-center gap-2 px-3 h-14">
        <button
          onClick={handleBack}
          className={`p-2 rounded-lg cursor-pointer ${t(
            "text-stone-300 hover:bg-white/5",
            "text-stone-700 hover:bg-stone-100"
          )}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className={`text-base font-semibold truncate ${t("text-stone-100", "text-stone-900")}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs truncate ${t("text-stone-400", "text-stone-500")}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {right}
          <button
            onClick={toggle}
            className={`p-2 rounded-lg cursor-pointer ${t(
              "text-stone-400 hover:text-amber-400 hover:bg-white/5",
              "text-stone-500 hover:text-amber-600 hover:bg-stone-100"
            )}`}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatTopBar;
