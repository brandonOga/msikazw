import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, ArrowUpRight, ShoppingBag, Sprout, Sparkles, ArrowRight, X,
  ChevronLeft, ChevronRight, MapPin, LayoutGrid,
  Star, Flame, Tag, TrendingUp, Zap,
} from 'lucide-react';
import { products, categories } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';

const ALL_CATEGORIES_BANNER = 'https://images.unsplash.com/photo-1705745474141-eaab4ba053c9?w=1600&q=80&fit=crop';

// ── Constants ─────────────────────────────────────────────────────────────────

const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

const CATEGORY_IMAGES: Record<string, string> = {
  'Fashion & Clothing':     'https://images.unsplash.com/photo-1757140448293-fa0de8f449e5?w=800&q=85&fit=crop',
  'Electronics & Gadgets':  'https://images.unsplash.com/photo-1653548147224-411e742e689b?w=800&q=85&fit=crop',
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1644672014230-cf7cf1abed27?w=800&q=85&fit=crop',
  'Home & Furniture':       'https://images.unsplash.com/photo-1615402052294-a376393da320?w=800&q=85&fit=crop',
  'Food & Groceries':       'https://images.unsplash.com/photo-1694825588875-190db201a997?w=800&q=85&fit=crop',
  'Farming & Agriculture':  'https://images.unsplash.com/photo-1697470506541-33cca44496e7?w=800&q=85&fit=crop',
  'Vehicles & Auto Parts':  'https://images.unsplash.com/photo-1555140713-973b9f36cd1e?w=800&q=85&fit=crop',
  'Phones & Computers':     'https://images.unsplash.com/photo-1568746980529-9061a45c8c88?w=800&q=85&fit=crop',
  'Services':               'https://images.unsplash.com/photo-1687179185557-81b3e47cac26?w=800&q=85&fit=crop',
  'Property & Rentals':     'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85&fit=crop',
  'Handmade & Crafts':      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?w=800&q=85&fit=crop',
  'Thrift / Second Hand':   'https://images.unsplash.com/photo-1770012117468-9b1ee7aba977?w=800&q=85&fit=crop',
  'Baby Products':          'https://images.unsplash.com/photo-1766918780914-e19d9de76d85?w=800&q=85&fit=crop',
  'Sports & Fitness':       'https://images.unsplash.com/photo-1710814824560-943273e8577e?w=800&q=85&fit=crop',
  'Books & Education':      'https://images.unsplash.com/photo-1707256786130-6d028236813f?w=800&q=85&fit=crop',
  'Construction Materials': 'https://images.unsplash.com/photo-1755288271423-462a0808deb9?w=800&q=85&fit=crop',
};

const SHORT_NAMES: Record<string, string> = {
  'Fashion & Clothing':     'Fashion',
  'Electronics & Gadgets':  'Electronics',
  'Beauty & Personal Care': 'Beauty',
  'Home & Furniture':       'Home',
  'Food & Groceries':       'Food',
  'Farming & Agriculture':  'Farming',
  'Vehicles & Auto Parts':  'Autos',
  'Phones & Computers':     'Tech',
  'Services':               'Services',
  'Property & Rentals':     'Property',
  'Handmade & Crafts':      'Crafts',
  'Thrift / Second Hand':   'Thrift',
  'Baby Products':          'Baby',
  'Sports & Fitness':       'Sports',
  'Books & Education':      'Books',
  'Construction Materials': 'Building',
};

// Themed sections — grouping all 16 categories
const SECTIONS = [
  {
    id:           'everyday',
    overline:     'Most Popular',
    title:        'Everyday Favourites',
    iconColor:    '#009739',
    iconBg:       'rgba(0,151,57,0.08)',
    bg:           '#fff',
    categories:   ['Fashion & Clothing', 'Food & Groceries', 'Beauty & Personal Care', 'Home & Furniture', 'Phones & Computers', 'Electronics & Gadgets'],
  },
  {
    id:           'trade',
    overline:     'Grow & Build',
    title:        'Business & Trade',
    iconColor:    '#b8930a',
    iconBg:       'rgba(255,209,0,0.12)',
    bg:           '#fafafa',
    categories:   ['Farming & Agriculture', 'Vehicles & Auto Parts', 'Services', 'Property & Rentals', 'Construction Materials'],
  },
  {
    id:           'discover',
    overline:     'Unique Finds',
    title:        'Discover More',
    iconColor:    '#009739',
    iconBg:       'rgba(0,151,57,0.08)',
    bg:           '#fff',
    categories:   ['Handmade & Crafts', 'Thrift / Second Hand', 'Baby Products', 'Sports & Fitness', 'Books & Education'],
  },
] as const;

const SECTION_ICONS: Record<string, React.ReactNode> = {
  everyday: <ShoppingBag className="w-4 h-4" />,
  trade:    <Sprout className="w-4 h-4" />,
  discover: <Sparkles className="w-4 h-4" />,
};

const FILTER_PILLS = [
  { label: 'All', value: 'all' },
  ...categories.map(c => ({ label: SHORT_NAMES[c.name] || c.name, value: c.name })),
];

