"use client";

import { useState } from "react";
import { Mail, MessageCircle, MapPin, Send, ArrowRight } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@nextalk.app", description: "For general inquiries and partnerships" },
  { icon: MessageCircle, label: "Live Chat", value: "Available 24/7", description: "Get instant help from our support team" },
  { icon: MapPin, label: "Office", value: "Remote-first, worldwide", description: "Our team works across 12 time zones" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="Have a question, feedback, or partnership inquiry? We'd love to hear from you."
      badge="Company"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {contactInfo.map((item) => (
            <div key={item.label} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">{item.label}</h3>
              <p className="text-sm text-amber-600 font-medium mt-1">{item.value}</p>
              <p className="text-xs text-stone-400 mt-1">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-stone-900 mb-5">Send us a message</h3>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us more..."
                rows={5}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-semibold rounded-xl hover:from-amber-300 hover:to-amber-400 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
            >
              Send message
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
