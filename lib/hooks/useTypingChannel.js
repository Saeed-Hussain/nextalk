"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STOP_DELAY_MS = 2500; // auto-clear a typing indicator if no stop event arrives

// One Broadcast channel per conversation, event "typing". No DB writes —
// this is purely ephemeral UI state, exactly the kind of thing Realtime
// Broadcast is for (as opposed to Postgres Changes, which is for durable
// row changes like messages).
export function useTypingChannel(conversationId, currentUserId) {
  const [typingUserIds, setTypingUserIds] = useState(() => new Set());
  const channelRef = useRef(null);
  const clearTimers = useRef(new Map());

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;
    const timers = clearTimers.current; // capture once; same Map for the whole effect lifetime

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === currentUserId) return;

        setTypingUserIds((prev) => {
          const next = new Set(prev);
          if (payload.typing) next.add(payload.user_id);
          else next.delete(payload.user_id);
          return next;
        });

        clearTimeout(timers.get(payload.user_id));
        if (payload.typing) {
          const timer = setTimeout(() => {
            setTypingUserIds((prev) => {
              const next = new Set(prev);
              next.delete(payload.user_id);
              return next;
            });
          }, STOP_DELAY_MS);
          timers.set(payload.user_id, timer);
        }
      })
      .subscribe();

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const sendTyping = (typing) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId, typing },
    });
  };

  return { typingUserIds, sendTyping };
}
