import { Heart, Target, Users, Zap } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const values = [
  {
    icon: Heart,
    title: "Privacy by Default",
    description: "We believe privacy is a fundamental right, not a premium feature. Every product decision starts with asking: does this protect our users?",
  },
  {
    icon: Target,
    title: "Simplicity First",
    description: "Great software should feel invisible. We obsess over removing complexity so your team can focus on what matters — communicating.",
  },
  {
    icon: Users,
    title: "Built for Teams",
    description: "From two-person startups to thousand-person enterprises, NexTalk scales with your team without sacrificing the personal touch.",
  },
  {
    icon: Zap,
    title: "Speed is a Feature",
    description: "Every millisecond counts. We've optimized every layer of our stack to deliver messages faster than you can blink.",
  },
];

const team = [
  { name: "Alex Chen", role: "Co-Founder & CEO", initials: "AC", color: "from-amber-400 to-orange-500" },
  { name: "Jordan Blake", role: "Co-Founder & CTO", initials: "JB", color: "from-blue-400 to-indigo-500" },
  { name: "Sara Okonkwo", role: "Head of Design", initials: "SO", color: "from-emerald-400 to-teal-500" },
  { name: "Raj Patel", role: "Head of Engineering", initials: "RP", color: "from-purple-400 to-violet-500" },
  { name: "Li Wei", role: "Security Lead", initials: "LW", color: "from-rose-400 to-pink-500" },
  { name: "Emma Larsson", role: "Head of Product", initials: "EL", color: "from-cyan-400 to-blue-500" },
];

const About = () => (
  <StaticPageLayout
    title="About NexTalk"
    subtitle="We're building the future of team communication — fast, private, and beautifully designed."
    badge="Company"
  >
    {/* Story */}
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 mb-10">
      <h2 className="text-xl font-semibold text-stone-900 mb-4">Our Story</h2>
      <div className="space-y-4 text-sm text-stone-500 leading-relaxed">
        <p>
          NexTalk was born from a simple frustration: every team chat tool forced us to choose between privacy and convenience, between speed and features. We believed teams shouldn&apos;t have to compromise.
        </p>
        <p>
          In early 2025, our founding team — engineers and designers from companies like Google, Stripe, and Signal — came together with a shared mission: build a messaging platform that&apos;s as secure as it is delightful to use.
        </p>
        <p>
          Today, NexTalk is used by over 10,000 teams in 150+ countries. We&apos;re a remote-first company of 35 people spread across 12 time zones, and we use NexTalk every day to build NexTalk.
        </p>
      </div>
    </div>

    {/* Values */}
    <h2 className="text-xl font-semibold text-stone-900 mb-5">Our Values</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
      {values.map((v) => (
        <div key={v.title} className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
            <v.icon className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-stone-900 mb-2">{v.title}</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{v.description}</p>
        </div>
      ))}
    </div>

    {/* Team */}
    <h2 className="text-xl font-semibold text-stone-900 mb-5">Leadership Team</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {team.map((m) => (
        <div key={m.name} className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-stone-300 hover:shadow-lg transition-all duration-300">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-3`}>
            <span className="text-white text-sm font-bold">{m.initials}</span>
          </div>
          <h3 className="text-sm font-semibold text-stone-900">{m.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{m.role}</p>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default About;
