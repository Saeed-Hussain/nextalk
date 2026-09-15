import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "**Account Information:** When you create an account, we collect your name, email address, and password (stored as a secure hash). If you sign up via Google or GitHub, we receive your name, email, and profile picture from those services.",
      "**Messages & Content:** All messages are end-to-end encrypted. We cannot read, access, or store the plaintext content of your messages. We store encrypted message data only to deliver messages to your devices.",
      "**Usage Data:** We collect anonymized usage statistics such as feature usage frequency, app performance metrics, and crash reports to improve our service. This data cannot be linked back to you or your messages.",
      "**Device Information:** We collect basic device information (OS version, app version, device type) for compatibility and troubleshooting purposes.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide, maintain, and improve NexTalk's services.",
      "To authenticate your identity and secure your account.",
      "To send transactional emails (password resets, security alerts).",
      "To generate anonymized analytics that help us improve the product.",
      "We never use your data for advertising and we never sell your personal information to third parties.",
    ],
  },
  {
    title: "3. Data Storage & Security",
    content: [
      "All data is stored on SOC 2 Type II certified infrastructure with 256-bit AES encryption at rest.",
      "Messages are end-to-end encrypted using the Signal Protocol. NexTalk servers never have access to encryption keys.",
      "Data is replicated across geographically distributed data centers for reliability.",
      "All data in transit is protected with TLS 1.3.",
    ],
  },
  {
    title: "4. Data Retention",
    content: [
      "Account data is retained for as long as your account is active.",
      "When you delete your account, all personal data is permanently removed within 30 days.",
      "Encrypted message data is deleted when both sender and all recipients have deleted the message, or when all associated accounts are deleted.",
      "Anonymized analytics data may be retained indefinitely as it cannot be linked to individual users.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "**Access:** You can request a copy of all personal data we hold about you.",
      "**Correction:** You can update your account information at any time through the settings page.",
      "**Deletion:** You can delete your account and all associated data at any time.",
      "**Portability:** You can export your data in a machine-readable format.",
      "**Objection:** You can opt out of anonymized analytics collection in your privacy settings.",
    ],
  },
  {
    title: "6. Third-Party Services",
    content: [
      "We use a minimal set of third-party services: cloud infrastructure providers (for hosting), email delivery services (for transactional emails), and error reporting services (for crash reports).",
      "All third-party providers are contractually obligated to protect your data and are selected based on their security practices.",
      "We do not use any third-party analytics, advertising, or tracking services.",
    ],
  },
  {
    title: "7. Contact",
    content: [
      "For privacy-related inquiries, contact our Data Protection Officer at privacy@nextalk.app.",
      "We respond to all privacy requests within 30 days.",
    ],
  },
];

const Privacy = () => (
  <StaticPageLayout
    title="Privacy Policy"
    subtitle="Last updated: April 1, 2026. We take your privacy seriously — here's exactly how we handle your data."
    badge="Legal"
  >
    <div className="space-y-8">
      {sections.map((s) => (
        <div key={s.title} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">{s.title}</h2>
          <ul className="space-y-3">
            {s.content.map((item, i) => (
              <li key={i} className="text-sm text-stone-500 leading-relaxed pl-4 border-l-2 border-stone-100">
                {item.split(/\*\*(.*?)\*\*/).map((part, j) =>
                  j % 2 === 1 ? <span key={j} className="font-medium text-stone-700">{part}</span> : part
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default Privacy;
