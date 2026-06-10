import React from 'react';
import { Link } from 'react-router';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </section>
);

export const PrivacyPage = () => (
  <div className="bg-white min-h-screen">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link to="/" className="text-xs text-[#009739] hover:underline">← Home</Link>
        <h1 className="text-3xl text-gray-900 mt-4 mb-2" style={{ fontWeight: 900 }}>Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: June 2026</p>
      </div>

      <Section title="1. Information We Collect">
        <p><strong>Account information:</strong> name, email address, phone number, and location when you register.</p>
        <p><strong>Transaction data:</strong> orders, payments, delivery details, and dispute history.</p>
        <p><strong>Usage data:</strong> pages visited, searches made, and device/browser information via standard web analytics.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to operate the marketplace, process transactions, send order and account notifications, prevent fraud, and improve our services.</p>
        <p>We do not sell your personal data to third parties.</p>
      </Section>

      <Section title="3. Sharing of Information">
        <p><strong>With sellers:</strong> your delivery name, address, and phone number are shared with the seller of your order so they can fulfil it.</p>
        <p><strong>With buyers:</strong> sellers see your order details but not your full account profile.</p>
        <p><strong>Service providers:</strong> we share data with trusted service providers (payment processors, delivery partners, email providers) under strict data processing agreements.</p>
      </Section>

      <Section title="4. Data Retention">
        <p>We retain your data for as long as your account is active or as required by Zimbabwean law. You may request deletion of your account and associated data by contacting us.</p>
      </Section>

      <Section title="5. Cookies">
        <p>We use session cookies to keep you logged in and local storage to remember your preferences (currency, cart). We do not use third-party advertising cookies.</p>
      </Section>

      <Section title="6. Security">
        <p>All data is encrypted in transit (TLS). Passwords are never stored in plain text. Payment credentials are processed by our payment partners and never stored by Msika.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, log in to your account settings or contact us at <a href="mailto:privacy@msika.co.zw" className="text-[#009739]">privacy@msika.co.zw</a>.</p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>We may update this policy periodically. We will notify you of material changes via email or in-app notification.</p>
      </Section>

      <Section title="9. Contact">
        <p>Questions? Email <a href="mailto:privacy@msika.co.zw" className="text-[#009739]">privacy@msika.co.zw</a>.</p>
      </Section>
    </div>
  </div>
);
