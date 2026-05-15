import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Truck,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Smartphone,
  Building2,
  BadgeCheck,
  FileText,
  Camera,
  UserCheck,
  CreditCard,
  Package,
  RotateCcw,
  Star,
  Info,
  Zap,
  Shield,
} from 'lucide-react';

// ─── EcoCash Fee Calculator ───────────────────────────────────────────────────

const ECOCASH_PAYOUT_FEE_RATE = 0.015;   // 1.5% EcoCash B2C transfer fee
const MSIKA_COMMISSION_RATE   = 0.02;    // 2.0% Msika platform commission

function calculateFees(listedPrice: number) {
  const msikaCommission    = parseFloat((listedPrice * MSIKA_COMMISSION_RATE).toFixed(2));
  const ecocashPayoutFee   = parseFloat((listedPrice * ECOCASH_PAYOUT_FEE_RATE).toFixed(2));
  const totalBuffer        = parseFloat((msikaCommission + ecocashPayoutFee).toFixed(2));
  const buyerPays          = parseFloat((listedPrice + totalBuffer).toFixed(2));
  const sellerReceives     = listedPrice;               // Seller always gets exactly the listed price
  const msikaNet           = msikaCommission;           // After paying EcoCash fee from buffer
  return { msikaCommission, ecocashPayoutFee, totalBuffer, buyerPays, sellerReceives, msikaNet };
}

