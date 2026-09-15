import { createElement as h } from "react";
import toast from "react-hot-toast";

// ─── NexTalk-themed toasts with dismiss button ───────────────────────────
// Built with React.createElement so this file stays plain .js (no JSX) and
// imports without extension keep working.

const isDark = () => document.documentElement.classList.contains("dark");

const CHECK_PATH = h("path", {
  d: "M5 12l5 5L20 7",
  stroke: "currentColor",
  strokeWidth: "2.6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

const X_PATH = h("path", {
  d: "M6 6l12 12M18 6L6 18",
  stroke: "currentColor",
  strokeWidth: "2.6",
  strokeLinecap: "round",
});

const svg = (size, child) =>
  h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none" }, child);

const VARIANTS = {
  success: {
    accent: "#10b981",
    bgDark: "rgba(16, 185, 129, 0.12)",
    bgLight: "rgba(16, 185, 129, 0.10)",
    iconNode: () => svg(16, CHECK_PATH),
  },
  error: {
    accent: "#ef4444",
    bgDark: "rgba(239, 68, 68, 0.12)",
    bgLight: "rgba(239, 68, 68, 0.10)",
    iconNode: () => svg(16, X_PATH),
  },
  info: {
    accent: "#3b82f6",
    bgDark: "rgba(59, 130, 246, 0.12)",
    bgLight: "rgba(59, 130, 246, 0.10)",
    iconNode: () => h("span", { style: { fontSize: "14px" } }, "ℹ️"),
  },
  comingSoon: {
    accent: "#f59e0b",
    bgDark: "rgba(245, 158, 11, 0.14)",
    bgLight: "rgba(245, 158, 11, 0.12)",
    iconNode: () => h("span", { style: { fontSize: "14px" } }, "✨"),
  },
  notImplemented: {
    accent: "#a78bfa",
    bgDark: "rgba(167, 139, 250, 0.14)",
    bgLight: "rgba(167, 139, 250, 0.12)",
    iconNode: () => h("span", { style: { fontSize: "14px" } }, "🚧"),
  },
};

const renderCloseButton = (onClick) => {
  const dark = isDark();
  const idleColor = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const hoverBg = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const hoverColor = dark ? "#fafaf9" : "#1c1917";

  return h(
    "button",
    {
      onClick,
      "aria-label": "Dismiss",
      className:
        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all",
      style: { color: idleColor },
      onMouseEnter: (e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.color = hoverColor;
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = idleColor;
      },
    },
    h(
      "svg",
      {
        width: 13,
        height: 13,
        viewBox: "0 0 24 24",
        fill: "none",
        strokeWidth: "2.6",
        stroke: "currentColor",
        strokeLinecap: "round",
      },
      h("path", { d: "M6 6l12 12M18 6L6 18" })
    )
  );
};

const renderToast = (t, message, variant) => {
  const dark = isDark();
  const v = VARIANTS[variant] || VARIANTS.info;

  return h(
    "div",
    {
      className: `pointer-events-auto flex items-center gap-2.5 pl-3 pr-1.5 py-2 rounded-2xl border shadow-lg ${
        t.visible ? "animate-modal-pop" : ""
      }`,
      style: {
        background: dark ? "#1c1917" : "#ffffff",
        borderColor: dark ? "rgba(255,255,255,0.08)" : "#e7e5e4",
        color: dark ? "#fafaf9" : "#1c1917",
        maxWidth: "380px",
        minWidth: "240px",
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? "translateY(0)" : "translateY(-8px)",
        transition: "all 0.18s ease",
      },
    },
    // Icon badge
    h(
      "div",
      {
        className: "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
        style: {
          background: dark ? v.bgDark : v.bgLight,
          color: v.accent,
        },
      },
      v.iconNode()
    ),
    // Message
    h(
      "p",
      { className: "flex-1 text-[13.5px] font-medium leading-snug pr-1 text-left" },
      message
    ),
    // Dismiss button
    renderCloseButton(() => toast.dismiss(t.id))
  );
};

// ─── Public API ────────────────────────────────────────────────────────────

const make = (variant, defaultDuration) => (message, opts = {}) =>
  toast.custom((t) => renderToast(t, message, variant), {
    duration: opts.duration ?? defaultDuration,
    position: opts.position,
  });

export const showSuccess = make("success", 2500);
export const showError = make("error", 3500);
export const showInfo = make("info", 2500);

export const comingSoon = (feature, opts) =>
  make("comingSoon", 2400)(
    feature ? `${feature} coming soon` : "Coming soon!",
    opts
  );

export const notImplemented = (feature, opts) =>
  make("notImplemented", 2400)(
    feature ? `${feature} — not wired up yet` : "Not implemented yet",
    opts
  );

export { toast };
export default toast;
