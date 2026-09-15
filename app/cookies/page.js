import { CheckCircle, Info } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    description: "These cookies are strictly necessary for NexTalk to function. They handle authentication, session management, and security protections. Without these, you cannot use NexTalk.",
    examples: ["Session token", "CSRF protection token", "Authentication state"],
  },
  {
    name: "Preference Cookies",
    required: false,
    description: "These cookies remember your settings and preferences such as language, theme (light/dark mode), notification preferences, and UI layout choices.",
    examples: ["Theme preference", "Language selection", "Sidebar collapsed state"],
  },
  {
    name: "Performance Cookies",
    required: false,
    description: "These cookies collect anonymized information about how you use NexTalk — which features you use most, page load times, and error rates. This helps us improve the product.",
    examples: ["Anonymous usage analytics", "Performance metrics", "Error tracking"],
  },
];

const Cookies = () => (
  <StaticPageLayout
    title="Cookie Policy"
    subtitle="Last updated: April 1, 2026. We use the minimum cookies necessary to make NexTalk work."
    badge="Legal"
  >
    {/* Overview */}
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sm:p-8 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-900 mb-2">Our Cookie Philosophy</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            We believe in minimal data collection. NexTalk uses no third-party advertising cookies, no cross-site tracking, and no social media pixels. The cookies we use exist solely to make the app work and improve your experience.
          </p>
        </div>
      </div>
    </div>

    {/* Cookie Types */}
    <div className="space-y-5">
      {cookieTypes.map((cookie) => (
        <div key={cookie.name} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 hover:border-stone-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-900">{cookie.name}</h3>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
              cookie.required
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-stone-50 text-stone-500 border-stone-200"
            }`}>
              {cookie.required ? "Required" : "Optional"}
            </span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-4">{cookie.description}</p>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Examples</p>
            <div className="flex flex-wrap gap-2">
              {cookie.examples.map((ex) => (
                <span key={ex} className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg px-3 py-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Managing cookies */}
    <div className="mt-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-stone-900 mb-3">Managing Your Cookies</h3>
      <div className="space-y-3 text-sm text-stone-500 leading-relaxed">
        <p>
          You can manage optional cookies through your NexTalk privacy settings. Essential cookies cannot be disabled as they are required for the app to function.
        </p>
        <p>
          You can also control cookies through your browser settings. Note that disabling essential cookies will prevent you from using NexTalk.
        </p>
        <p>
          For questions about our cookie practices, contact us at privacy@nextalk.app.
        </p>
      </div>
    </div>
  </StaticPageLayout>
);

export default Cookies;
