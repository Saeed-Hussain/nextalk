"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import NexTalkLogo from "@/components/NexTalkLogo";

const DISMISSED_KEY = "nextalk:install-dismissed";

// Chromium fires beforeinstallprompt and lets us trigger the native dialog.
// Safari/iOS never fires it, so there is no banner there; users install via
// Share > Add to Home Screen, which we cannot script.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed and launched from the home screen.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Private mode or blocked storage. Treat as not dismissed.
    }
    if (dismissed) return;

    const onBeforeInstall = (e) => {
      // Chrome shows its own mini-infobar unless the event is cancelled.
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Nothing to do; the banner simply returns next visit.
    }
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    // The event can only be used once, whatever the user chose.
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 sm:left-auto sm:right-4 sm:w-80 animate-fade-in-up">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-stone-900/95 backdrop-blur-sm p-3 shadow-2xl">
        <NexTalkLogo className="w-10 h-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install NexTalk</p>
          <p className="text-xs text-stone-400">Faster access, own window, works offline.</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-semibold text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1.5 text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
