"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

// Bottom sheet for action menus (long-press, 3-dot, etc).
// On desktop renders as a floating popover near the trigger; on mobile slides up from bottom.
const BottomSheet = ({ open, onClose, title, children, anchor = "bottom" }) => {
  const { t } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full sm:max-w-sm sm:mx-4 sm:rounded-2xl rounded-t-2xl border ${t(
          "bg-stone-900 border-white/10",
          "bg-white border-stone-200"
        )} shadow-2xl max-h-[80vh] overflow-y-auto scrollbar-hide`}
      >
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className={`w-10 h-1 rounded-full ${t("bg-stone-700", "bg-stone-300")}`} />
        </div>
        {title && (
          <div className={`px-5 py-3 border-b ${t("border-white/10", "border-stone-200")}`}>
            <h3 className={`text-sm font-semibold ${t("text-stone-100", "text-stone-900")}`}>
              {title}
            </h3>
          </div>
        )}
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
};

export const SheetItem = ({ icon: Icon, label, onClick, danger = false, hint }) => {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm transition-colors cursor-pointer ${
        danger
          ? t("text-red-400 hover:bg-red-500/10", "text-red-600 hover:bg-red-50")
          : t("text-stone-200 hover:bg-white/5", "text-stone-700 hover:bg-stone-100")
      }`}
    >
      {Icon && <Icon className="w-4.5 h-4.5 shrink-0" />}
      <span className="flex-1">{label}</span>
      {hint && (
        <span className={`text-xs ${t("text-stone-500", "text-stone-400")}`}>{hint}</span>
      )}
    </button>
  );
};

export default BottomSheet;
