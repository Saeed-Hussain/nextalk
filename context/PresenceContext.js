"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api/client";

const PresenceContext = createContext(null);

// Replaces the original Socket.IO presence.events.js. One shared Presence
// channel for the whole app (not per-conversation) — every signed-in client
// tracks itself on it, and Supabase Realtime handles join/leave detection
// automatically (including on tab close / connection drop), which is more
// reliable than the original's approach of the client explicitly emitting
// online/offline events.
export const PresenceProvider = ({ children }) => {
  const { user } = useUser();
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase.channel("presence:online", {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    const syncOnlineIds = () => {
      const state = channel.presenceState();
      setOnlineIds(new Set(Object.keys(state)));
    };

    channel
      .on("presence", { event: "sync" }, syncOnlineIds)
      .on("presence", { event: "join" }, syncOnlineIds)
      .on("presence", { event: "leave" }, syncOnlineIds)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
          api.put("/users/me/presence", { is_online: true }).catch(() => {});
        }
      });

    const markOffline = () => {
      api.put("/users/me/presence", { is_online: false }).catch(() => {});
    };
    window.addEventListener("beforeunload", markOffline);

    return () => {
      window.removeEventListener("beforeunload", markOffline);
      markOffline();
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ onlineIds }}>{children}</PresenceContext.Provider>
  );
};

// Live online status for one user. Falls back to whatever the caller
// already has from the DB (e.g. profile.is_online from initial fetch)
// until Presence syncs, so there's no flash of "offline" on first render.
export const useIsOnline = (userId, fallback = false) => {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("useIsOnline must be used inside PresenceProvider");
  if (!userId) return false;
  return ctx.onlineIds.size > 0 ? ctx.onlineIds.has(userId) : fallback;
};

export const useOnlineIds = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("useOnlineIds must be used inside PresenceProvider");
  return ctx.onlineIds;
};