function FeeCalculator() {
  const [price, setPrice] = useState<string>('100');
  const numericPrice = parseFloat(price) || 0;
  const fees = calculateFees(numericPrice);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-[#009739] px-6 py-4">
        <h3 className="text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>
          EcoCash Escrow Fee Calculator
        </h3>
        <p className="text-green-100 mt-0.5" style={{ fontSize: '0.82rem' }}>
          See exactly what Buyer pays and what Seller receives — no surprises.
        </p>
      </div>
      <div className="p-6">
        <label className="block text-gray-700 mb-2" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          Seller's Listed Price (USD $)
        </label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          min="1"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#009739] focus:border-transparent"
          style={{ fontSize: '1.25rem', fontWeight: 700 }}
          placeholder="Enter product price"
        />

        {numericPrice > 0 && (
          <div className="mt-5 space-y-3">
            {/* Buyer side */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-700 mb-2" style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Buyer Pays
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-700" style={{ fontSize: '0.85rem' }}>
                  <span>Product Price</span>
                  <span style={{ fontWeight: 600 }}>${numericPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span>Msika Service Fee (2%)</span>
                  <span>+${fees.msikaCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span>EcoCash Transfer Fee (1.5%)</span>
                  <span>+${fees.ecocashPayoutFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between" style={{ fontWeight: 700 }}>
                  <span className="text-blue-700">Total Charged to Buyer</span>
                  <span className="text-blue-700" style={{ fontSize: '1.05rem' }}>${fees.buyerPays.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Escrow holding */}
            <div className="flex items-center gap-2 px-2">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-700" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  ${fees.buyerPays.toFixed(2)} LOCKED IN ESCROW
                </span>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>

            {/* Seller side */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 mb-2" style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Seller Receives (After Confirmed Delivery)
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span>Held Amount</span>
                  <span>${fees.buyerPays.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span>Less: Msika Commission (2%)</span>
                  <span>−${fees.msikaCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span>Less: EcoCash Payout Fee (1.5%)</span>
                  <span>−${fees.ecocashPayoutFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-green-300 pt-2 mt-2 flex justify-between" style={{ fontWeight: 700 }}>
                  <span className="text-[#009739]">Seller's EcoCash Payout</span>
                  <span className="text-[#009739]" style={{ fontSize: '1.05rem' }}>${fees.sellerReceives.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Msika revenue */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-gray-500" style={{ fontSize: '0.82rem' }}>Msika Platform Commission</span>
              <span className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.9rem' }}>${fees.msikaNet.toFixed(2)}</span>
            </div>

            <p className="text-gray-400 text-center" style={{ fontSize: '0.75rem' }}>
              * EcoCash B2C rate approximated at 1.5%. Actual rates may vary slightly by transaction band.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Escrow Flow ──────────────────────────────────────────────────────────────

const escrowSteps = [
  {
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200',
    step: '01',
    title: 'Buyer Initiates Payment',
    subtitle: 'EcoCash USSD Push',
    description:
      'Buyer taps "Pay with EcoCash" on Msika. A USSD prompt is sent to their registered EcoCash number. They enter their PIN to confirm.',
    technical: 'POST /api/payments/initiate → EcoCash Merchant API → USSD Push to buyer',
    tag: 'Buyer Action',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Clock,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200',
    step: '02',
    title: 'Msika Awaits Callback',
    subtitle: 'Polling Fallback Active',
    description:
      'EcoCash sends a webhook callback to Msika\'s server. Because EcoCash callbacks are not always instant, Msika simultaneously polls the transaction status endpoint every 30 seconds for up to 10 minutes.',
    technical: 'Webhook: POST /webhooks/ecocash → fallback: GET /api/payments/status/{txRef} every 30s',
    tag: 'System Logic',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Lock,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200',
    step: '03',
    title: 'Funds Locked in Holding Account',
    subtitle: 'Escrow Activated',
    description:
      'Once payment is confirmed (callback OR poll), the full buyer amount is held in Msika\'s dedicated EcoCash Merchant Holding Account. Order status changes to "Payment Confirmed — Awaiting Dispatch."',
    technical: 'DB: orders.escrow_status = "HELD" | EcoCash Holding Merchant Account: MsikaEscrow',
    tag: 'Escrow Locked',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Package,
    color: 'bg-orange-100 text-orange-600',
    borderColor: 'border-orange-200',
    step: '04',
    title: 'Seller Ships & Tracking Is Assigned',
    subtitle: 'DHL / InDrive Integrated',
    description:
      'Seller dispatches via DHL Zimbabwe or InDrive. Msika receives the tracking number from the seller\'s dashboard and registers a tracking webhook with DHL\'s API or an InDrive partner callback.',
    technical: 'DHL: POST /tracking/subscribe | InDrive: Webhook registration on trip_id',
    tag: 'Logistics',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Truck,
    color: 'bg-teal-100 text-teal-600',
    borderColor: 'border-teal-200',
    step: '05',
    title: 'Delivery Confirmed',
    subtitle: 'Trigger: Tracking Status = DELIVERED',
    description:
      'DHL fires a "DELIVERED" event to Msika\'s webhook. For InDrive, the trip completion callback arrives. Msika marks the order as "Delivered" and starts a 24-hour buyer review window.',
    technical: 'DHL Webhook → event.status === "DELIVERED" → trigger escrow_release queue | 24h dispute window',
    tag: 'Auto-Trigger',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Banknote,
    color: 'bg-green-100 text-[#009739]',
    borderColor: 'border-green-200',
    step: '06',
    title: 'Funds Released to Seller',
    subtitle: 'Net Payout via EcoCash B2C',
    description:
      'If no dispute is raised within 24 hours, Msika\'s release engine automatically calculates net payout (deducting 2% Msika commission + 1.5% EcoCash B2C fee) and sends the exact listed price to the seller\'s EcoCash wallet.',
    technical: 'EcoCash B2C API: POST /payments/sendmoney | Amount = listed_price | Fee absorbed from buyer buffer',
    tag: 'Payout Complete',
    tagColor: 'bg-green-100 text-green-700',
  },
];

const fallbackLogic = [
  { title: 'No Callback in 10min', action: 'Mark order as "Payment Pending" — ask buyer to retry. Do NOT proceed with order.' },
  { title: 'Delivery Unconfirmed (7 days)', action: 'Auto-release after 7 days + buyer confirmation SMS. Seller must upload proof of dispatch.' },
  { title: 'Dispute Raised', action: 'Freeze escrow. Manual review team contacts both parties within 48h via Msika Support.' },
  { title: 'EcoCash B2C Fails on Payout', action: 'Retry 3x with exponential backoff. If all fail, hold funds and notify seller to update wallet number.' },
];

// ─── Verified Seller Criteria ─────────────────────────────────────────────────

const verifiedCriteria = [
  {
    number: '01',
    icon: UserCheck,
    title: 'National ID / Passport',
    subtitle: 'Government-issued photo ID',
    description:
      'Seller submits a clear photo of their Zimbabwean National ID (both sides) or a valid passport. Msika\'s KYC engine cross-checks the ID number against the ZIMRA database and performs a liveness check.',
    why: 'Prevents fake accounts. Every seller is a real, traceable Zimbabwean citizen.',
    required: true,
    badge: 'Identity',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Proof of Business Activity',
    subtitle: 'ZIMRA Tax Clearance OR Business Registration',
    description:
      'Either a ZIMRA tax clearance certificate (BP Number) OR a Companies House certificate of incorporation. Sole traders may substitute this with a certified affidavit from a local councillor or headman.',
    why: 'Distinguishes legitimate SMEs from fly-by-night resellers and scammers.',
    required: true,
    badge: 'Legal',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Verified EcoCash Wallet',
    subtitle: 'Active & name-matched mobile money account',
    description:
      'Seller\'s registered EcoCash number must match the name on their National ID. Msika performs a micro-verification: sends ZWL $0.01 and checks the EcoCash confirmation name reply matches ID name.',
    why: 'Ensures payouts land in the correct wallet and blocks SIM-swap fraud.',
    required: true,
    badge: 'Payments',
    color: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    number: '04',
    icon: FileText,
    title: 'Trade Reference / Stock Proof',
    subtitle: '1 supplier invoice OR product photos with receipts',
    description:
      'Seller uploads at least one supplier invoice, import declaration, or purchase receipt proving they legitimately source their products. For handmade goods, 3 photos of their production process suffice.',
    why: 'Prevents the sale of stolen, counterfeit, or "ghost stock" goods that cannot be delivered.',
    required: true,
    badge: 'Inventory',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    number: '05',
    icon: Camera,
    title: 'Selfie Liveness Verification',
    subtitle: 'Real-time selfie matched to submitted ID',
    description:
      'Seller completes a guided selfie check (smile, blink, turn head) within the Msika app. The live selfie is compared to the ID photo using facial recognition. The check must be completed on a smartphone — not a computer.',
    why: 'Prevents identity theft and stops someone applying with another person\'s ID documents.',
    required: true,
    badge: 'Biometrics',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
];

// ─── FAQ / Trust Script ───────────────────────────────────────────────────────

const trustFAQs = [
  {
    question: '"Why can\'t I get paid straight away? On WhatsApp I get money the moment the buyer says yes."',
    answer: `We completely understand — that speed feels great. But let us ask you this: how many times have you heard of a seller who sent goods and then the buyer's EcoCash reversed, or the buyer claimed the item never arrived? With Msika Escrow, that cannot happen to you.

Here is what is different: the buyer's money is taken from them the moment they order. It is not a promise — it is already locked. The only thing standing between that locked money and your wallet is a delivery confirmation. The moment DHL or InDrive confirms your customer received the parcel, Msika releases your full listed price directly to your EcoCash wallet — automatically, no chasing required.`,
  },
  {
    question: '"What if my customer lies and says they never received it?"',
    answer: `This is exactly why we use DHL and InDrive — companies whose tracking systems are independent and tamper-proof. If DHL says "DELIVERED" and the buyer claims they did not receive it, the burden of proof is on the buyer. Msika\'s dispute team will review the tracking data, and in the vast majority of cases, the seller wins because the logistics record is definitive.

Your reputation is protected. If a buyer keeps raising false disputes, they get flagged and removed from Msika. You never have to deal with them again.`,
  },
  {
    question: '"How long do I actually wait to get my money?"',
    answer: `For DHL deliveries: typically 2–5 business days (delivery time) + 24 hours (buyer review window) = approximately 3–6 days.

For InDrive same-day deliveries in Bulawayo: usually 2–4 hours from dispatch + 24-hour window = your money by the next morning.

Compare this to a buyer on Facebook Marketplace who has "already transferred but it is just showing pending" — and never pays. With Msika, the money is guaranteed from the moment the order is placed. You are just waiting for delivery, which you would wait for anyway.`,
  },
  {
    question: '"What exactly does Msika take from my sale?"',
    answer: `Msika charges a 2% commission on every sale. This is the smallest marketplace fee in Zimbabwe.

Here is the important part: the fees are structured so YOU receive exactly the price you listed. The 2% Msika commission and the 1.5% EcoCash transfer fee are added on top of your listed price and charged to the buyer — not deducted from you. If you list a shirt for $30, you receive $30 in your EcoCash wallet. The buyer pays $30.95.

Use our Fee Calculator on this page to see the exact breakdown before you list any product.`,
  },
  {
    question: '"What does being a Verified Seller actually mean for my business?"',
    answer: `The green Verified badge next to your store name is the single most powerful trust signal in the Zimbabwean online marketplace space. Studies in similar markets show verified sellers receive 3× more orders and 40% fewer buyer disputes than unverified stores.

It means: buyers know you are a real person, your business is legitimate, and Msika has checked your identity. In a market where scams are rampant, this badge is your competitive advantage. It is not just a badge — it is your reputation, protected and displayed to every buyer who visits your store.`,
  },
];

function FAQItem({ faq, index }: { faq: typeof trustFAQs[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-gray-800" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {faq.question}
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white border-t border-gray-100">
          {faq.answer.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-600 mt-3 leading-relaxed" style={{ fontSize: '0.875rem' }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TrustCenterPage() {
  const [activeTab, setActiveTab] = useState<'escrow' | 'seller' | 'script'>('escrow');

  const tabs = [
    { id: 'escrow' as const, label: 'Escrow Architecture', icon: Lock },
    { id: 'seller' as const, label: 'Verified Seller Program', icon: BadgeCheck },
    { id: 'script' as const, label: 'Seller Trust Script', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#009739] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#009739]" style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Msika Trust Center
            </span>
          </div>
          <h1 className="text-gray-900 mb-3" style={{ fontSize: '2rem', fontWeight: 800 }}>
            How Msika Protects Every Transaction
          </h1>
          <p className="text-gray-500 max-w-2xl" style={{ fontSize: '1rem' }}>
            Our EcoCash Escrow system, Verified Seller program, and transparent fee structure are the
            foundation of trust between every buyer and seller on the platform.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            {[
              { value: '2%', label: 'Platform Commission', icon: CreditCard },
              { value: '24h', label: 'Buyer Review Window', icon: Clock },
              { value: '5', label: 'Seller Verification Checks', icon: CheckCircle2 },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
                <stat.icon className="w-5 h-5 text-[#009739] mb-2" />
                <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.4rem' }}>{stat.value}</span>
                <span className="text-gray-500 mt-0.5" style={{ fontSize: '0.75rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#009739] text-[#009739]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.875rem' }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ══════════════════ TAB: ESCROW ARCHITECTURE ══════════════════ */}
        {activeTab === 'escrow' && (
          <div className="space-y-10">

            {/* Intro callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  The EcoCash Callback Challenge
                </p>
                <p className="text-amber-700 mt-1" style={{ fontSize: '0.825rem', lineHeight: '1.6' }}>
                  EcoCash does not always fire instant callbacks for every transaction type (USSD Push vs. Paynow vs. direct transfer).
                  Msika solves this with a <strong>dual-confirmation system</strong>: primary callback listener + active polling fallback.
                  No order ever proceeds without verified fund receipt.
                </p>
              </div>
            </div>

            {/* Step flow */}
            <div>
              <h2 className="text-gray-900 mb-6" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                6-Step EcoCash Escrow Flow
              </h2>
              <div className="space-y-4">
                {escrowSteps.map((step, i) => (
                  <div key={step.step} className={`bg-white border ${step.borderColor} rounded-2xl p-5`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-gray-300" style={{ fontWeight: 800, fontSize: '0.75rem' }}>STEP {step.step}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${step.tagColor}`} style={{ fontWeight: 600 }}>
                            {step.tag}
                          </span>
                        </div>
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.975rem' }}>{step.title}</h3>
                        <p className="text-gray-500 mt-0.5 mb-2" style={{ fontSize: '0.8rem' }}>{step.subtitle}</p>
                        <p className="text-gray-600" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{step.description}</p>
                        <div className="mt-3 bg-gray-900 text-green-400 rounded-lg px-4 py-2 font-mono" style={{ fontSize: '0.72rem' }}>
                          {step.technical}
                        </div>
                      </div>
                    </div>
                    {i < escrowSteps.length - 1 && (
                      <div className="flex justify-center mt-3">
                        <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fallback Logic */}
            <div>
              <h2 className="text-gray-900 mb-4" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                Edge Cases & Fallback Logic
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {fallbackLogic.map(item => (
                  <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
                    <RotateCcw className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.title}</p>
                      <p className="text-gray-500 mt-1" style={{ fontSize: '0.8rem', lineHeight: '1.55' }}>{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Calculator */}
            <div>
              <h2 className="text-gray-900 mb-4" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                Automated Fee Calculation Engine
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeeCalculator />
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h4 className="text-gray-900 mb-3 flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      <Zap className="w-4 h-4 text-[#009739]" />
                      How the Payout Engine Works
                    </h4>
                    <ol className="space-y-3">
                      {[
                        { n: '1', text: 'Delivery webhook fires "DELIVERED"' },
                        { n: '2', text: '24-hour dispute window starts (buyer notified by SMS)' },
                        { n: '3', text: 'If no dispute: release_escrow() function runs' },
                        { n: '4', text: 'System calculates: payout = listed_price (fees already collected from buyer\'s buffer)' },
                        { n: '5', text: 'EcoCash B2C API call sends exact amount to seller wallet' },
                        { n: '6', text: 'Seller receives SMS: "Msika has paid $X to your EcoCash wallet for Order #Y"' },
                      ].map(item => (
                        <li key={item.n} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#009739] text-white flex items-center justify-center flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.65rem' }}>
                            {item.n}
                          </span>
                          <span className="text-gray-600" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>{item.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="bg-[#009739] rounded-2xl p-5 text-white">
                    <Info className="w-4 h-4 text-green-200 mb-2" />
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Why Sellers Always Get the Listed Price</p>
                    <p className="text-green-100 mt-2" style={{ fontSize: '0.82rem', lineHeight: '1.6' }}>
                      Msika's fee model charges the <strong>buyer</strong> the service fee on top of the listed price — not the seller.
                      This means sellers list their true expected amount, buyers see transparent pricing, and there's no post-sale
                      fee shock for either party.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ TAB: VERIFIED SELLER ══════════════════ */}
        {activeTab === 'seller' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-gray-900 mb-2" style={{ fontWeight: 800, fontSize: '1.4rem' }}>
                The Msika Verified Seller Program
              </h2>
              <p className="text-gray-500 max-w-2xl" style={{ fontSize: '0.9rem', lineHeight: '1.65' }}>
                In a market where Facebook Marketplace and WhatsApp groups are rife with scammers,
                the Msika Verified badge is a meaningful signal. These 5 checks are designed specifically
                for the Zimbabwean business context.
              </p>
            </div>

            <div className="space-y-5">
              {verifiedCriteria.map((criteria) => (
                <div key={criteria.number} className={`bg-white border rounded-2xl overflow-hidden`}>
                  <div className="flex items-start gap-5 p-6">
                    <div className={`w-12 h-12 rounded-xl border ${criteria.color} flex items-center justify-center flex-shrink-0`}>
                      <criteria.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-gray-300" style={{ fontWeight: 800, fontSize: '0.75rem' }}>#{criteria.number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${criteria.color}`} style={{ fontWeight: 700 }}>
                          {criteria.badge}
                        </span>
                        {criteria.required && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200" style={{ fontWeight: 600 }}>
                            Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-900 mb-0.5" style={{ fontWeight: 700, fontSize: '1rem' }}>{criteria.title}</h3>
                      <p className="text-gray-400 mb-3" style={{ fontSize: '0.8rem' }}>{criteria.subtitle}</p>
                      <p className="text-gray-600 mb-4" style={{ fontSize: '0.85rem', lineHeight: '1.65' }}>{criteria.description}</p>
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#009739] flex-shrink-0 mt-0.5" />
                        <p className="text-green-800" style={{ fontSize: '0.8rem', lineHeight: '1.55' }}>
                          <strong>Why this matters:</strong> {criteria.why}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification process timeline */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-900 mb-5" style={{ fontWeight: 700, fontSize: '1rem' }}>
                Verification Timeline
              </h3>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {[
                  { step: 'Apply', time: 'Day 0', desc: 'Submit all 5 documents via app', color: 'bg-gray-100 text-gray-600' },
                  { step: 'Auto-Check', time: 'Minutes', desc: 'ID format & EcoCash wallet verification', color: 'bg-blue-100 text-blue-600' },
                  { step: 'Manual Review', time: '24–48h', desc: 'Msika team reviews business docs', color: 'bg-amber-100 text-amber-600' },
                  { step: 'Approved', time: 'Day 2', desc: 'Badge activated. Escrow unlocked.', color: 'bg-green-100 text-green-700' },
                ].map((item, i, arr) => (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center text-center min-w-[120px]">
                      <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mb-2`} style={{ fontWeight: 700, fontSize: '0.7rem' }}>
                        {i + 1}
                      </div>
                      <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{item.step}</p>
                      <p className="text-[#009739]" style={{ fontWeight: 600, fontSize: '0.72rem' }}>{item.time}</p>
                      <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2 mb-8" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* What Verified badge gets you */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Benefits of the Verified Badge</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { stat: '3×', label: 'More orders on average' },
                  { stat: '40%', label: 'Fewer buyer disputes' },
                  { stat: 'Top', label: 'Priority in search results' },
                  { stat: 'Free', label: 'Dispute protection guarantee' },
                ].map(item => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-4 text-center">
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#4ade80' }}>{item.stat}</div>
                    <div className="text-gray-300 mt-1" style={{ fontSize: '0.75rem' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ TAB: TRUST SCRIPT ══════════════════ */}
        {activeTab === 'script' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-gray-900 mb-2" style={{ fontWeight: 800, fontSize: '1.4rem' }}>
                Seller Objection Guide — "The Trust Script"
              </h2>
              <p className="text-gray-500 max-w-2xl" style={{ fontSize: '0.9rem', lineHeight: '1.65' }}>
                These are the real questions Zimbabwean SME sellers ask when they first encounter escrow.
                These answers are designed for Msika's onboarding team and can also be shown directly
                to sellers during signup. Each answer validates their concern, then reframes escrow as
                protection <em>for them</em> — not a barrier.
              </p>
            </div>

            {/* Trust signal banner */}
            <div className="bg-[#009739] rounded-2xl p-6 text-white flex gap-5">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Msika Escrow is Not a Punishment — It's Your Shield
                </p>
                <p className="text-green-100 mt-2" style={{ fontSize: '0.85rem', lineHeight: '1.65' }}>
                  On WhatsApp, you trust a stranger with your goods before you get money. On Msika, the buyer
                  trusts Msika with their money before they get their goods. The money is always real, always
                  confirmed, always waiting for you. You just need to deliver.
                </p>
              </div>
            </div>

            {/* FAQ accordion */}
            <div className="space-y-3">
              {trustFAQs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </div>

            {/* Quick reference card for support team */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>
                Quick Reference: Key Phrases for Onboarding Conversations
              </h3>
              <div className="grid gap-3">
                {[
                  {
                    avoid: '"Your money is held for X days"',
                    use: '"Your money is confirmed and waiting — it releases the moment delivery is confirmed."',
                  },
                  {
                    avoid: '"We take a 2% cut from your sale"',
                    use: '"The buyer pays our fee on top of your listed price. You always receive what you asked for."',
                  },
                  {
                    avoid: '"You have to wait for delivery before getting paid"',
                    use: '"The fastest payout is through fastest delivery — InDrive sellers often see same-day payouts."',
                  },
                  {
                    avoid: '"Escrow protects the buyer"',
                    use: '"Escrow protects your reputation. A scammer cannot claim non-delivery when DHL says DELIVERED."',
                  },
                ].map((phrase, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
                      <span className="text-red-400 flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>AVOID</span>
                      <p className="text-red-700" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>{phrase.avoid}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2">
                      <span className="text-green-700 flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>USE</span>
                      <p className="text-green-800" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>{phrase.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}