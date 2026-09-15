import { Shield, Lock, Eye, Server, Key, RefreshCw, CheckCircle } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";

const principles = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All messages are encrypted on your device before being sent and can only be decrypted by the intended recipient. We use the Signal Protocol, the gold standard in messaging security.",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description: "NexTalk cannot read your messages, access your files, or listen to your calls. Our zero-knowledge design means even if our servers were compromised, your data stays private.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Our infrastructure runs on SOC 2 Type II certified data centers with 256-bit AES encryption at rest. All data in transit is protected with TLS 1.3.",
  },
  {
    icon: Key,
    title: "Multi-Factor Authentication",
    description: "Protect your account with MFA via authenticator apps, hardware security keys (FIDO2/WebAuthn), or SMS. Biometric login supported on mobile devices.",
  },
  {
    icon: RefreshCw,
    title: "Regular Security Audits",
    description: "We conduct quarterly penetration tests by independent security firms and run a bug bounty program. Our audit reports are published publicly for full transparency.",
  },
  {
    icon: Shield,
    title: "Compliance & Certifications",
    description: "NexTalk is GDPR, CCPA, and HIPAA compliant. We meet SOC 2 Type II standards and are ISO 27001 certified to ensure enterprise-grade security.",
  },
];

const Security = () => (
  <StaticPageLayout
    title="Security"
    subtitle="Your privacy is not a feature — it's a foundation. Here's how we protect every conversation."
    badge="Product"
  >
    <div className="space-y-6">
      {principles.map((p, i) => (
        <div
          key={p.title}
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <p.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{p.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{p.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Trust badges */}
    <div className="mt-12 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-stone-900 mb-6 text-center">Trusted & Certified</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["SOC 2 Type II", "ISO 27001", "GDPR Compliant", "HIPAA Compliant"].map((badge) => (
          <div key={badge} className="flex items-center gap-2 justify-center py-3 px-4 bg-stone-50 rounded-xl border border-stone-100">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-stone-600">{badge}</span>
          </div>
        ))}
      </div>
    </div>
  </StaticPageLayout>
);

export default Security;
