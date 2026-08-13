import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle, Search, MapPin, ArrowRight, Package,
  Sparkles, X, Trophy, Zap, ChevronLeft, Clock, SlidersHorizontal,
} from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { SellerLogo } from '../components/SellerLogo';
import { SellerBanner } from '../components/SellerBanner';
import { FilterDropdown } from '../components/FilterDropdown';
import { MobileFilterDrawer } from '../components/MobileFilterDrawer';
import { useSellers } from '../../lib/hooks/useProducts';
import { categories } from '../data/mockData';

const SHOPS_BANNER = 'https://images.unsplash.com/photo-1751965681712-697c555b8188?w=1600&q=80&fit=crop';

const SHOP_SORT_OPTIONS = [
  { label: 'Featured',        value: 'default'  },
  { label: 'Highest Rated',   value: 'rating'   },
  { label: 'Most Products',   value: 'products' },
  { label: 'Newest First',    value: 'newest'   },
  { label: 'A – Z',           value: 'az'       },
];

// ── Reusable spotlight card ───────────────────────────────────────────────────
function SpotlightCard({
  seller, badge, accentColor,
}: {
  seller: { id: string; name: string; banner: string; logo: string; verified: boolean; location: string; rating: number; reviewCount: number; productCount: number; category: string; joined?: string };
  badge?: string;
  accentColor?: string;
}) {
  const navigate = useNavigate();
  const productCount = seller.productCount;

  return (
    <button
      onClick={() => navigate(`/store/${seller.id}`)}
      className="group bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden text-left hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      aria-label={`Visit ${seller.name}`}
    >
      {/* Banner */}
      <div className="relative overflow-hidden bg-gray-100 shrink-0" style={{ height: '140px' }}>
        <SellerBanner
          name={seller.name}
          src={seller.banner}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)' }} />

        {/* Rating pill */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <StarRating size={11} />
          <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{seller.rating}</span>
        </div>

        {/* Verified badge */}
        {seller.verified && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 text-white text-[10px] px-2.5 py-1 rounded-full"
            style={{ fontWeight: 700, background: 'rgba(0,151,57,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        )}

        {/* Section badge */}
        {badge && (
          <span
            className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full"
            style={{
              fontWeight: 700,
              background: accentColor,
              color: accentColor === '#FFD100' ? '#7a5c00' : '#fff',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="-mt-10 relative mb-3">
          <SellerLogo
            name={seller.name}
            src={seller.logo}
            className="w-14 h-14 rounded-2xl object-cover shadow-lg"
            style={{ border: '3px solid #fff', fontSize: '1rem' }}
          />
        </div>
        <p className="text-gray-900 mb-0.5 truncate" style={{ fontSize: '1rem', fontWeight: 700 }}>{seller.name}</p>
        {seller.category && <p className="text-gray-500 mb-3" style={{ fontSize: '0.78rem' }}>{seller.category}</p>}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.72rem' }}>
            <MapPin className="w-3 h-3 shrink-0" /> {seller.location}
          </span>
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.72rem' }}>
            <Package className="w-3 h-3 shrink-0" /> {productCount} items
          </span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>Since {seller.joined}</span>
          <span className="flex items-center gap-1 text-[#009739] group-hover:gap-2 transition-all" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
            Visit shop <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon, iconBg, overline, overlineColor, title,
}: {
  icon: React.ReactNode;
  iconBg: string;
  overline: string;
  overlineColor: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: overlineColor }}>
            {overline}
          </p>
          <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{title}</h2>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ShopsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { sellers } = useSellers();

  const ALL_CATEGORIES = ['All', ...categories.map(c => c.name)];
  const sortedByDate     = [...sellers].sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
  const newestSellers    = sortedByDate.slice(0, 3);
  const risingStars      = sortedByDate.slice(3, 6);
  const topRatedSellers  = [...sellers].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const hasActiveFilters = activeCategory !== 'All' || search.trim() !== '' || sortBy !== 'default';
  const activeFilterCount = [activeCategory !== 'All', search.trim() !== '', sortBy !== 'default'].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setActiveCategory('All'); setSortBy('default'); };

  const filteredSellers = useMemo(() => {
    let list = [...sellers];
    if (activeCategory !== 'All') list = list.filter(s => s.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'rating':   return list.sort((a, b) => b.rating - a.rating);
      case 'products': return list.sort((a, b) => b.productCount - a.productCount);
      case 'newest':   return list.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
      case 'az':       return list.sort((a, b) => a.name.localeCompare(b.name));
      default:         return list;
    }
  }, [activeCategory, search, sortBy]);

  return (
    <div className="w-full bg-white min-h-screen">

      {/* ── PAGE HEADER ── */}
      <section style={{ background: '#111' }}>
        {/* Banner image */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={SHOPS_BANNER}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-55"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#111]" />
          {/* Back button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/80 border border-white/15 cursor-pointer transition-colors"
              style={{ fontWeight: 600 }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mt-6 relative z-10">
            {/* Title + meta */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Discover Local Shops</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                  <CheckCircle className="w-3 h-3" /> Verified Businesses
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{sellers.length}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>sellers registered</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Zimbabwe
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <Clock className="w-3.5 h-3.5" /> Usually replies in 15 min
                </div>
              </div>
              <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>
                Browse trusted local Zimbabwean sellers — from fashion boutiques to food markets and everything in between.
              </p>
            </div>

            {/* Mobile filters trigger */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl cursor-pointer shrink-0 border-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#009739] text-white flex items-center justify-center" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN LAYOUT: sidebar filters + content ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex gap-6 items-start">

          {/* ─── Left Sidebar ─── */}
          <aside className="hidden md:flex flex-col gap-3 w-56 shrink-0 sticky top-20">

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search shops…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#009739] transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Categories</h3>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {ALL_CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <label
                        className="w-full px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors"
                        style={{ background: isActive ? '#f0faf4' : 'transparent' }}
                      >
                        <input
                          type="radio"
                          name="shops-category"
                          checked={isActive}
                          onChange={() => setActiveCategory(cat)}
                          className="accent-[#009739]"
                        />
                        <span
                          className="flex-1 truncate"
                          style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 400, color: isActive ? '#009739' : '#374151' }}
                        >
                          {cat}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                style={{ fontSize: '0.8rem', fontWeight: 600 }}
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </aside>

          {/* ─── Main content ─── */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips + sort + result count */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== 'All' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {activeCategory}
                    <button onClick={() => setActiveCategory('All')} className="p-0 bg-transparent border-none cursor-pointer leading-none"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search.trim() && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    "{search.trim()}"
                    <button onClick={() => setSearch('')} className="p-0 bg-transparent border-none cursor-pointer leading-none"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <span className="text-gray-500" style={{ fontSize: '0.82rem' }}>
                  <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredSellers.length}</span> shops
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-500 hidden sm:block" style={{ fontSize: '0.8rem' }}>Sort:</span>
                <FilterDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={SHOP_SORT_OPTIONS} />
              </div>
            </div>

            {hasActiveFilters ? (
              filteredSellers.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gray-100">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No shops found</h3>
                  <p className="text-gray-500 mb-5" style={{ fontSize: '0.875rem' }}>Try a different category or search term</p>
                  <button onClick={clearFilters} className="px-6 py-2.5 bg-[#009739] text-white rounded-xl hover:bg-[#007f30] transition-colors cursor-pointer border-none" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {filteredSellers.map(seller => (
                    <SpotlightCard key={seller.id} seller={seller} />
                  ))}
                </div>
              )
            ) : (
              /* ── SECTIONED BROWSE VIEW (no filters) ── */
              <div className="divide-y divide-gray-100">

                {/* Fresh Arrivals / New to Msika */}
                <section className="pb-14">
                  <SectionHeader
                    icon={<Sparkles className="w-4 h-4 text-[#009739]" />}
                    iconBg="rgba(0,151,57,0.08)"
                    overline="Fresh Arrivals"
                    overlineColor="#009739"
                    title="New to Msika"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {newestSellers.map(seller => (
                      <SpotlightCard
                        key={seller.id}
                        seller={seller}
                        badge="Just joined"
                        accentColor="#009739"
                      />
                    ))}
                  </div>
                </section>

                {/* Rising Stars / Sellers to Watch */}
                <section className="py-14">
                  <SectionHeader
                    icon={<Zap className="w-4 h-4" style={{ color: '#b8930a' }} />}
                    iconBg="rgba(255,209,0,0.12)"
                    overline="Rising Stars"
                    overlineColor="#b8930a"
                    title="Sellers to Watch"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {risingStars.map(seller => (
                      <SpotlightCard
                        key={seller.id}
                        seller={seller}
                        badge="On the rise"
                        accentColor="#FFD100"
                      />
                    ))}
                  </div>
                </section>

                {/* Community Favourites — Top Rated */}
                <section className="pt-14">
                  <SectionHeader
                    icon={<Trophy className="w-4 h-4" style={{ color: '#b8930a' }} />}
                    iconBg="rgba(255,209,0,0.12)"
                    overline="Community Favourites"
                    overlineColor="#b8930a"
                    title="Top Rated Sellers"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {topRatedSellers.slice(0, 3).map((seller, idx) => {
                      const rankAccents = ['#FFD100', '#9ca3af', '#cd7f32'];
                      const rankLabels  = ['#1 Rated', '#2 Rated', '#3 Rated'];
                      return (
                        <SpotlightCard
                          key={seller.id}
                          seller={seller}
                          badge={rankLabels[idx]}
                          accentColor={rankAccents[idx]}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      <MobileFilterDrawer isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
        <div>
          <p className="text-gray-500 mb-3" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search shops…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009739]"
            />
          </div>
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</p>
          <ul className="max-h-56 overflow-y-auto rounded-xl border border-gray-200">
            {ALL_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <li key={cat}>
                  <label
                    className="w-full px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors"
                    style={{ background: isActive ? '#f0faf4' : 'transparent' }}
                  >
                    <input
                      type="radio"
                      name="shops-category-mobile"
                      checked={isActive}
                      onChange={() => setActiveCategory(cat)}
                      className="accent-[#009739]"
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 400, color: isActive ? '#009739' : '#374151' }}>
                      {cat}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort By</p>
          <FilterDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={SHOP_SORT_OPTIONS} minWidth="100%" />
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="w-full py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            <X className="w-3.5 h-3.5 inline mr-1" /> Clear All Filters
          </button>
        )}
        <button
          onClick={() => setShowMobileFilters(false)}
          className="w-full py-3 bg-[#009739] text-white rounded-xl transition-colors border-none"
          style={{ fontWeight: 700, fontSize: '0.88rem' }}
        >
          Show {filteredSellers.length} Results
        </button>
      </MobileFilterDrawer>

      {/* ── OPEN A SHOP ── */}
      <section className="border-t border-[#EAEAEA] py-14 bg-white" aria-label="Seller program">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <p className="text-[#009739] mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Seller Program</p>
            <h2 className="text-gray-900" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Open a Shop on Msika</h2>
            <p className="text-gray-500 mt-1 mx-auto" style={{ fontSize: '0.875rem', maxWidth: '420px' }}>
              Join hundreds of Zimbabwean businesses already selling on Msika — free to start.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Early Access — Green */}
            <button
              onClick={() => navigate('/seller-onboarding')}
              className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer border-none"
              style={{ background: '#009739', minHeight: '260px' }}
            >
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', fontWeight: 700, color: '#FFD100', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  First 1,000 Sellers
                </span>
                <h3 className="text-white mb-2" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Early Access</h3>
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
              className="group relative overflow-hidden rounded-2xl text-left p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer border-none"
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
                <h3 className="text-white mb-2" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>Verified Store</h3>
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
        </div>
      </section>

      {/* ── CHAT WITH THE MSIKA TEAM ── */}
      <section className="relative overflow-hidden py-20" style={{ background: '#0a0a0a' }} aria-label="Get in touch">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,151,57,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,209,0,0.04)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>Get in Touch</p>
          <h2 className="text-white mb-3" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chat with the Msika Team</h2>
          <p className="text-gray-400 mb-8 mx-auto" style={{ fontSize: '0.9rem', maxWidth: '420px' }}>
            Can't find the shop you're looking for? Want to recommend a seller? Let us know — we'll help you connect.
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
              <a
                href="https://wa.me/263778108027"
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
}