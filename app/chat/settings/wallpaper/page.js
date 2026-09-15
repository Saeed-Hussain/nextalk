"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useWallpaper } from "@/context/WallpaperContext";
import { WALLPAPERS } from "@/data/wallpapers";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";

const CATEGORY_ORDER = ["Themes", "Solid", "Gradient", "Pattern"];

export default function ChatWallpaper() {
  const { t, dark } = useTheme();
  const { wallpaperId, setWallpaperId, wallpaper } = useWallpaper();

  const grouped = useMemo(() => {
    const out = {};
    for (const w of WALLPAPERS) {
      (out[w.category] = out[w.category] || []).push(w);
    }
    return out;
  }, []);

  return (
    <ChatShell active="settings" fullWidth>
    <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
      <ChatTopBar title="Chat wallpaper" subtitle={wallpaper.name} />

      {/* Live preview strip */}
      <section className="px-4 pt-4">
        <div
          style={wallpaper.style(dark)}
          className={`relative h-36 rounded-2xl border overflow-hidden ${t("border-white/10", "border-stone-200")}`}
        >
          <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2">
            <div className="self-start max-w-[70%] px-3 py-1.5 rounded-2xl rounded-bl-md bg-white/95 text-stone-900 text-xs shadow-sm">
              Hey! How&apos;s the new wallpaper?
            </div>
            <div className="self-end max-w-[70%] px-3 py-1.5 rounded-2xl rounded-br-md bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs shadow-sm">
              Looks great 🔥
            </div>
          </div>
        </div>
        <p className={`mt-2 text-xs ${t("text-stone-400", "text-stone-500")}`}>
          Tap a wallpaper to apply it instantly to all your chats.
        </p>
      </section>

      {/* Picker grid */}
      <div className="px-4 py-4 space-y-6 pb-12">
        {CATEGORY_ORDER.filter((c) => grouped[c]).map((category) => (
          <section key={category}>
            <h2 className={`text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 px-1 ${t("text-stone-500", "text-stone-400")}`}>
              {category === "Solid" ? "Solid colors" : category === "Pattern" ? "Patterns" : category === "Gradient" ? "Gradients" : category}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {grouped[category].map((w) => {
                const selected = w.id === wallpaperId;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWallpaperId(w.id)}
                    style={w.style(dark)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selected
                        ? "border-amber-500 shadow-lg shadow-amber-500/30 scale-[1.02]"
                        : t(
                            "border-white/10 hover:border-white/25",
                            "border-stone-200 hover:border-stone-300"
                          )
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <span className={`absolute inset-x-0 bottom-0 px-2 py-1.5 text-[11px] font-semibold ${t("bg-stone-950/65 text-white", "bg-white/85 text-stone-900")}`}>
                      {w.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
    </ChatShell>
  );
}
