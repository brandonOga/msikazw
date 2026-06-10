import React from 'react';
import { Link } from 'react-router';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </section>
);

export const TermsPage = () => (
  <div className="bg-white min-h-screen">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link to="/" className="text-xs text-[#009739] hover:underline">← Home</Link>
        <h1 className="text-3xl text-gray-900 mt-4 mb-2" style={{ fontWeight: 900 }}>Terms of Service</h1>
        <p className="text-sm text-gray-400">Last updated: June 2026</p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using Msika ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
      </Section>

      <Section title="2. The Platform">
        <p>Msika is an online marketplace connecting buyers and sellers in Zimbabwe. We facilitate transactions but are not a party to the contract of sale between buyers and sellers.</p>
      </Section>

      <Section title="3. User Accounts">
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>
        <p>Msika reserves the right to suspend or terminate accounts that violate these terms.</p>
      </Section>

      <Section title="4. Seller Obligations">
        <p>Sellers must ensure that listings are accurate, products are as described, and orders are fulfilled in a timely manner. Sellers are responsible for the accuracy of product information, pricing, and availability.</p>
        <p>Msika charges a 2% platform fee on each completed transaction, deducted before payout.</p>
      </Section>

      <Section title="5. Buyer Obligations">
        <p>Buyers must provide accurate delivery information and confirm receipt of orders within the agreed timeframe. Failure to confirm delivery may result in automatic release of escrow funds to the seller after 7 days.</p>
      </Section>

      <Section title="6. Escrow & Payments">
        <p>Payments are held in escrow by Msika until the buyer confirms delivery. Funds are released to the seller's EcoCash account within 24 hours of confirmation.</p>
        <p>Msika is not a financial institution. We facilitate payment flows via EcoCash and other Zimbabwean mobile money services.</p>
      </Section>

      <Section title="7. Disputes">
        <p>Buyers may open a dispute within 48 hours of the expected delivery date. Msika will review the dispute and issue a ruling within 3–5 business days. Our decision is final.</p>
      </Section>

      <Section title="8. Prohibited Items">
        <p>The following are prohibited on Msika: illegal goods, counterfeit products, weapons, controlled substances, and anything that violates Zimbabwean law.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>Msika is not liable for any indirect, incidental, or consequential damages arising from use of the Platform. Our total liability to you for any claim is limited to the amount of the transaction in dispute.</p>
      </Section>

      <Section title="10. Changes to Terms">
        <p>We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
      </Section>

      <Section title="11. Contact">
        <p>For questions about these terms, contact us at <a href="mailto:legal@msika.co.zw" className="text-[#009739]">legal@msika.co.zw</a>.</p>
      </Section>
    </div>
  </div>
);
