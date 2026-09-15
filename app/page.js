"use client";

import Link from "next/link";
import {
  MessageCircle,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Menu,
  X,
  Globe,
  Lock,
  Smartphone,
  Star,
  ChevronDown,
  Github,
  Send,
  Video,
  Image,
  Paperclip,
  Search,
  Bell,
  Play,
  Sun,
  Moon,
  ArrowDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NexTalkLogo from "@/components/NexTalkLogo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  {
    icon: Zap,
    title: "Real-Time Messaging",
    description: "Messages delivered instantly with zero lag across all devices.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Military-grade encryption keeps your conversations private.",
    color: "blue",
  },
  {
    icon: Users,
    title: "Group Conversations",
    description: "Create channels and groups for seamless team collaboration.",
    color: "emerald",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description: "Works on desktop, tablet, and mobile with perfect sync.",
    color: "purple",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Zero data selling. Minimal collection. Maximum privacy.",
    color: "rose",
  },
  {
    icon: Smartphone,
    title: "Smart Notifications",
    description: "AI-powered alerts so you never miss what matters.",
    color: "cyan",
  },
];

const featureColorsDark = {
  amber:   { bg: "bg-amber-500/10",   icon: "text-amber-400",   border: "border-amber-500/20" },
  blue:    { bg: "bg-blue-500/10",    icon: "text-blue-400",    border: "border-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-400",  border: "border-purple-500/20" },
  rose:    { bg: "bg-rose-500/10",    icon: "text-rose-400",    border: "border-rose-500/20" },
  cyan:    { bg: "bg-cyan-500/10",    icon: "text-cyan-400",    border: "border-cyan-500/20" },
};

const featureColorsLight = {
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   border: "border-amber-200" },
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-600",  border: "border-purple-200" },
  rose:    { bg: "bg-rose-50",    icon: "text-rose-600",    border: "border-rose-200" },
  cyan:    { bg: "bg-cyan-50",    icon: "text-cyan-600",    border: "border-cyan-200" },
};

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "2M+",  label: "Messages Sent" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up in seconds with email, Google, or GitHub. No credit card needed.",
    icon: Users,
  },
  {
    step: "02",
    title: "Find your people",
    description: "Invite teammates, discover contacts, and build your network effortlessly.",
    icon: Search,
  },
  {
    step: "03",
    title: "Start chatting",
    description: "Send messages, share files, hop on calls — all in one beautiful interface.",
    icon: Send,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at Vercel",
    text: "NexTalk replaced three different tools for us. Real-time messaging, file sharing, and video calls — all in one place. Our team productivity jumped 40%.",
    avatar: "SC",
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Alex Rivera",
    role: "Staff Engineer at Stripe",
    text: "The encryption and privacy features are best-in-class. As engineers, we appreciate that NexTalk takes security seriously without making it complicated.",
    avatar: "AR",
    color: "from-blue-400 to-indigo-500",
  },
  {
    name: "Priya Sharma",
    role: "Design Lead at Figma",
    text: "Finally a chat app with a beautiful interface. The attention to detail is incredible — from smooth animations to thoughtful notification controls.",
    avatar: "PS",
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Jordan Kim",
    role: "CTO at Linear",
    text: "We evaluated a dozen platforms. NexTalk won on encryption, speed, and UX. The developer experience is second to none — setup took under 10 minutes.",
    avatar: "JK",
    color: "from-purple-400 to-violet-500",
  },
  {
    name: "Mia Tanaka",
    role: "Head of Remote at Notion",
    text: "With a fully distributed team across 12 time zones, async communication is everything. NexTalk's notification controls and message threading are a game-changer.",
    avatar: "MT",
    color: "from-rose-400 to-pink-500",
  },
];

