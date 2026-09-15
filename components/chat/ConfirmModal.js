"use client";

import { useEffect } from "react";
import { AlertTriangle, Info, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconBgDark: "bg-red-500/15",
    iconBgLight: "bg-red-50",
    iconColor: "text-red-500",
    confirmBtn:
      "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/30",
  },
  warning: {
    icon: AlertTriangle,
    iconBgDark: "bg-amber-500/15",
    iconBgLight: "bg-amber-50",
    iconColor: "text-amber-500",
    confirmBtn:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30",
  },
  info: {
    icon: Info,
    iconBgDark: "bg-blue-500/15",
    iconBgLight: "bg-blue-50",
    iconColor: "text-blue-500",
    confirmBtn:
      "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/30",
  },
  logout: {
    icon: LogOut,
    iconBgDark: "bg-red-500/15",
    iconBgLight: "bg-red-50",
    iconColor: "text-red-500",
    confirmBtn:
      "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/30",
  },
  delete: {
    icon: Trash2,
    iconBgDark: "bg-red-500/15",
    iconBgLight: "bg-red-50",
    iconColor: "text-red-500",
    confirmBtn:
      "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/30",
  },
};

// Reusable confirmation modal — matches NexTalk theme.
// Centered card on desktop, slides up from bottom on mobile.
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "warning" | "info" | "logout" | "delete"
  icon: CustomIcon,
}) => {
  const { t } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const v = VARIANTS[variant] || VARIANTS.danger;
  const Icon = CustomIcon || v.icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Card — slide up on mobile, pop on desktop */}
      <div
        className={`relative w-full sm:max-w-sm sm:mx-4 sm:rounded-2xl rounded-t-2xl border shadow-2xl animate-modal-slide-up sm:animate-modal-pop origin-bottom sm:origin-center ${t(
          "bg-stone-900 border-white/10",
          "bg-white border-stone-200"
        )}`}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className={`w-10 h-1 rounded-full ${t("bg-stone-700", "bg-stone-300")}`} />
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              t(v.iconBgDark, v.iconBgLight)
            }`}
          >
            <Icon className={`w-7 h-7 ${v.iconColor}`} />
          </div>

          <h3 className={`text-lg font-bold ${t("text-stone-100", "text-stone-900")}`}>
            {title}
          </h3>

          {message && (
            <p
              className={`mt-2 text-sm leading-relaxed ${t(
                "text-stone-400",
                "text-stone-500"
              )}`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-5 sm:pb-4 flex gap-2.5">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${t(
              "bg-white/5 text-stone-200 hover:bg-white/10",
              "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer ${v.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
