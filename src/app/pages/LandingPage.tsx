import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Search, ArrowRight, ShoppingBag, Store,
  CheckCircle, Package, ArrowUpRight,
  Building2, MapPin, UserCheck, CreditCard, BadgeCheck,
  Lock, Clock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useProducts } from '../../lib/hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

// ── Images ────────────────────────────────────────────────────────────────────
const HERO_IMG         = 'https://images.unsplash.com/photo-1545206085-d0e519bdcecd?w=1800&q=90&fit=crop&crop=center';
const CAMPAIGN_FASHION = 'https://images.unsplash.com/photo-1536960495701-78905c1f6c41?w=800&q=80&fit=crop';
const CAMPAIGN_BEAUTY  = 'https://images.unsplash.com/photo-1613876215075-276fd62c89a4?w=800&q=80&fit=crop';
const CAMPAIGN_CRAFTS  = 'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?w=800&q=80&fit=crop';

// ── Marquee ticker items ──────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Shop Local Products', 'Pay with EcoCash', 'Verified Sellers Only',
  'Same-Day InDrive Delivery', 'Seller Dashboard', 'Made in Zimbabwe',
  '4.8 Star Rated', 'Local Products', 'Seller Dashboard',
  'Shop Local Products', 'Pay with EcoCash', 'Verified Sellers Only',
  'Same-Day InDrive Delivery', 'Seller Dashboard', 'Made in Zimbabwe',
];

// ── Condensed headline font helper ─────────────────────────────────────────────
const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

