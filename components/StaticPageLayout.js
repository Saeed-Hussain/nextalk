import Link from "next/link";
import { ArrowLeft, Github, Globe } from "lucide-react";
import NexTalkLogo from "@/components/NexTalkLogo";

const footerLinks = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Security", to: "/security" },
    { label: "Integrations", to: "/integrations" },
    { label: "Changelog", to: "/changelog" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Careers", to: "/careers" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Cookies", to: "/cookies" },
    { label: "Licenses", to: "/licenses" },
  ],
};

const StaticPageLayout = ({ title, subtitle, badge, children }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-stone-200 shadow-sm shadow-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <NexTalkLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-stone-900">
                Nex<span className="text-amber-500">Talk</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm shadow-amber-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Hero */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-orange-200/15 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full mb-5">
              <span className="text-xs font-semibold text-amber-600 tracking-wide uppercase">{badge}</span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <NexTalkLogo className="w-11 h-11" />
                <span className="text-xl font-bold text-stone-900">
                  Nex<span className="text-amber-500">Talk</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed max-w-xs text-stone-400">
                The next generation of team messaging. Fast, secure, and beautifully designed.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a href="#" className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 hover:border-stone-300 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 hover:border-stone-300 transition-all">
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-stone-900 mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.to} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-400">
              &copy; {new Date().getFullYear()} NexTalk. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-stone-400">
              Built with <span className="text-amber-500 mx-1">&#9829;</span> for better communication
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaticPageLayout;