const faqs = [
  {
    q: "Is NexTalk free to use?",
    a: "Yes! NexTalk is completely free for individuals and small teams. We offer premium plans for larger organizations that need advanced features like admin controls, compliance tools, and priority support.",
  },
  {
    q: "How secure are my messages?",
    a: "All messages are protected with end-to-end encryption. This means only you and your intended recipients can read your messages — not even we can access them. We use the same encryption standards trusted by security professionals worldwide.",
  },
  {
    q: "Can I use NexTalk on multiple devices?",
    a: "Absolutely. NexTalk works seamlessly across web browsers, desktop apps (Windows, Mac, Linux), and mobile apps (iOS, Android). All your messages sync instantly across every device.",
  },
  {
    q: "How do I migrate from another chat platform?",
    a: "We offer one-click import tools for Slack, Discord, Teams, and other popular platforms. Your message history, files, and channel structure are preserved during migration.",
  },
  {
    q: "What happens to my data if I delete my account?",
    a: "When you delete your account, all your personal data is permanently removed from our servers within 30 days. We believe in giving you full control over your information.",
  },
];

// Feature pill data for the marquee strip
const FEATURE_PILLS = [
  { icon: Zap,         label: "Real-Time Messaging" },
  { icon: Shield,      label: "End-to-End Encrypted" },
  { icon: Users,       label: "Group Conversations" },
  { icon: Globe,       label: "Cross-Platform Sync" },
  { icon: Lock,        label: "Privacy First" },
  { icon: Smartphone,  label: "Mobile Ready" },
  { icon: Video,       label: "HD Video Calls" },
  { icon: Send,        label: "Instant Delivery" },
  { icon: Bell,        label: "Smart Alerts" },
  { icon: Star,        label: "4.9 / 5 Rated" },
  { icon: MessageCircle, label: "Direct Messages" },
  { icon: Search,      label: "Message Search" },
];