export const LandingPage = () => {
  const { user } = useStore();
  const navigate  = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { products } = useProducts();
  const newProducts = products.filter(p => p.isNew);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="w-full bg-white">

      {/* ──────────────────────────────────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black" style={{ minHeight: '85vh' }}>
        <style>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .marquee-track { animation: marquee 32s linear infinite; display: flex; width: max-content; }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>

        <img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.45 }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />

        <div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-between"
          style={{ minHeight: '95vh', paddingTop: '7rem', paddingBottom: '3.5rem' }}
        >
          {/* TOP spacer — keeps flex justify-between balanced */}
          <div />

          {/* MAIN content */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009739] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#009739]" />
              </span>
              <span className="text-white/80" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Zimbabwe's Online Marketplace
              </span>
            </div>

            <h1
              className="text-white mb-6"
              style={{ ...DISPLAY_FONT, fontSize: 'clamp(3.8rem, 9vw, 7.5rem)', fontWeight: 900, lineHeight: 0.88 }}
            >
              Shop Local.
            </h1>
            <p className="text-gray-300 mb-8 max-w-lg" style={{ fontSize: '1rem', lineHeight: 1.65 }}>
              Zimbabwe's growing online marketplace — browse thousands of products from verified local sellers, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl transition-colors"
                style={{ fontSize: '0.9rem', fontWeight: 700 }}
              >
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
              {!user && (
                <Link
                  to="/seller-onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl transition-all"
                  style={{ fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.08)' }}
                >
                  <Store className="w-4 h-4" /> Sell on Msika
                </Link>
              )}
            </div>
          </div>

          {/* STATS bar */}
          <div className="flex items-center gap-6 flex-wrap pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {[
              { value: '50+', label: 'Verified Sellers' },
              { value: '20+', label: 'Happy Buyers' },
              { value: '24h', label: 'Available' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)' }} />}
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFD100' }}>{s.value}</p>
                  <p className="text-white/40" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          2. TICKER
      ────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#009739] overflow-hidden py-3 select-none" aria-hidden="true">
        <div className="marquee-track">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="mx-6" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap', color: 'white' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          3. PICK YOUR PATH
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Choose your journey">
        <div className="text-center mb-8">
          <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pick Your Path</p>
          <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>What brings you to Msika?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: '#009739', minHeight: '260px' }}
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', fontWeight: 700, color: '#FFD100', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                For Buyers
              </span>
              <h3 className="text-white mb-2" style={{ ...DISPLAY_FONT, fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Start Shopping</h3>
              <p className="text-white/70" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Browse thousands of products from verified local sellers. Pay with EcoCash. Protected by Msika Escrow.
              </p>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-white" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
              Browse the marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/seller-onboarding')}
            className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: '#111111', minHeight: '260px' }}
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(0,151,57,0.12)' }} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', fontWeight: 700, color: '#FFD100', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                For Sellers
              </span>
              <h3 className="text-white mb-2" style={{ ...DISPLAY_FONT, fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Open Your Store</h3>
              <p className="text-white/60" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                6 months free access. Your own branded storefront. Reach buyers across Zimbabwe. Get paid via EcoCash.
              </p>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.875rem', color: '#009739' }}>
              Start selling today <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          4. BROWSE BY CATEGORY
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Browse by category">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Curated Collections</p>
            <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Browse by Category</h2>
          </div>
          <button onClick={() => navigate('/all-categories')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { img: CAMPAIGN_FASHION, label: 'Fashion', sub: '120+ Items', cat: 'Fashion & Clothing' },
            { img: CAMPAIGN_BEAUTY,  label: 'Beauty',  sub: '85+ Items',  cat: 'Cosmetics & Beauty' },
            { img: CAMPAIGN_CRAFTS,  label: 'Crafts',  sub: '30+ Items',  cat: 'Handmade & Crafts'  },
          ].map(panel => (
            <div key={panel.label} className="w-full" style={{ aspectRatio: '3 / 4', position: 'relative' }}>
              <button
                onClick={() => navigate(`/categories?cat=${encodeURIComponent(panel.cat)}`)}
                className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl text-left group cursor-pointer focus:outline-none"
                style={{ border: 'none', padding: 0, display: 'block' }}
                aria-label={`Browse ${panel.label}`}
              >
                <img src={panel.img} alt={panel.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0.18) 58%, rgba(0,0,0,0.04) 76%)' }} />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex flex-col items-start">
                  <p className="text-white/55 mb-1" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{panel.sub}</p>
                  <p className="text-white mb-4" style={{ ...DISPLAY_FONT, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, lineHeight: 1 }}>{panel.label}</p>
                  <span
                    className="inline-flex items-center gap-1.5 text-white transition-all duration-300 group-hover:bg-[#009739] group-hover:border-[#009739]"
                    style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(20,20,20,0.75)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                  >
                    Shop Now <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          5. TOP RATED
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Top rated products">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Highest Rated</p>
            <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Top Rated</h2>
          </div>
          <button onClick={() => navigate('/shop?filter=top-rated')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...products].sort((a, b) => b.rating - a.rating).slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          6. NEW ARRIVALS
      ────────────────────────────────────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="New arrivals">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Just Dropped</p>
              <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>New Arrivals</h2>
            </div>
            <button onClick={() => navigate('/shop?filter=new')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          7. FULL SELLER VERIFICATION SYSTEM (dark)
      ────────────────────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#111' }} aria-label="How sellers are verified">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(255,209,0,0.1)', border: '1px solid rgba(255,209,0,0.2)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: '#FFD100' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>
                Coming in 2027
              </span>
            </div>
            <h2 className="text-white mb-3" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              Full Seller Verification System
            </h2>
            <p className="text-gray-400 mx-auto" style={{ fontSize: '0.88rem', maxWidth: '520px' }}>
              We're building a 5-step verified seller programme — launching in 2027. Every seller will be rigorously screened before going live. No shortcuts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {[
              { step: '01', icon: Building2, label: 'Business Docs',  note: 'Proof of registration' },
              { step: '02', icon: MapPin,     label: 'Address Check',  note: 'Physical location' },
              { step: '03', icon: UserCheck,  label: 'Identity',       note: 'National ID / passport' },
              { step: '04', icon: CreditCard, label: 'Payment Link',   note: 'EcoCash / bank account' },
              { step: '05', icon: BadgeCheck, label: 'Msika Approval', note: 'Manual review' },
            ].map((card) => (
              <div
                key={card.step}
                className="flex-1 flex flex-col gap-2 rounded-xl px-4 py-4 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}
              >
                <div className="absolute top-2.5 right-2.5">
                  <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <card.icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                </div>
                <div>
                  <p className="text-gray-600" style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step {card.step}</p>
                  <p className="text-gray-300" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{card.label}</p>
                  <p className="text-gray-600" style={{ fontSize: '0.7rem' }}>{card.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 py-3 px-5 rounded-xl" style={{ background: 'rgba(255,209,0,0.06)', border: '1px solid rgba(255,209,0,0.15)' }}>
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#FFD100' }} />
              <p className="text-gray-400" style={{ fontSize: '0.78rem' }}>
                <span style={{ color: '#FFD100', fontWeight: 700 }}>Target launch: 2027.</span> Currently in design phase — all sellers are manually approved by the Msika team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          8. START SELLING ON MSIKA
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Seller program">
        <div className="text-center mb-8">
          <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Seller Program</p>
          <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Start Selling on Msika</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Early Access — Green */}
          <button
            onClick={() => navigate('/seller-onboarding')}
            className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: '#009739', minHeight: '260px' }}
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', fontWeight: 700, color: '#FFD100', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                First 1,000 Sellers
              </span>
              <h3 className="text-white mb-2" style={{ ...DISPLAY_FONT, fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Early Access</h3>
              <div className="mb-3">
                <span className="text-white" style={{ fontSize: '2rem', fontWeight: 800 }}>$0</span>
                <span className="text-white/60" style={{ fontSize: '0.85rem' }}> / 6 months</span>
              </div>
              <ul className="space-y-1.5">
                {['6 months FREE store access', 'Your own branded storefront', 'Featured in marketplace'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/80" style={{ fontSize: '0.82rem' }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 text-[#FFD100]" strokeWidth={1.5} fill="none" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-white" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Verified Store — Dark */}
          <button
            onClick={() => navigate('/seller-onboarding')}
            className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: '#111111', minHeight: '260px' }}
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(0,151,57,0.12)' }} />
            </div>
            <div className="absolute top-6 right-6">
              <span className="inline-block px-2.5 py-0.5 bg-[#FFD100] text-gray-900 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em' }}>BEST VALUE</span>
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', fontWeight: 700, color: '#FFD100', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                After Free Period
              </span>
              <h3 className="text-white mb-2" style={{ ...DISPLAY_FONT, fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Verified Store</h3>
              <div className="mb-3">
                <span className="text-white" style={{ fontSize: '2rem', fontWeight: 800 }}>$2</span>
                <span className="text-white/60" style={{ fontSize: '0.85rem' }}> / month</span>
              </div>
              <ul className="space-y-1.5">
                {['Everything in Early Access', 'Seller dashboard & analytics', 'Verified seller badge', 'EcoCash payouts', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/70" style={{ fontSize: '0.82rem' }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} strokeWidth={1.5} fill="none" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.875rem', color: '#009739' }}>
              Get Verified <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          9. WHERE WE'RE HEADED (dark roadmap)
      ────────────────────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#111' }} aria-label="Platform roadmap">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(255,209,0,0.1)', border: '1px solid rgba(255,209,0,0.2)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: '#FFD100' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>
                Platform Roadmap
              </span>
            </div>
            <h2 className="text-white mb-3" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Where We're Headed</h2>
            <p className="text-gray-400 mx-auto" style={{ fontSize: '0.88rem', maxWidth: '500px' }}>
              These features are planned milestones as Msika grows. We're building in public — every step below represents a commitment to our users.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Store,      year: '2025–26', title: 'Onboard 1,000 Sellers',       desc: 'Our first milestone — recruit and verify 1,000 quality Zimbabwean sellers before scaling the platform to all buyers.',             status: 'Active Now',     statusColor: '#009739' },
              { step: '02', icon: Search,     year: '2026',    title: 'Discover Local Products',      desc: 'A full search experience across verified Zimbabwean sellers — filter by category, city, price, and seller rating.',               status: 'In Development', statusColor: '#FFD100' },
              { step: '03', icon: CreditCard, year: '2026–27', title: 'EcoCash Escrow Payments',      desc: 'Secure checkout via EcoCash, Innbucks, and OneMoney. Funds held in escrow and released only after confirmed delivery.',          status: 'Planned',        statusColor: '#FFD100' },
              { step: '04', icon: Package,    year: '2027',    title: 'End-to-End Delivery Tracking', desc: 'Real-time delivery updates via InDrive, DHL, and trusted local couriers — or collect directly from the seller.',                 status: 'Future',         statusColor: '#CE1126' },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}
              >
                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full" style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.06em', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                  {item.year}
                </span>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(0,151,57,0.12)', border: '1px dashed rgba(0,151,57,0.3)' }}>
                  <item.icon className="w-6 h-6" style={{ color: '#009739', opacity: 0.8 }} />
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-[52px] left-[calc(50%+36px)] right-0 border-t-2 border-dashed border-white/10" />
                )}
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mb-3"
                  style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', background: `${item.statusColor}20`, color: item.statusColor, border: `1px solid ${item.statusColor}35` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.statusColor }} />
                  {item.status}
                </span>
                <span className="text-white/30 mb-1.5" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step {item.step}</span>
                <h3 className="text-white mb-2" style={{ fontSize: '1rem', fontWeight: 700 }}>{item.title}</h3>
                <p className="text-gray-500 max-w-xs leading-relaxed" style={{ fontSize: '0.83rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          10. SPONSORED — Products You'll Love
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Sponsored products">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Sponsored</p>
            <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Products You'll Love</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {products.filter(p => p.isDeal || p.isNew).slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          11. GET IN TOUCH
      ────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20" style={{ background: '#0a0a0a' }} aria-label="Get in touch">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,151,57,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,209,0,0.04)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>Get in Touch</p>
          <h2 className="text-white mb-3" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Chat with the Msika Team
          </h2>
          <p className="text-gray-400 mb-8 mx-auto" style={{ fontSize: '0.9rem', maxWidth: '420px' }}>
            Questions about selling, buying, or partnerships? Send us a message on WhatsApp — we reply fast.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex items-center overflow-hidden rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="rgba(255,255,255,0.6)"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
                </svg>
                <span className="text-white/50" style={{ fontSize: '0.88rem' }}>+263 · WhatsApp</span>
              </div>
              {/* Replace 263771234567 with your real WhatsApp number */}
              <a
                href="https://wa.me/263771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="m-1.5 px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-lg shrink-0 transition-colors inline-flex items-center gap-2"
                style={{ fontSize: '0.85rem', fontWeight: 700 }}
              >
                Message Us
              </a>
            </div>
            <p className="text-gray-500 mt-4" style={{ fontSize: '0.7rem' }}>
              Typically replies within 1 hour · Mon – Sat, 8 am – 8 pm CAT
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};