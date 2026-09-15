import { ExternalLink } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const licenses = [
  {
    name: "React",
    version: "19.x",
    license: "MIT",
    description: "A JavaScript library for building user interfaces.",
  },
  {
    name: "React Router",
    version: "7.x",
    license: "MIT",
    description: "Declarative routing for React applications.",
  },
  {
    name: "Tailwind CSS",
    version: "4.x",
    license: "MIT",
    description: "A utility-first CSS framework for rapid UI development.",
  },
  {
    name: "Lucide React",
    version: "0.5x",
    license: "ISC",
    description: "Beautiful and consistent icon library for React.",
  },
  {
    name: "Supabase",
    version: "2.x",
    license: "MIT",
    description: "Open-source Firebase alternative for authentication and database.",
  },
  {
    name: "Vite",
    version: "7.x",
    license: "MIT",
    description: "Next-generation frontend build tool.",
  },
  {
    name: "React Hot Toast",
    version: "2.x",
    license: "MIT",
    description: "Lightweight toast notification library for React.",
  },
  {
    name: "Axios",
    version: "1.x",
    license: "MIT",
    description: "Promise-based HTTP client for the browser and Node.js.",
  },
  {
    name: "Signal Protocol",
    version: "—",
    license: "GPLv3",
    description: "Cryptographic protocol providing end-to-end encryption for messaging.",
  },
];

const licenseColors = {
  MIT: "bg-emerald-50 text-emerald-600 border-emerald-200",
  ISC: "bg-blue-50 text-blue-600 border-blue-200",
  GPLv3: "bg-purple-50 text-purple-600 border-purple-200",
  Apache: "bg-amber-50 text-amber-600 border-amber-200",
};

const Licenses = () => (
  <StaticPageLayout
    title="Open Source Licenses"
    subtitle="NexTalk is built on the shoulders of incredible open-source projects. Here are the licenses for our key dependencies."
    badge="Legal"
  >
    {/* NexTalk License */}
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sm:p-8 mb-8">
      <h3 className="text-lg font-semibold text-stone-900 mb-2">NexTalk License</h3>
      <p className="text-sm text-stone-600 leading-relaxed">
        The NexTalk application, its branding, and proprietary features are copyrighted by NexTalk Inc. The NexTalk client applications are source-available — you can inspect the code, but redistribution and modification for commercial use require written permission. Our encryption implementation and protocol contributions are open-source under the GPLv3 license.
      </p>
    </div>

    {/* Dependency Licenses */}
    <h2 className="text-xl font-semibold text-stone-900 mb-5">Third-Party Licenses</h2>
    <div className="space-y-3">
      {licenses.map((lib) => (
        <div
          key={lib.name}
          className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-stone-900">{lib.name}</h3>
              <span className="text-xs text-stone-400">{lib.version}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${licenseColors[lib.license] || "bg-stone-50 text-stone-500 border-stone-200"}`}>
                {lib.license}
              </span>
            </div>
          </div>
          <p className="text-sm text-stone-500 mt-2">{lib.description}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
      <h3 className="text-base font-semibold text-stone-900 mb-3">Full License Texts</h3>
      <p className="text-sm text-stone-500 leading-relaxed">
        Complete license texts for all dependencies are available in the LICENSES file included with every NexTalk release. For questions about licensing, contact legal@nextalk.app.
      </p>
    </div>
  </StaticPageLayout>
);

export default Licenses;
