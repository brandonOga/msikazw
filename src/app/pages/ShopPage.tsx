import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { products, categories, sellers } from '../data/mockData';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, X, ArrowRight, Star,
  Flame, Sparkles, Tag, BadgeCheck, TrendingUp, Zap,
  ShoppingBag, MapPin, Package,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

const SHOP_BANNER = 'https://images.unsplash.com/photo-1553724625-6f84f9074bb4?w=1600&q=80&fit=crop';

const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

const SORT_OPTIONS = [
  { label: 'Featured',          value: 'default'    },
  { label: 'Price: Low → High', value: 'price-asc'  },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Top Rated',         value: 'rating'     },
  { label: 'Newest',            value: 'new'        },
];

const PRICE_OPTIONS = [
  { label: 'Any Price',    value: 'all'       },
  { label: 'Under $15',   value: 'under-15'  },
  { label: '$15 – $50',   value: '15-50'     },
  { label: '$50 – $100',  value: '50-100'    },
  { label: 'Over $100',   value: 'over-100'  },
];

const ALL_CATEGORIES = ['All', ...categories.map(c => c.name)];

// ── Derived product shelves ──────────────────────────────────────────────────
const topRated    = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
const newArrivals = products.filter(p => p.isNew).slice(0, 4);
const onSale      = products.filter(p => p.isDeal).slice(0, 4);
const trendingNow = [...products].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(4, 8);
const budgetPicks = [...products].filter(p => p.price < 20).slice(0, 4);

