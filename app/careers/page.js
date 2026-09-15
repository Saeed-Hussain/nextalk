import { MapPin, Clock, ArrowRight, Heart, Globe, Zap, Users } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const perks = [
  { icon: Globe, label: "Remote-First", desc: "Work from anywhere in the world" },
  { icon: Heart, label: "Health & Wellness", desc: "Full medical, dental, and vision" },
  { icon: Zap, label: "Latest Tech", desc: "Top-tier equipment and tools" },
  { icon: Users, label: "Team Retreats", desc: "Annual company meetups globally" },
];

const openings = [
  {
    title: "Senior Frontend Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build the next generation of our web and desktop applications using React, TypeScript, and WebSocket.",
  },
  {
    title: "Backend Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Design and scale our real-time messaging infrastructure handling millions of concurrent connections.",
  },
  {
    title: "Security Engineer",
    team: "Security",
    location: "Remote",
    type: "Full-time",
    description: "Strengthen our encryption protocols, run penetration testing, and build security tooling.",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Shape the user experience of NexTalk across web, desktop, and mobile platforms.",
  },
  {
    title: "DevOps / SRE",
    team: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description: "Keep NexTalk running at 99.99% uptime. Manage Kubernetes clusters, CI/CD pipelines, and monitoring.",
  },
  {
    title: "Technical Writer",
    team: "Product",
    location: "Remote",
    type: "Full-time / Part-time",
    description: "Create developer documentation, API guides, and user-facing help content for NexTalk.",
  },
];

const Careers = () => (
  <StaticPageLayout
    title="Careers"
    subtitle="Join a team that's building the future of how teams communicate. Remote-first, globally distributed."
    badge="Company"
  >
    {/* Perks */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      {perks.map((p) => (
        <div key={p.label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-stone-300 hover:shadow-lg transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
            <p.icon className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">{p.label}</h3>
          <p className="text-xs text-stone-400 mt-1">{p.desc}</p>
        </div>
      ))}
    </div>

    {/* Openings */}
    <h2 className="text-xl font-semibold text-stone-900 mb-5">Open Positions</h2>
    <div className="space-y-4">
      {openings.map((job) => (
        <div
          key={job.title}
          className="group bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">{job.title}</h3>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">{job.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                  <Users className="w-3 h-3" /> {job.team}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="w-3 h-3" /> {job.type}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default Careers;
