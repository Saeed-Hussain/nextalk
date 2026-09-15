"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

// Anchored dropdown menu (WhatsApp-style 3-dot menu).
// Render as a sibling of the trigger inside a `relative` container.
// direction="up" opens above the trigger instead of below — needed for
// triggers pinned near the bottom of the viewport (e.g. the composer's
// attachment button), where the default downward menu would render
// off-screen below the visible area.
const DropdownMenu = ({ open, onClose, children, align = "right", direction = "down", className = "" }) => {
  const { t } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute z-50 min-w-[220px] rounded-xl border shadow-xl py-1.5 ${
          direction === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        } ${align === "right" ? "right-0" : "left-0"} ${t(
          "bg-stone-900 border-white/10",
          "bg-white border-stone-200"
        )} ${className}`}
      >
        {children}
      </div>
    </>
  );
};

export const MenuItem = ({ icon: Icon, label, onClick, hint, danger = false }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm cursor-pointer transition-colors ${
        danger
          ? t("text-red-400 hover:bg-red-500/10", "text-red-600 hover:bg-red-50")
          : t("text-stone-200 hover:bg-white/5", "text-stone-700 hover:bg-stone-100")
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{label}</span>
      {hint && (
        <span className={`text-xs ${t("text-stone-500", "text-stone-400")}`}>{hint}</span>
      )}
    </button>
  );
};

export default DropdownMenu;
