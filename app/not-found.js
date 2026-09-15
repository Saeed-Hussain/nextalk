import Link from "next/link";
import { Home, ArrowLeft, MessageCircle } from "lucide-react";
import NexTalkLogo from "@/components/NexTalkLogo";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <NexTalkLogo className="w-20 h-20" animated />
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 leading-none">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-4 text-2xl font-semibold text-white">Page not found</h2>
        <p className="mt-3 text-stone-400 leading-relaxed">
          Looks like this conversation doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/chat"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Go to Chat
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/10 text-stone-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </Link>
        </div>

        {/* Decorative chat bubble */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <p className="text-stone-500 text-sm">This page has left the chat...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
