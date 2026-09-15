"use client";

import { Lock, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import NexTalkLogo from "@/components/NexTalkLogo";

const ChatWelcome = () => {
  const { t } = useTheme();
  const router = useRouter();

  return (
    <div
      className={`h-full flex flex-col items-center justify-center px-8 text-center ${t(
        "bg-stone-900/30",
        "bg-stone-100"
      )}`}
    >
      <NexTalkLogo className="w-20 h-20 mb-5" />
      <h2 className={`text-xl font-bold ${t("text-stone-100", "text-stone-900")}`}>
        Nex<span className="text-amber-500">Talk</span> Web
      </h2>
      <p className={`mt-2 text-sm max-w-md ${t("text-stone-400", "text-stone-500")}`}>
        Send and receive messages without keeping your phone online. Use NexTalk on
        up to 4 linked devices and 1 phone at the same time.
      </p>
      <button
        onClick={() => router.push("/chat/explore")}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
      >
        <MessageSquarePlus className="w-4 h-4" />
        Find people to chat with
      </button>
      <div className={`mt-8 flex items-center gap-2 text-xs ${t("text-stone-500", "text-stone-400")}`}>
        <Lock className="w-3 h-3" />
        Your messages are end-to-end encrypted
      </div>
    </div>
  );
};

export default ChatWelcome;
