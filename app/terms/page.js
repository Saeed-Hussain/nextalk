import StaticPageLayout from "@/components/StaticPageLayout";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By creating an account or using NexTalk, you agree to these Terms of Service and our Privacy Policy. If you're using NexTalk on behalf of an organization, you represent that you have the authority to bind that organization to these terms.",
  },
  {
    title: "2. Your Account",
    content: "You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating your account. You must be at least 13 years old to use NexTalk (16 in the EU). You are responsible for all activity that occurs under your account.",
  },
  {
    title: "3. Acceptable Use",
    content: "You agree not to use NexTalk to: transmit illegal content, harass or threaten other users, distribute malware or spam, attempt to circumvent security measures, impersonate other people or organizations, or violate any applicable laws. We reserve the right to suspend accounts that violate these terms.",
  },
  {
    title: "4. Your Content",
    content: "You retain full ownership of all content you create and share through NexTalk. We do not claim any rights to your messages, files, or other content. Because messages are end-to-end encrypted, we cannot access your content. You are responsible for the content you share and must ensure it complies with applicable laws.",
  },
  {
    title: "5. Service Availability",
    content: "We strive for 99.9% uptime but cannot guarantee uninterrupted service. We may temporarily suspend the service for maintenance, updates, or security patches. We will provide advance notice when possible. We are not liable for any losses resulting from service interruptions.",
  },
  {
    title: "6. Free & Premium Plans",
    content: "NexTalk offers a free tier for individuals and small teams. Premium plans offer additional features for organizations. We reserve the right to modify pricing and plan features with 30 days notice. If you downgrade or cancel a premium plan, you retain access until the end of your billing period.",
  },
  {
    title: "7. Intellectual Property",
    content: "NexTalk, its logo, and its source code are protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the NexTalk application. Our open-source components are governed by their respective licenses.",
  },
  {
    title: "8. Termination",
    content: "You may delete your account at any time. We may suspend or terminate accounts that violate these terms. Upon termination, your data will be handled according to our Privacy Policy — all personal data is permanently deleted within 30 days.",
  },
  {
    title: "9. Limitation of Liability",
    content: "NexTalk is provided 'as is' without warranties of any kind. To the maximum extent permitted by law, NexTalk shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.",
  },
  {
    title: "10. Changes to Terms",
    content: "We may update these terms from time to time. We will notify you of significant changes via email or in-app notification at least 30 days before they take effect. Continued use of NexTalk after changes take effect constitutes acceptance of the updated terms.",
  },
  {
    title: "11. Contact",
    content: "Questions about these terms? Contact us at legal@nextalk.app.",
  },
];

const Terms = () => (
  <StaticPageLayout
    title="Terms of Service"
    subtitle="Last updated: April 1, 2026. Please read these terms carefully before using NexTalk."
    badge="Legal"
  >
    <div className="space-y-6">
      {sections.map((s) => (
        <div key={s.title} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">{s.title}</h2>
          <p className="text-sm text-stone-500 leading-relaxed">{s.content}</p>
        </div>
      ))}
    </div>
  </StaticPageLayout>
);

export default Terms;
