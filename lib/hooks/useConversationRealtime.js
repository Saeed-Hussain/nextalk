"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Subscribes to INSERT/UPDATE on `messages` for one conversation. This is
// the direct replacement for the original Socket.IO message.events.js —
// instead of the server manually `io.to(room).emit()`-ing on send, Postgres
// itself notifies every subscribed client the moment a row changes.
export function useConversationRealtime(conversationId, { onInsert, onUpdate }) {
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onInsertRef.current?.(payload.new)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onUpdateRef.current?.(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);
}
