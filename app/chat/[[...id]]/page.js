"use client";

import { useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import LeftRail from "@/components/chat/LeftRail";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import ChatListPane from "@/components/chat/ChatListPane";
import ChatWelcome from "@/components/chat/ChatWelcome";
import ChatThread from "@/components/chat/ChatThread";

export default function ChatHome() {
  const params = useParams();
  const id = params?.id?.[0]; // optional catch-all: undefined on /chat, first segment on /chat/:id
  const { t } = useTheme();
  const showThread = !!id;

  return (
    <div className={`h-screen flex ${t("bg-stone-950", "bg-stone-50")}`}>
      <LeftRail active="chats" />

      <aside
        className={`${
          showThread ? "hidden md:flex" : "flex"
        } md:ml-14 w-full md:w-[340px] md:shrink-0 md:border-r ${t(
          "md:border-white/5",
          "md:border-stone-200"
        )} relative flex-col overflow-hidden`}
      >
        <ChatListPane />
      </aside>

      <main className={`${showThread ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {showThread ? <ChatThread conversationId={id} /> : <ChatWelcome />}
      </main>

      {!showThread && <MobileBottomNav active="chats" />}
    </div>
  );
}
