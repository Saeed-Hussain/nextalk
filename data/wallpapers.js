// Chat wallpaper definitions. Each wallpaper exposes `style(dark)` returning a
// CSS style object applied to the messages container. Some wallpapers are
// theme-aware (Default, Glass); solids, gradients, and patterns render the
// same in both modes.

const doodleUrl = (color, opacity = 0.05) => {
  const enc = encodeURIComponent(color);
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='${enc}' fill-opacity='${opacity}'><path d='M20 25 h28 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-18 l-7 7 v-7 h-3 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6 z'/><path d='M115 30 c-4 -8 -16 -6 -16 4 c0 8 16 18 16 18 c0 0 16 -10 16 -18 c0 -10 -12 -12 -16 -4 z'/><path d='M30 110 l45 -10 l-15 25 l-8 -8 l-22 -7 z'/><path d='M125 110 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1 z'/></g></svg>")`;
};

const dotsUrl = (color, opacity = 0.12) => {
  const enc = encodeURIComponent(color);
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='1.4' fill='${enc}' fill-opacity='${opacity}'/></svg>")`;
};

const diamondsUrl = (color, opacity = 0.08) => {
  const enc = encodeURIComponent(color);
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M20 4 L36 20 L20 36 L4 20 Z' fill='none' stroke='${enc}' stroke-opacity='${opacity}' stroke-width='1'/></svg>")`;
};

const flat = (bg) => () => ({ backgroundColor: bg });
const linear = (gradient) => () => ({ background: gradient });

export const WALLPAPERS = [
  // ── Themes (theme-aware) ──
  {
    id: "default",
    name: "Default",
    category: "Themes",
    style: (dark) =>
      dark
        ? { backgroundColor: "#0b141a", backgroundImage: doodleUrl("#ffffff", 0.05) }
        : { backgroundColor: "#efeae2", backgroundImage: doodleUrl("#000000", 0.05) },
  },
  {
    id: "glass",
    name: "Glass",
    category: "Themes",
    style: (dark) =>
      dark
        ? {
            background:
              "radial-gradient(circle at 20% 25%, rgba(245,158,11,0.18), transparent 45%), radial-gradient(circle at 80% 75%, rgba(234,88,12,0.14), transparent 50%), linear-gradient(135deg, #0c0a09 0%, #1c1917 45%, #422006 100%)",
          }
        : {
            background:
              "radial-gradient(circle at 20% 25%, rgba(251,191,36,0.30), transparent 45%), radial-gradient(circle at 80% 75%, rgba(249,115,22,0.22), transparent 50%), linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fed7aa 100%)",
          },
  },

  // ── Solid colors ──
  { id: "solid-cream",    name: "Cream",    category: "Solid", style: flat("#efeae2") },
  { id: "solid-white",    name: "White",    category: "Solid", style: flat("#ffffff") },
  { id: "solid-sage",     name: "Sage",     category: "Solid", style: flat("#dde5d6") },
  { id: "solid-sand",     name: "Sand",     category: "Solid", style: flat("#f4ede0") },
  { id: "solid-slate",    name: "Slate",    category: "Solid", style: flat("#1e293b") },
  { id: "solid-charcoal", name: "Charcoal", category: "Solid", style: flat("#1c1917") },

  // ── Gradients ──
  { id: "grad-sunset",  name: "Sunset",  category: "Gradient", style: linear("linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #e11d48 100%)") },
  { id: "grad-ocean",   name: "Ocean",   category: "Gradient", style: linear("linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)") },
  { id: "grad-aurora",  name: "Aurora",  category: "Gradient", style: linear("linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)") },
  { id: "grad-forest",  name: "Forest",  category: "Gradient", style: linear("linear-gradient(135deg, #10b981 0%, #0d9488 100%)") },
  { id: "grad-berry",   name: "Berry",   category: "Gradient", style: linear("linear-gradient(135deg, #ec4899 0%, #a855f7 100%)") },
  { id: "grad-cosmos",  name: "Cosmos",  category: "Gradient", style: linear("linear-gradient(135deg, #1e3a8a 0%, #6d28d9 50%, #be185d 100%)") },

  // ── Patterns ──
  {
    id: "pat-dots",
    name: "Dots",
    category: "Pattern",
    style: (dark) =>
      dark
        ? { backgroundColor: "#1c1917", backgroundImage: dotsUrl("#ffffff", 0.18) }
        : { backgroundColor: "#fafaf9", backgroundImage: dotsUrl("#000000", 0.18) },
  },
  {
    id: "pat-diamonds",
    name: "Diamonds",
    category: "Pattern",
    style: (dark) =>
      dark
        ? { backgroundColor: "#0c0a09", backgroundImage: diamondsUrl("#ffffff", 0.14) }
        : { backgroundColor: "#fef3c7", backgroundImage: diamondsUrl("#92400e", 0.20) },
  },
];

export const DEFAULT_WALLPAPER_ID = "default";

export const getWallpaper = (id) =>
  WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0];
