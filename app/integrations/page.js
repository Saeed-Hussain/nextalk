import { ArrowRight } from "lucide-react";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";

const integrations = [
  {
    name: "Slack",
    description: "Import your Slack workspace history, channels, and files. Migrate in one click with zero data loss.",
    category: "Migration",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    name: "Google Workspace",
    description: "Connect Google Drive, Calendar, and Meet. Share files and schedule meetings directly from NexTalk.",
    category: "Productivity",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    name: "GitHub",
    description: "Get notifications for PRs, issues, and deployments. Link commits to conversations automatically.",
    category: "Developer",
    color: "bg-stone-100 text-stone-700 border-stone-200",
  },
  {
    name: "Notion",
    description: "Embed Notion pages in channels, get edit notifications, and create pages from chat messages.",
    category: "Productivity",
    color: "bg-stone-100 text-stone-700 border-stone-200",
  },
  {
    name: "Jira",
    description: "Track issues, update ticket status, and link Jira projects to channels for seamless project management.",
    category: "Project Management",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    name: "Figma",
    description: "Preview Figma designs inline, get comment notifications, and share design links with live previews.",
    category: "Design",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    name: "Zapier",
    description: "Connect NexTalk to 5,000+ apps with Zapier. Automate workflows without writing a single line of code.",
    category: "Automation",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    name: "Discord",
    description: "Migrate your Discord server with channels, roles, and message history intact. Easy one-click import.",
    category: "Migration",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  {
    name: "Microsoft Teams",
    description: "Import Teams conversations, channels, and shared files. Continue right where you left off.",
    category: "Migration",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
];

const Integrations = () => (
  <StaticPageLayout
    title="Integrations"
    subtitle="Connect NexTalk with the tools your team already uses. Migrate from anywhere in minutes."
    badge="Product"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {integrations.map((item) => (
        <div
          key={item.name}
          className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.color}`}>
              {item.category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-stone-900 mb-2">{item.name}</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>

    <div className="mt-12 text-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
      <h3 className="text-lg font-semibold text-stone-900 mb-2">Don&apos;t see your tool?</h3>
      <p className="text-sm text-stone-500 mb-5">We&apos;re constantly adding new integrations. Let us know what you need.</p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm"
      >
        Request an integration
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </StaticPageLayout>
);

export default Integrations;