export const ShopPage = () => {
  const navigate = useNavigate();
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('default');
  const [priceRange,     setPriceRange]     = useState('all');

  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (dir: 'left' | 'right') => {
    pillsRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  const hasActiveFilters =
    activeCategory !== 'All' || sortBy !== 'default' ||
    priceRange !== 'all' || search.trim() !== '';

  const getFilteredProducts = () => {
    let filtered = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        if (priceRange === 'under-15')  return p.price < 15;
        if (priceRange === '15-50')     return p.price >= 15 && p.price <= 50;
        if (priceRange === '50-100')    return p.price > 50 && p.price <= 100;
        if (priceRange === 'over-100')  return p.price > 100;
        return true;
      });
    }
    switch (sortBy) {
      case 'price-asc':  return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc': return filtered.sort((a, b) => b.price - a.price);
      case 'rating':     return filtered.sort((a, b) => b.rating - a.rating);
      case 'new':        return filtered.sort((a, b) => (a.isNew ? -1 : 1));
      default:           return filtered;
    }
  };

  const filteredProducts = getFilteredProducts();

  const clearFilters = () => {
    setActiveCategory('All');
    setSortBy('default');
    setPriceRange('all');
    setSearch('');
  };

  // ── Section component ──────────────────────────────────────────────────────
  const Section = ({
    icon: Icon, accent, label, title, items, linkLabel = 'View all', linkTo,
  }: {
    icon: React.ElementType;
    accent: string;
    label: string;
    title: string;
    items: typeof products;
    linkLabel?: string;
    linkTo: string;
  }) => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>
              {label}
            </p>
            <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{title}</h2>
          </div>
        </div>
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 transition-colors"
          style={{ fontSize: '0.82rem', fontWeight: 600, color: accent }}
        >
          {linkLabel} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="w-full bg-white min-h-screen">

      {/* ── PAGE HEADER ── */}
      <section style={{ background: '#111' }}>
        {/* Banner image */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={SHOP_BANNER}
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
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Browse Products</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                  <BadgeCheck className="w-3 h-3" /> Local Sellers
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{products.length}+</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>products listed</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Zimbabwe
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <Package className="w-3.5 h-3.5" /> {sellers.length} verified sellers
                </div>
              </div>
              <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>
                Shop from hundreds of genuine Zimbabwean businesses — fashion, food, electronics, crafts and more.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid #009739'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0">
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="sticky top-16 z-20 shadow-sm" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="flex items-center gap-2 py-3">

            {/* ← Left scroll arrow */}
            <button
              onClick={() => scrollPills('left')}
              aria-label="Scroll categories left"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable category pills */}
            <div ref={pillsRef} className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-4 py-1.5 rounded-full cursor-pointer transition-all"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: activeCategory === cat ? 700 : 500,
                    background: activeCategory === cat ? '#009739' : 'rgba(255,255,255,0.06)',
                    color:      activeCategory === cat ? '#fff'    : 'rgba(255,255,255,0.55)',
                    border:     activeCategory === cat ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap',
                  }}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* → Right scroll arrow */}
            <button
              onClick={() => scrollPills('right')}
              aria-label="Scroll categories right"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-5 shrink-0 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }} />

            {/* Sort */}
            <div className="relative shrink-0 hidden md:block">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-full cursor-pointer focus:outline-none transition-all"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: sortBy !== 'default' ? '#009739' : 'rgba(255,255,255,0.06)',
                  color:      sortBy !== 'default' ? '#fff'    : 'rgba(255,255,255,0.55)',
                  border:     sortBy !== 'default' ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: sortBy !== 'default' ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            </div>

            {/* Price */}
            <div className="relative shrink-0 hidden md:block">
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-full cursor-pointer focus:outline-none transition-all"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: priceRange !== 'all' ? '#009739' : 'rgba(255,255,255,0.06)',
                  color:      priceRange !== 'all' ? '#fff'    : 'rgba(255,255,255,0.55)',
                  border:     priceRange !== 'all' ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
                }}
              >
                {PRICE_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: priceRange !== 'all' ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CE1126', background: 'rgba(206,17,38,0.1)', border: '1.5px solid rgba(206,17,38,0.2)' }}
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            {/* Results count */}
            <div className="ml-auto shrink-0">
              <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{filteredProducts.length}</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>results</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FILTERED VIEW — shown when any filter/search is active
      ═══════════════════════════════════════════════════════════════════════ */}
      {hasActiveFilters ? (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500" style={{ fontSize: '0.85rem' }}>
              Showing <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#f3f4f6' }}>
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products match your filters</p>
              <p className="text-gray-500 mb-6" style={{ fontSize: '0.875rem' }}>Try adjusting your category or price range</p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-[#009739] text-white rounded-xl cursor-pointer hover:bg-[#007f30] transition-colors"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

      ) : (
      /* ═══════════════════════════════════════════════════════════════════════
          SECTIONED BROWSE VIEW — default (no filters active)
      ═══════════════════════════════════════════════════════════════════════ */
        <>
          {/* divider */}
          <div className="border-b border-[#EAEAEA]" />

          {/* ── 1. TOP RATED ── */}
          <Section
            icon={Star}
            accent="#009739"
            label="Highest Rated"
            title="Top Rated"
            items={topRated}
            linkTo="/shop?sort=rating"
          />

          <div className="border-b border-[#EAEAEA] mx-8" />

          {/* ── 2. BEST SELLERS ── */}
          <Section
            icon={Flame}
            accent="#CE1126"
            label="Most Purchased"
            title="Best Sellers"
            items={bestSellers}
            linkTo="/shop?sort=popular"
          />

          <div className="border-b border-[#EAEAEA] mx-8" />

          {/* ── 3. NEW ARRIVALS ── */}
          {newArrivals.length > 0 && (
            <>
              <Section
                icon={Sparkles}
                accent="#009739"
                label="Just Dropped"
                title="New Arrivals"
                items={newArrivals}
                linkTo="/shop?filter=new"
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 4. ON SALE ── */}
          {onSale.length > 0 && (
            <>
              <Section
                icon={Tag}
                accent="#CE1126"
                label="Limited Time"
                title="On Sale"
                items={onSale}
                linkTo="/shop?filter=deals"
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 5. TRENDING NOW ── */}
          {trendingNow.length > 0 && (
            <>
              <Section
                icon={TrendingUp}
                accent="#FFD100"
                label="Popular Right Now"
                title="Trending Now"
                items={trendingNow}
                linkTo="/shop?sort=trending"
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 6. BUDGET PICKS ── */}
          {budgetPicks.length > 0 && (
            <>
              <Section
                icon={Zap}
                accent="#009739"
                label="Under $20"
                title="Budget Picks"
                items={budgetPicks}
                linkTo="/shop?price=under-20"
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 7. SHOP BY SELLER ── */}
          <section className="bg-gray-50 border-t border-[#EAEAEA] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,151,57,0.08)' }}>
                    <BadgeCheck className="w-4 h-4 text-[#009739]" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>
                      Verified Stores
                    </p>
                    <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shop by Seller</h2>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/shops')}
                  className="flex items-center gap-1 text-[#009739] transition-colors"
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                >
                  All sellers <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sellers.slice(0, 5).map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => navigate(`/seller/${seller.id}`)}
                    className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-[#EAEAEA] hover:border-[#009739] hover:shadow-md transition-all text-center cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={seller.logo}
                        alt={seller.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {seller.verified && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#009739' }}>
                          <BadgeCheck className="w-3 h-3 text-white" fill="none" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 group-hover:text-[#009739] transition-colors" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{seller.name}</p>
                      <p className="text-gray-400" style={{ fontSize: '0.68rem' }}>{seller.productCount} products</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── GET IN TOUCH ── */}
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
            Can't find what you're looking for? Let us help you track down the right seller or product — just send us a message.
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