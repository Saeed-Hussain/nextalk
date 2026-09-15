import { Zap, Shield, Bug, Sparkles } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const entries = [
  {
    version: "0.9.0",
    date: "April 10, 2026",
    tag: "Latest",
    tagColor: "bg-amber-50 text-amber-600 border-amber-200",
    changes: [
      { type: "feature", icon: Sparkles, text: "Public Beta launch — NexTalk is now open to everyone" },
      { type: "feature", icon: Zap, text: "Real-time typing indicators across all platforms" },
      { type: "feature", icon: Shield, text: "Two-factor authentication with hardware security keys" },
      { type: "fix", icon: Bug, text: "Fixed message ordering issue in high-traffic channels" },
    ],
  },
  {
    version: "0.8.2",
    date: "March 25, 2026",
    changes: [
      { type: "feature", icon: Sparkles, text: "Voice messages with automatic transcription" },
      { type: "feature", icon: Zap, text: "Threaded replies in group conversations" },
      { type: "fix", icon: Bug, text: "Resolved notification delays on Android devices" },
      { type: "fix", icon: Bug, text: "Fixed file upload progress not displaying correctly" },
    ],
  },
  {
    version: "0.8.0",
    date: "March 10, 2026",
    changes: [
      { type: "feature", icon: Sparkles, text: "Video and voice calls with screen sharing" },
      { type: "feature", icon: Sparkles, text: "Channel-level notification preferences" },
      { type: "feature", icon: Zap, text: "Inline file previews for images, PDFs, and documents" },
      { type: "fix", icon: Bug, text: "Fixed search not returning results for older messages" },
    ],
  },
  {
    version: "0.7.0",
    date: "February 20, 2026",
    changes: [
      { type: "feature", icon: Sparkles, text: "End-to-end encryption for all message types" },
      { type: "feature", icon: Sparkles, text: "One-click migration from Slack, Discord, and Teams" },
      { type: "feature", icon: Zap, text: "Smart notification system with AI-powered priorities" },
    ],
  },
  {
    version: "0.6.0",
    date: "February 1, 2026",
    changes: [
      { type: "feature", icon: Sparkles, text: "Initial closed beta release" },
      { type: "feature", icon: Sparkles, text: "Direct messaging and group channels" },
      { type: "feature", icon: Sparkles, text: "Cross-platform support (Web, Desktop, Mobile)" },
    ],
  },
];

const Changelog = () => (
  <StaticPageLayout
    title="Changelog"
    subtitle="Follow our progress as we build the next generation of team communication."
    badge="Product"
  >
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-stone-200 hidden sm:block" />

      <div className="space-y-8">
        {entries.map((entry) => (
          <div key={entry.version} className="relative flex gap-6">
            {/* Timeline dot */}
            <div className="hidden sm:flex shrink-0 w-10 items-start justify-center pt-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 border-4 border-stone-50 ring-1 ring-amber-200 z-10" />
            </div>

            <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-lg font-bold text-stone-900">v{entry.version}</span>
                <span className="text-sm text-stone-400">{entry.date}</span>
                {entry.tag && (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${entry.tagColor}`}>
                    {entry.tag}
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      change.type === "fix"
                        ? "bg-rose-50 border border-rose-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}>
                      <change.icon className={`w-3.5 h-3.5 ${
                        change.type === "fix" ? "text-rose-500" : "text-amber-600"
                      }`} />
                    </div>
                    <span className="text-sm text-stone-600 leading-relaxed pt-0.5">{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  </StaticPageLayout>
);

export default Changelog;
