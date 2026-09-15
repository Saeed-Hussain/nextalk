import { Zap, Shield, Users, Globe, Lock, Smartphone, MessageCircle, Video, FileText, Search, Bell, Mic } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const features = [
  {
    icon: Zap, title: "Real-Time Messaging", color: "amber",
    description: "Messages are delivered instantly with zero lag. Whether you're chatting one-on-one or in a group of hundreds, every message arrives in real time across all your devices.",
  },
  {
    icon: Shield, title: "End-to-End Encryption", color: "blue",
    description: "Every message, file, and call is protected with military-grade encryption. Only the sender and intended recipients can read the content — not even NexTalk has access.",
  },
  {
    icon: Users, title: "Group Conversations", color: "emerald",
    description: "Create channels for teams, projects, or topics. Organize discussions with threads, pin important messages, and keep everyone aligned without email chains.",
  },
  {
    icon: Globe, title: "Cross-Platform Sync", color: "purple",
    description: "Start a conversation on your laptop and continue seamlessly on your phone. NexTalk works on Web, Windows, macOS, Linux, iOS, and Android with perfect sync.",
  },
  {
    icon: Lock, title: "Privacy First", color: "rose",
    description: "We collect the minimum data needed to operate. No ads, no data selling, no tracking. Your conversations are yours and yours alone.",
  },
  {
    icon: Smartphone, title: "Smart Notifications", color: "cyan",
    description: "AI-powered notification system learns your priorities. Get alerted for what matters, silence the noise, and set custom schedules for focus time.",
  },
  {
    icon: Video, title: "Video & Voice Calls", color: "amber",
    description: "Jump from chat to a crystal-clear video or voice call with one click. Screen sharing, background blur, and noise cancellation built right in.",
  },
  {
    icon: FileText, title: "File Sharing", color: "blue",
    description: "Share documents, images, videos, and any file type directly in chat. Preview files inline, organize with folders, and search across all shared content.",
  },
  {
    icon: Search, title: "Powerful Search", color: "emerald",
    description: "Find any message, file, or conversation instantly. Filter by date, person, channel, or file type. Your entire communication history at your fingertips.",
  },
  {
    icon: Bell, title: "Custom Alerts", color: "purple",
    description: "Set per-channel notification preferences, keyword alerts, and scheduled quiet hours. Stay informed without being overwhelmed.",
  },
  {
    icon: MessageCircle, title: "Threaded Replies", color: "rose",
    description: "Keep conversations organized with threaded replies. Discuss topics in-depth without cluttering the main channel feed.",
  },
  {
    icon: Mic, title: "Voice Messages", color: "cyan",
    description: "Record and send voice messages when typing isn't convenient. Messages are transcribed automatically for easy searching and accessibility.",
  },
];

const colorMap = {
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-200" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-200" },
};

const Features = () => (
  <StaticPageLayout
    title="Features"
    subtitle="Everything you need for seamless team communication — and nothing you don't."
    badge="Product"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((f) => {
        const c = colorMap[f.color];
        return (
          <div
            key={f.title}
            className="group bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
              <f.icon className={`w-5 h-5 ${c.icon}`} />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-2">{f.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{f.description}</p>
          </div>
        );
      })}
    </div>
  </StaticPageLayout>
);

export default Features;
