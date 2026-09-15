"use client";

import { useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import NexTalkLogo from "@/components/NexTalkLogo";

// Served by the service worker when a navigation fails with no cached copy.
// Client component because it watches the connection and recovers on its own
// once the network is back, rather than leaving the user on a dead end.
const Offline = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (online) window.location.reload();
  }, [online]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex justify-center mb-8">
          <NexTalkLogo className="w-20 h-20" animated />
        </div>

        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <WifiOff className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-white">You&apos;re offline</h2>
        <p className="mt-3 text-stone-400 leading-relaxed">
          NexTalk needs a connection to load your conversations. We&apos;ll bring
          you straight back as soon as you&apos;re reconnected.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            Try again
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
            <span
              className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-stone-600"}`}
            />
            <p className="text-stone-500 text-sm">
              {online ? "Back online, reloading..." : "Waiting for a connection..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
