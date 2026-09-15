import { ArrowRight, Clock } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const posts = [
  {
    title: "NexTalk Public Beta Is Here",
    excerpt: "After months of development and testing with thousands of early adopters, we're thrilled to open NexTalk to everyone. Here's what's new and what's next.",
    date: "April 10, 2026",
    readTime: "4 min read",
    category: "Announcements",
    catColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    title: "How We Built End-to-End Encryption That Doesn't Slow You Down",
    excerpt: "A deep dive into our encryption architecture — how we deliver military-grade security without sacrificing the instant messaging experience users expect.",
    date: "March 28, 2026",
    readTime: "8 min read",
    category: "Engineering",
    catColor: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    title: "Why We Chose the Signal Protocol",
    excerpt: "There are many encryption protocols available. Here's why we built on Signal Protocol and what that means for your privacy.",
    date: "March 15, 2026",
    readTime: "6 min read",
    category: "Security",
    catColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    title: "Designing for Speed: Our UI Performance Philosophy",
    excerpt: "Every animation, every transition, every render cycle has been considered. Our design team shares the principles behind NexTalk's snappy interface.",
    date: "March 2, 2026",
    readTime: "5 min read",
    category: "Design",
    catColor: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    title: "Migrating From Slack to NexTalk: A Complete Guide",
    excerpt: "Step-by-step walkthrough of how to move your entire Slack workspace — channels, messages, and files — to NexTalk in under 10 minutes.",
    date: "February 18, 2026",
    readTime: "7 min read",
    category: "Guides",
    catColor: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    title: "Our Remote-First Culture: Building NexTalk Across 12 Time Zones",
    excerpt: "How our globally distributed team collaborates, communicates, and ships products. Spoiler: we use NexTalk.",
    date: "February 5, 2026",
    readTime: "5 min read",
    category: "Culture",
    catColor: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
];

const Blog = () => (
  <StaticPageLayout
    title="Blog"
    subtitle="Insights on messaging, security, design, and the future of team communication."
    badge="Company"
  >
    <div className="space-y-5">
      {posts.map((post) => (
        <article
          key={post.title}
          className="group bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 hover:border-stone-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${post.catColor}`}>
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-amber-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">{post.date}</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
              Read more <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </article>
      ))}
    </div>
  </StaticPageLayout>
);

export default Blog;