// ── Product shelf section — mirrors ShopPage Section component ─────────────────
function ProductSection({
  icon: Icon, accent, label, title, items, linkTo, navigate, bg,
}: {
  icon: React.ElementType;
  accent: string;
  label: string;
  title: string;
  items: typeof products;
  linkTo: string;
  navigate: (path: string) => void;
  bg?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-[#EAEAEA] py-12" style={bg ? { background: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${accent}20` }}
            >
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
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, navigate }: { cat: typeof categories[0]; navigate: (path: string) => void }) {
  const img       = CATEGORY_IMAGES[cat.name] ?? 'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?w=800&q=85&fit=crop';
  const shortName = SHORT_NAMES[cat.name] || cat.name;
  return (
    <button
      onClick={() => navigate(`/categories?cat=${encodeURIComponent(cat.name)}`)}
      className="group relative overflow-hidden cursor-pointer text-left focus:outline-none w-full"
      style={{ aspectRatio: '3 / 4', borderRadius: '16px', border: 'none', padding: 0 }}
      aria-label={`Browse ${cat.name}`}
    >
      <img
        src={img}
        alt={cat.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.65) 30%, rgba(0,0,0,0.12) 58%, rgba(0,0,0,0) 76%)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex flex-col items-start">
        <p
          className="text-white/60 mb-0.5"
          style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em' }}
        >
          {cat.count}+ Items
        </p>
        <h3
          className="text-white mb-3"
          style={{ ...DISPLAY_FONT, fontSize: 'clamp(1.5rem, 2vw, 2.4rem)', fontWeight: 900, lineHeight: 1 }}
        >
          {shortName}
        </h3>
        <span
          className="inline-flex items-center gap-1.5 text-white transition-all duration-300 group-hover:bg-[#009739] group-hover:border-[#009739]"
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            background: 'rgba(15,15,15,0.82)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)',
            borderRadius: '8px',
            padding: '7px 14px',
            whiteSpace: 'nowrap',
          }}
        >
          Shop Now <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({
  icon, iconBg, iconColor, overline, title, onViewAll,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  overline: string;
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: iconColor }}>
            {overline}
          </p>
          <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{title}</h2>
        </div>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 transition-colors"
          style={{ fontSize: '0.82rem', fontWeight: 600, color: iconColor }}
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function AllCategoriesPage() {
  const navigate      = useNavigate();
  const [search,      setSearch]      = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (dir: 'left' | 'right') => {
    pillsRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  const searchActive = search.trim().length > 0;
  const categoryPillActive = activeGroup !== 'all' && !searchActive;

  // ── Derived product shelves ─────────────────────────────────────────────────
  const catProducts = useMemo(() => (
    activeGroup !== 'all'
      ? products.filter(p => p.category === activeGroup)
      : products
  ), [activeGroup]);

  const shortCatName = activeGroup !== 'all'
    ? (SHORT_NAMES[activeGroup] || activeGroup)
    : '';

  const shelfTopRated    = useMemo(() => [...catProducts].sort((a, b) => b.rating - a.rating).slice(0, 4), [catProducts]);
  const shelfBestSellers = useMemo(() => [...catProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4), [catProducts]);
  const shelfNewArrivals = useMemo(() => catProducts.filter(p => p.isNew).slice(0, 4), [catProducts]);
  const shelfOnSale      = useMemo(() => catProducts.filter(p => p.isDeal).slice(0, 4), [catProducts]);
  const shelfTrending    = useMemo(() => [...catProducts].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(categoryPillActive ? 0 : 4, categoryPillActive ? 4 : 8), [catProducts, categoryPillActive]);
  const shelfBudget      = useMemo(() => catProducts.filter(p => p.price < 20).slice(0, 4), [catProducts]);

  const shopLink = activeGroup !== 'all'
    ? `/shop?cat=${encodeURIComponent(activeGroup)}`
    : '/shop';

  // ── end derived shelves ─────────────────────────────────────────────────────

  const searchResults = searchActive
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const visibleSections = SECTIONS.map(section => ({
    ...section,
    cats: categoryPillActive
      ? categories.filter(c => section.categories.includes(c.name) && c.name === activeGroup)
      : categories.filter(c => section.categories.includes(c.name)),
  })).filter(s => s.cats.length > 0);

  const resultCount = searchActive
    ? searchResults.length
    : categoryPillActive
      ? visibleSections.reduce((acc, s) => acc + s.cats.length, 0)
      : categories.length;

  return (
    <div className="w-full bg-white min-h-screen">

      {/* ── DARK HEADER ── */}
      <section style={{ background: '#111' }}>
        {/* Banner image */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={ALL_CATEGORIES_BANNER}
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
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Browse Categories</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                  <Sprout className="w-3 h-3" /> All Departments
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{categories.length}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>categories</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Zimbabwe
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{products.length}+ products</span>
                </div>
              </div>
              <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>
                Explore every department on Msika — from fashion and electronics to food, crafts and property.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder="Search categories…"
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

      {/* ── DARK FILTER BAR ── */}
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

            {/* Scrollable pills */}
            <div ref={pillsRef} className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
              {FILTER_PILLS.map(pill => (
                <button
                  key={pill.value}
                  onClick={() => setActiveGroup(pill.value)}
                  className="shrink-0 px-4 py-1.5 rounded-full cursor-pointer transition-all"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: activeGroup === pill.value ? 700 : 500,
                    background: activeGroup === pill.value ? '#009739' : 'rgba(255,255,255,0.06)',
                    color:      activeGroup === pill.value ? '#fff'    : 'rgba(255,255,255,0.55)',
                    border:     activeGroup === pill.value ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                  }}
                  aria-pressed={activeGroup === pill.value}
                >
                  {pill.label}
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

            {/* Permanent divider */}
            <div className="w-px h-5 shrink-0 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }} />

            {(search || activeGroup !== 'all') && (
              <button
                onClick={() => { setSearch(''); setActiveGroup('all'); }}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CE1126', background: 'rgba(206,17,38,0.1)', border: '1.5px solid rgba(206,17,38,0.2)' }}
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            {/* Result count */}
            <div className="ml-auto shrink-0">
              <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{resultCount}</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS (shown only when searching) ── */}
      {searchActive && (
        <section className="border-t border-[#EAEAEA] py-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex items-end justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,151,57,0.08)' }}>
                  <Search className="w-4 h-4 text-[#009739]" />
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>
                    Search Results
                  </p>
                  <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    "{search}"
                  </h2>
                </div>
              </div>
              <p className="text-gray-500" style={{ fontSize: '0.85rem' }}>
                <span className="text-gray-900" style={{ fontWeight: 700 }}>{searchResults.length}</span>{' '}
                {searchResults.length === 1 ? 'category' : 'categories'} found
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">📂</p>
                <p className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No categories match</p>
                <p className="text-gray-500 text-sm mb-6">Try a different search term</p>
                <button
                  onClick={() => setSearch('')}
                  className="px-5 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer hover:bg-[#007f30] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {searchResults.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── THEMED SECTIONS ── */}
      {!searchActive && visibleSections.map((section) => (
          <section
            key={section.id}
            className="border-t border-[#EAEAEA] py-12"
            style={{ background: section.bg }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <SectionHeader
                icon={<span style={{ color: section.iconColor }}>{SECTION_ICONS[section.id]}</span>}
                iconBg={section.iconBg}
                iconColor={section.iconColor}
                overline={section.overline}
                title={section.title}
                onViewAll={() => navigate('/shop')}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {section.cats.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ── PRODUCT SHELVES ── */}
      {!searchActive && (
        <>
          {shelfTopRated.length > 0 && (
            <ProductSection
              icon={Star}
              accent="#009739"
              label="Highest Rated"
              title={categoryPillActive ? `Top Rated in ${shortCatName}` : 'Top Rated on Msika'}
              items={shelfTopRated}
              linkTo={shopLink}
              navigate={navigate}
            />
          )}
          {shelfBestSellers.length > 0 && (
            <ProductSection
              icon={Flame}
              accent="#CE1126"
              label="Most Purchased"
              title={categoryPillActive ? `Best Sellers in ${shortCatName}` : 'Best Sellers'}
              items={shelfBestSellers}
              linkTo={shopLink}
              navigate={navigate}
              bg="#fafafa"
            />
          )}
          {shelfNewArrivals.length > 0 && (
            <ProductSection
              icon={Sparkles}
              accent="#009739"
              label="Just Dropped"
              title={categoryPillActive ? `New in ${shortCatName}` : 'New Arrivals'}
              items={shelfNewArrivals}
              linkTo={shopLink}
              navigate={navigate}
            />
          )}
          {shelfOnSale.length > 0 && (
            <ProductSection
              icon={Tag}
              accent="#CE1126"
              label="Limited Time"
              title={categoryPillActive ? `Deals in ${shortCatName}` : 'On Sale'}
              items={shelfOnSale}
              linkTo={shopLink}
              navigate={navigate}
              bg="#fafafa"
            />
          )}
          {shelfTrending.length > 0 && (
            <ProductSection
              icon={TrendingUp}
              accent="#b8930a"
              label="Popular Right Now"
              title={categoryPillActive ? `Trending in ${shortCatName}` : 'Trending Now'}
              items={shelfTrending}
              linkTo={shopLink}
              navigate={navigate}
            />
          )}
          {shelfBudget.length > 0 && (
            <ProductSection
              icon={Zap}
              accent="#009739"
              label="Under $20"
              title={categoryPillActive ? `Budget ${shortCatName}` : 'Budget Picks'}
              items={shelfBudget}
              linkTo={shopLink}
              navigate={navigate}
              bg="#fafafa"
            />
          )}
        </>
      )}

      {/* ── CHAT WITH THE MSIKA TEAM ── */}
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
            Can't find what you're looking for? Looking for a specific product or category? Let us know — we'll help you find it.
          </p>
          <div className="max-w-md mx-auto">
            <div
              className="flex items-center overflow-hidden rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
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
}