// ─── Animated stat counter (counts up when it scrolls into view) ─────────────
const StatCounter = ({ value, label, t }) => {
  const [display, setDisplay] = useState(() => {
    const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    return m ? "0" + m[2] : value;
  });
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- malformed value fallback
      setDisplay(value);
      return;
    }
    const num = parseFloat(m[1]);
    const suffix = m[2];
    const isFloat = !Number.isInteger(num);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || ran.current) return;
        ran.current = true;
        const start = performance.now();
        const dur = 1200;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const cur = e * num;
          setDisplay((isFloat ? cur.toFixed(1) : Math.floor(cur)) + suffix);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center animate-fade-in-up">
      <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
        {display}
      </p>
      <p className={`mt-1 text-sm ${t("text-stone-500", "text-stone-400")}`}>{label}</p>
    </div>
  );
};

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = (darkVal, lightVal) => (dark ? darkVal : lightVal);
  const featureColors = dark ? featureColorsDark : featureColorsLight;

  return (
    <div className={`min-h-screen theme-transition ${t("bg-stone-950 text-white", "bg-stone-50 text-stone-900")}`}>
      {/* ─── Header ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? t(
                "bg-stone-950/90 backdrop-blur-2xl border-b border-white/5 shadow-lg shadow-black/10",
                "bg-white/90 backdrop-blur-2xl border-b border-stone-200 shadow-lg shadow-stone-200/50"
              )
            : t("bg-stone-950/50 backdrop-blur-xl", "bg-white/50 backdrop-blur-xl")
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-2.5">
              <NexTalkLogo className="w-11 h-11" />
              <span className={`text-xl font-bold ${t("text-white", "text-stone-900")}`}>
                Nex<span className="text-amber-500">Talk</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${t(
                    "text-stone-400 hover:text-white hover:bg-white/5",
                    "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  )}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${t(
                  "bg-white/5 hover:bg-white/10 text-stone-400 hover:text-amber-400",
                  "bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-amber-600"
                )}`}
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium transition-colors ${t(
                  "text-stone-300 hover:text-white",
                  "text-stone-600 hover:text-stone-900"
                )}`}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/20"
              >
                Get Started Free
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${t(
                  "text-stone-400 hover:text-white hover:bg-white/5",
                  "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                )}`}
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${t(
                  "text-stone-400 hover:text-white hover:bg-white/5",
                  "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                )}`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t animate-fade-in ${t(
            "border-white/5 bg-stone-950/95 backdrop-blur-2xl",
            "border-stone-200 bg-white/95 backdrop-blur-2xl"
          )}`}>
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${t(
                    "text-stone-400 hover:text-white hover:bg-white/5",
                    "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  )}`}
                >
                  {link.label}
                </a>
              ))}
              <div className={`pt-4 mt-4 border-t grid grid-cols-2 gap-3 ${t("border-white/5", "border-stone-200")}`}>
                <Link
                  href="/login"
                  className={`px-4 py-3 text-sm font-medium border rounded-xl text-center transition-colors ${t(
                    "text-stone-300 border-white/10 hover:bg-white/5",
                    "text-stone-600 border-stone-200 hover:bg-stone-100"
                  )}`}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-3 text-sm font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-20 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-float-slow ${t("bg-amber-500/8", "bg-amber-300/20")}`} />
          <div className={`absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-float ${t("bg-amber-600/5", "bg-orange-200/20")}`} />
          <div className={`absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full blur-[80px] animate-float-slow delay-300 ${t("bg-amber-400/5", "bg-yellow-200/15")}`} />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)"} 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Floating chat bubble decorations — desktop only */}
        <div className="absolute top-36 right-4 xl:right-12 hidden lg:block animate-float" style={{ animationDelay: "0.3s" }}>
          <div className={`px-3.5 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${t(
            "bg-stone-900/85 border-white/10 shadow-black/40",
            "bg-white/90 border-stone-200 shadow-stone-300/40"
          )}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-bold">SC</span>
              </div>
              <div>
                <p className={`text-[11px] font-semibold ${t("text-white", "text-stone-900")}`}>Sarah Chen</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`flex gap-0.5 ${t("text-stone-500", "text-stone-400")}`}>
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className={`text-[9px] ${t("text-stone-500", "text-stone-400")}`}>typing…</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-64 left-4 xl:left-12 hidden lg:block animate-float-slow" style={{ animationDelay: "1.2s" }}>
          <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${t(
            "bg-stone-900/85 border-white/10 shadow-black/40",
            "bg-white/90 border-stone-200 shadow-stone-300/40"
          )}`}>
            <div className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <Lock className="w-3 h-3 text-green-400" />
            </div>
            <span className={`text-[11px] font-medium ${t("text-stone-300", "text-stone-700")}`}>End-to-end encrypted</span>
          </div>
        </div>

        <div className="absolute bottom-40 right-8 xl:right-20 hidden xl:block animate-float" style={{ animationDelay: "2s" }}>
          <div className={`px-3.5 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${t(
            "bg-stone-900/85 border-white/10 shadow-black/40",
            "bg-white/90 border-stone-200 shadow-stone-300/40"
          )}`}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-stone-900" />
              </div>
              <div>
                <p className={`text-[11px] font-semibold ${t("text-white", "text-stone-900")}`}>New message</p>
                <p className={`text-[9px] ${t("text-stone-500", "text-stone-400")}`}>Alex sent a file</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className={`animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-8 ${t(
              "bg-amber-500/10 border-amber-500/20",
              "bg-amber-50 border-amber-200"
            )}`}>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className={`text-xs font-semibold tracking-wide uppercase ${t("text-amber-400", "text-amber-600")}`}>
                Now in Public Beta
              </span>
            </div>

            <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              The next generation{" "}
              <br className="hidden sm:block" />
              of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 animate-gradient-shift">
                team chat
              </span>
            </h1>

            <p className={`animate-fade-in-up delay-200 mt-6 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto ${t("text-stone-400", "text-stone-500")}`}>
              Blazing-fast, end-to-end encrypted messaging built for teams that
              move quickly and value their privacy.
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl hover:from-amber-300 hover:to-amber-400 shadow-2xl shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start chatting — it&apos;s free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className={`group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold border rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${t(
                  "text-stone-300 border-white/10 hover:bg-white/5 hover:border-white/20",
                  "text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
                )}`}
              >
                <Play className="w-4 h-4" />
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="animate-fade-in-up delay-400 mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[
                    { bg: "bg-gradient-to-br from-amber-400 to-orange-500",  letter: "K" },
                    { bg: "bg-gradient-to-br from-blue-400 to-indigo-500",   letter: "A" },
                    { bg: "bg-gradient-to-br from-emerald-400 to-teal-500",  letter: "S" },
                    { bg: "bg-gradient-to-br from-rose-400 to-pink-500",     letter: "R" },
                    { bg: "bg-gradient-to-br from-purple-400 to-violet-500", letter: "M" },
                  ].map((u, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${u.bg} border-2 flex items-center justify-center ${t("border-stone-950", "border-stone-50")}`}
                    >
                      <span className="text-white text-[10px] font-bold">{u.letter}</span>
                    </div>
                  ))}
                </div>
                <span className={`text-sm ${t("text-stone-400", "text-stone-500")}`}>
                  <span className={`font-semibold ${t("text-white", "text-stone-900")}`}>10,000+</span> users
                </span>
              </div>
              <div className={`hidden sm:block w-px h-5 ${t("bg-white/10", "bg-stone-300")}`} />
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className={`ml-1 text-sm ${t("text-stone-400", "text-stone-500")}`}>
                  <span className={`font-semibold ${t("text-white", "text-stone-900")}`}>4.9</span>/5 rating
                </span>
              </div>
            </div>
          </div>

          {/* ─── Hero App Mockup ─── */}
          <div className="animate-fade-in-up delay-500 mt-16 sm:mt-20 max-w-5xl mx-auto">
            <div className="relative">
              <div className={`absolute -inset-4 rounded-3xl blur-2xl ${t(
                "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent",
                "bg-gradient-to-b from-amber-300/20 via-amber-200/10 to-transparent"
              )}`} />

              <div className={`relative rounded-2xl border shadow-2xl overflow-hidden animate-float-slow ${t(
                "border-white/10 bg-stone-900/80 backdrop-blur-xl",
                "border-stone-200 bg-white/90 backdrop-blur-xl shadow-stone-300/50"
              )}`}>
                {/* Window bar */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${t(
                  "border-white/5 bg-stone-900/50",
                  "border-stone-100 bg-stone-50/80"
                )}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1 rounded-lg border ${t(
                    "bg-white/5 border-white/5",
                    "bg-stone-100 border-stone-200"
                  )}`}>
                    <Lock className="w-3 h-3 text-green-400" />
                    <span className={`text-xs ${t("text-stone-500", "text-stone-400")}`}>nextalk.app</span>
                  </div>
                  <div className="w-16" />
                </div>

                {/* App layout */}
                <div className="flex min-h-[400px] sm:min-h-[480px]">
                  {/* Sidebar */}
                  <div className={`hidden sm:flex flex-col w-64 border-r ${t(
                    "border-white/5 bg-stone-900/40",
                    "border-stone-100 bg-stone-50/60"
                  )}`}>
                    <div className={`p-4 border-b ${t("border-white/5", "border-stone-100")}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <NexTalkLogo className="w-6 h-6" />
                          <span className={`text-sm font-bold ${t("text-white", "text-stone-900")}`}>NexTalk</span>
                        </div>
                        <Bell className={`w-4 h-4 ${t("text-stone-500", "text-stone-400")}`} />
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${t("bg-white/5", "bg-stone-100")}`}>
                        <Search className={`w-3.5 h-3.5 ${t("text-stone-500", "text-stone-400")}`} />
                        <span className={`text-xs ${t("text-stone-600", "text-stone-400")}`}>Search messages...</span>
                      </div>
                    </div>
                    <div className="flex-1 p-2 space-y-0.5 overflow-hidden">
                      <p className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${t("text-stone-600", "text-stone-400")}`}>Channels</p>
                      {[
                        { name: "general",       unread: false, active: false },
                        { name: "design-team",   unread: true,  active: true  },
                        { name: "engineering",   unread: false, active: false },
                        { name: "random",        unread: true,  active: false },
                        { name: "announcements", unread: false, active: false },
                      ].map((ch) => (
                        <div
                          key={ch.name}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                            ch.active
                              ? t("bg-amber-500/10 text-amber-400", "bg-amber-50 text-amber-600")
                              : t("text-stone-500 hover:bg-white/5", "text-stone-500 hover:bg-stone-100")
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={t("text-stone-600", "text-stone-400")}>#</span>
                            {ch.name}
                          </span>
                          {ch.unread && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        </div>
                      ))}
                      <p className={`px-3 py-2 mt-2 text-[10px] font-semibold uppercase tracking-wider ${t("text-stone-600", "text-stone-400")}`}>Direct Messages</p>
                      {[
                        { name: "Sarah Chen",  status: "online" },
                        { name: "Alex Rivera", status: "online" },
                        { name: "Priya Sharma", status: "away" },
                      ].map((dm) => (
                        <div
                          key={dm.name}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${t(
                            "text-stone-500 hover:bg-white/5",
                            "text-stone-500 hover:bg-stone-100"
                          )}`}
                        >
                          <div className="relative">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${t("bg-stone-700", "bg-stone-200")}`}>
                              <span className={`text-[8px] font-bold ${t("text-stone-400", "text-stone-500")}`}>{dm.name.split(" ").map(n => n[0]).join("")}</span>
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border ${t("border-stone-900", "border-white")} ${dm.status === "online" ? "bg-green-400" : "bg-amber-400"}`} />
                          </div>
                          {dm.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="flex-1 flex flex-col">
                    <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${t("border-white/5", "border-stone-100")}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${t("text-stone-600", "text-stone-400")}`}>#</span>
                        <span className={`text-sm font-semibold ${t("text-white", "text-stone-900")}`}>design-team</span>
                        <span className={`hidden sm:inline text-xs ml-2 ${t("text-stone-600", "text-stone-400")}`}>4 members online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${t("hover:bg-white/5 text-stone-500", "hover:bg-stone-100 text-stone-400")}`}>
                          <Video className="w-4 h-4" />
                        </div>
                        <div className={`p-1.5 rounded-md ${t("hover:bg-white/5 text-stone-500", "hover:bg-stone-100 text-stone-400")}`}>
                          <Search className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-hidden">
                      <div className="flex items-start gap-3 animate-slide-in-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">AR</span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-sm font-semibold ${t("text-white", "text-stone-900")}`}>Alex Rivera</span>
                            <span className={`text-[10px] ${t("text-stone-600", "text-stone-400")}`}>10:24 AM</span>
                          </div>
                          <p className={`mt-1 text-sm leading-relaxed ${t("text-stone-300", "text-stone-600")}`}>
                            Hey team! The new landing page mockups are ready for review.
                          </p>
                          <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border max-w-xs ${t(
                            "bg-white/5 border-white/5",
                            "bg-stone-50 border-stone-200"
                          )}`}>
                            {/* eslint-disable-next-line jsx-a11y/alt-text -- lucide icon, not an <img> */}
                            <Image className="w-4 h-4 text-amber-400" />
                            <span className={`text-xs ${t("text-stone-400", "text-stone-500")}`}>landing-v3.fig</span>
                            <span className={`text-[10px] ml-auto ${t("text-stone-600", "text-stone-400")}`}>2.4 MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 animate-slide-in-left delay-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">SC</span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-sm font-semibold ${t("text-white", "text-stone-900")}`}>Sarah Chen</span>
                            <span className={`text-[10px] ${t("text-stone-600", "text-stone-400")}`}>10:26 AM</span>
                          </div>
                          <p className={`mt-1 text-sm leading-relaxed ${t("text-stone-300", "text-stone-600")}`}>
                            These look incredible! Love the hero section. Let&apos;s ship it
                          </p>
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-full">
                            <span className="text-xs">🔥</span>
                            <span className="text-[10px] text-amber-400 font-medium">3</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 animate-slide-in-right delay-400">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">Y</span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-amber-400">You</span>
                            <span className={`text-[10px] ${t("text-stone-600", "text-stone-400")}`}>10:28 AM</span>
                          </div>
                          <p className={`mt-1 text-sm leading-relaxed ${t("text-stone-300", "text-stone-600")}`}>
                            Deploying to staging now. Should be live in 2 minutes!
                          </p>
                        </div>
                      </div>

                      {/* Typing indicator */}
                      <div className="flex items-center gap-3 animate-fade-in delay-600">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">PS</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${t("bg-white/5", "bg-stone-100")}`}>
                          <div className="flex gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms] ${t("bg-stone-500", "bg-stone-400")}`} />
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms] ${t("bg-stone-500", "bg-stone-400")}`} />
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms] ${t("bg-stone-500", "bg-stone-400")}`} />
                          </div>
                          <span className={`text-[10px] ${t("text-stone-600", "text-stone-400")}`}>Priya is typing...</span>
                        </div>
                      </div>
                    </div>

                    {/* Message input */}
                    <div className="px-4 sm:px-6 pb-4">
                      <div className={`flex items-center gap-2 px-4 py-3 border rounded-xl ${t(
                        "bg-white/5 border-white/5",
                        "bg-stone-50 border-stone-200"
                      )}`}>
                        <Paperclip className={`w-4 h-4 ${t("text-stone-600", "text-stone-400")}`} />
                        <span className={`flex-1 text-sm ${t("text-stone-600", "text-stone-400")}`}>Type a message...</span>
                        <div className="flex items-center gap-1.5">
                          {/* eslint-disable-next-line jsx-a11y/alt-text -- lucide icon, not an <img> */}
                          <Image className={`w-4 h-4 ${t("text-stone-600", "text-stone-400")}`} />
                          <Send className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="mt-10 flex justify-center animate-scroll-hint">
            <ArrowDown className={`w-5 h-5 ${t("text-stone-600", "text-stone-400")}`} />
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className={`py-12 border-y ${t("border-white/5", "border-stone-200")}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`delay-${(i + 1) * 100}`}>
                <StatCounter value={stat.value} label={stat.label} t={t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Pills Marquee ─── */}
      <section className={`py-8 border-b ${t("border-white/5", "border-stone-100")}`}>
        <div className="marquee-mask overflow-hidden">
          <div className="flex animate-marquee-left" style={{ width: "max-content" }}>
            {[...FEATURE_PILLS, ...FEATURE_PILLS].map((pill, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 mx-2 px-4 py-2 rounded-full border shrink-0 ${t(
                  "bg-stone-900/60 border-white/8 text-stone-300",
                  "bg-white border-stone-200 text-stone-600"
                )}`}
              >
                <pill.icon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium whitespace-nowrap">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full mb-4 ${t(
              "bg-amber-500/10 border-amber-500/20",
              "bg-amber-50 border-amber-200"
            )}`}>
              <span className={`text-xs font-semibold tracking-wide uppercase ${t("text-amber-400", "text-amber-600")}`}>Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything you need.{" "}
              <span className={t("text-stone-500", "text-stone-400")}>Nothing you don&apos;t.</span>
            </h2>
            <p className={`mt-4 text-lg max-w-xl mx-auto ${t("text-stone-400", "text-stone-500")}`}>
              Powerful features designed to make team communication feel effortless.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const colors = featureColors[feature.color];
              const isLarge = index === 0 || index === 3;
              return (
                <div
                  key={feature.title}
                  className={`group relative border rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] ${
                    isLarge ? "sm:col-span-2 lg:col-span-1" : ""
                  } ${t(
                    "bg-stone-900/50 border-white/5 hover:border-white/10 hover:bg-stone-900/80",
                    "bg-white border-stone-200 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50"
                  )}`}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.bg} blur-xl -z-10`} />

                  <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${t("text-white", "text-stone-900")}`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${t("text-stone-400", "text-stone-500")}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className={`absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-transparent ${t("via-amber-500/[0.02]", "via-amber-100/30")}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full mb-4 ${t(
              "bg-amber-500/10 border-amber-500/20",
              "bg-amber-50 border-amber-200"
            )}`}>
              <span className={`text-xs font-semibold tracking-wide uppercase ${t("text-amber-400", "text-amber-600")}`}>How it works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Up and running in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                minutes
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((item, index) => (
                <div key={item.step} className="relative group">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(100%)] w-full h-px">
                      <div className="w-full h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                    </div>
                  )}

                  <div className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${t(
                    "bg-stone-900/50 border-white/5 hover:border-amber-500/20 hover:bg-stone-900/80",
                    "bg-white border-stone-200 hover:border-amber-200 hover:shadow-lg"
                  )}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 font-bold text-sm shadow-lg shadow-amber-500/20">
                        {item.step}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${t("bg-white/5", "bg-stone-100")}`}>
                        <item.icon className={`w-5 h-5 ${t("text-stone-400", "text-stone-500")}`} />
                      </div>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${t("text-white", "text-stone-900")}`}>{item.title}</h3>
                    <p className={`text-sm leading-relaxed ${t("text-stone-400", "text-stone-500")}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials — Infinite Marquee ─── */}
      <section id="testimonials" className="py-20 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full mb-4 ${t(
              "bg-amber-500/10 border-amber-500/20",
              "bg-amber-50 border-amber-200"
            )}`}>
              <span className={`text-xs font-semibold tracking-wide uppercase ${t("text-amber-400", "text-amber-600")}`}>Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                thousands
              </span>
            </h2>
            <p className={`mt-4 text-lg ${t("text-stone-400", "text-stone-500")}`}>
              See why teams are switching to NexTalk.
            </p>
          </div>
        </div>

        {/* Row 1 — scrolls left */}
        <div className="marquee-mask mb-4">
          <div className="flex animate-marquee-left" style={{ width: "max-content" }}>
            {[...testimonials, ...testimonials].map((item, i) => (
              <TestimonialCard key={i} item={item} t={t} dark={dark} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right (reversed order) */}
        <div className="marquee-mask">
          <div className="flex animate-marquee-right" style={{ width: "max-content" }}>
            {[...[...testimonials].reverse(), ...[...testimonials].reverse()].map((item, i) => (
              <TestimonialCard key={i} item={item} t={t} dark={dark} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className={`py-20 sm:py-28 border-t ${t("border-white/5", "border-stone-200")}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full mb-4 ${t(
              "bg-amber-500/10 border-amber-500/20",
              "bg-amber-50 border-amber-200"
            )}`}>
              <span className={`text-xs font-semibold tracking-wide uppercase ${t("text-amber-400", "text-amber-600")}`}>FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-colors ${t(
                  "border-white/5 hover:border-white/10",
                  "border-stone-200 hover:border-stone-300"
                )}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                >
                  <span className={`text-sm font-medium pr-4 ${t("text-white", "text-stone-900")}`}>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${t("text-stone-500", "text-stone-400")} ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={`px-6 pb-5 text-sm leading-relaxed ${t("text-stone-400", "text-stone-500")}`}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 animate-gradient-shift" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to transform your{" "}
                <br className="hidden sm:block" />
                team communication?
              </h2>
              <p className="mt-4 text-lg text-amber-100/80 max-w-xl mx-auto">
                Join 10,000+ users already chatting on NexTalk. Free forever for small teams.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-amber-600 bg-white rounded-xl hover:bg-amber-50 shadow-2xl shadow-amber-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get started for free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={`border-t ${t("border-white/5 bg-stone-950", "border-stone-200 bg-white")}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <NexTalkLogo className="w-11 h-11" />
                <span className={`text-xl font-bold ${t("text-white", "text-stone-900")}`}>
                  Nex<span className="text-amber-500">Talk</span>
                </span>
              </Link>
              <p className={`mt-4 text-sm leading-relaxed max-w-xs ${t("text-stone-500", "text-stone-400")}`}>
                The next generation of team messaging. Fast, secure, and beautifully designed.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="#"
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${t(
                    "bg-white/5 border-white/5 text-stone-500 hover:text-white hover:bg-white/10 hover:border-white/10",
                    "bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-900 hover:bg-stone-100 hover:border-stone-300"
                  )}`}
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${t(
                    "bg-white/5 border-white/5 text-stone-500 hover:text-white hover:bg-white/10 hover:border-white/10",
                    "bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-900 hover:bg-stone-100 hover:border-stone-300"
                  )}`}
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold mb-4 ${t("text-white", "text-stone-900")}`}>Product</h4>
              <ul className="space-y-3">
                {[{ label: "Features", to: "/features" }, { label: "Security", to: "/security" }, { label: "Integrations", to: "/integrations" }, { label: "Changelog", to: "/changelog" }].map((item) => (
                  <li key={item.label}>
                    <Link href={item.to} className={`text-sm transition-colors ${t("text-stone-500 hover:text-stone-300", "text-stone-400 hover:text-stone-600")}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-sm font-semibold mb-4 ${t("text-white", "text-stone-900")}`}>Company</h4>
              <ul className="space-y-3">
                {[{ label: "About", to: "/about" }, { label: "Blog", to: "/blog" }, { label: "Careers", to: "/careers" }, { label: "Contact", to: "/contact" }].map((item) => (
                  <li key={item.label}>
                    <Link href={item.to} className={`text-sm transition-colors ${t("text-stone-500 hover:text-stone-300", "text-stone-400 hover:text-stone-600")}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-sm font-semibold mb-4 ${t("text-white", "text-stone-900")}`}>Legal</h4>
              <ul className="space-y-3">
                {[{ label: "Privacy", to: "/privacy" }, { label: "Terms", to: "/terms" }, { label: "Cookies", to: "/cookies" }, { label: "Licenses", to: "/licenses" }].map((item) => (
                  <li key={item.label}>
                    <Link href={item.to} className={`text-sm transition-colors ${t("text-stone-500 hover:text-stone-300", "text-stone-400 hover:text-stone-600")}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${t("border-white/5", "border-stone-200")}`}>
            <p className={`text-sm ${t("text-stone-600", "text-stone-400")}`}>
              &copy; {new Date().getFullYear()} NexTalk. All rights reserved.
            </p>
            <div className={`flex items-center gap-1 text-sm ${t("text-stone-600", "text-stone-400")}`}>
              Built with <span className="text-amber-500 mx-1">&#9829;</span> for better communication
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Testimonial card used in the marquee ─────────────────────────────────────
const TestimonialCard = ({ item, t, dark }) => (
  <div
    className={`w-[300px] sm:w-[340px] shrink-0 mx-3 border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default ${t(
      "bg-stone-900/60 border-white/8 hover:border-white/14",
      "bg-white border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md"
    )}`}
  >
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <p className={`text-sm leading-relaxed mb-5 ${t("text-stone-300", "text-stone-600")}`}>
      &ldquo;{item.text}&rdquo;
    </p>
    <div className={`flex items-center gap-3 pt-4 border-t ${t("border-white/5", "border-stone-100")}`}>
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
        <span className="text-white text-xs font-bold">{item.avatar}</span>
      </div>
      <div>
        <p className={`text-sm font-semibold ${t("text-white", "text-stone-900")}`}>{item.name}</p>
        <p className={`text-xs ${t("text-stone-500", "text-stone-400")}`}>{item.role}</p>
      </div>
    </div>
  </div>
);

export default Home;
