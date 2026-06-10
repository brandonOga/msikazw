import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { categories } from '../data/mockData';
import { useProducts, useSellers } from '../../lib/hooks/useProducts';
import {
  Search, ChevronDown, X, ArrowRight, Star,
  Flame, Sparkles, Tag, BadgeCheck, TrendingUp, Zap,
  SlidersHorizontal, Loader2,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

const SORT_OPTIONS = [
  { label: 'Featured',        value: 'default'    },
  { label: 'Price: Low - High', value: 'price-asc'  },
  { label: 'Price: High - Low', value: 'price-desc' },
  { label: 'Top Rated',       value: 'rating'     },
  { label: 'Newest',          value: 'new'        },
];

const PRICE_OPTIONS = [
  { label: 'Any Price',   value: 'all'      },
  { label: 'Under $15',  value: 'under-15' },
  { label: '$15 - $50',  value: '15-50'    },
  { label: '$50 - $100', value: '50-100'   },
  { label: 'Over $100',  value: 'over-100' },
];

const RATING_OPTIONS = [
  { label: 'All Ratings',        value: 'all' },
  { label: '4 stars and above',  value: '4'   },
  { label: '3 stars and above',  value: '3'   },
];

const ITEMS_PER_PAGE = 20;

// ── Simple select dropdown ────────────────────────────────────────────────────
function FilterDropdown({
  value, onChange, options, label, minWidth = '140px',
}: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; label: string; minWidth?: string;
}) {
  const isActive = value !== options[0].value;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none transition-colors"
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          border: isActive ? '1.5px solid #009739' : '1px solid #e5e7eb',
          background: isActive ? '#f0faf4' : '#fff',
          color: isActive ? '#009739' : '#374151',
          minWidth,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: isActive ? '#009739' : '#9ca3af' }} />
    </div>
  );
}

// ── Mobile filter drawer ──────────────────────────────────────────────────────
function MobileFilterDrawer({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.45)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl flex flex-col transition-transform duration-300"
        style={{ maxHeight: '80vh', transform: isOpen ? 'translateY(0)' : 'translateY(100%)', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Filters & Sort</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">{children}</div>
      </div>
    </>
  );
}

export const ShopPage = () => {
  const navigate = useNavigate();
  const [search,             setSearch]             = useState('');
  const [activeCategory,     setActiveCategory]     = useState('All');
  const [sortBy,             setSortBy]             = useState('default');
  const [priceRange,         setPriceRange]         = useState('all');
  const [ratingFilter,       setRatingFilter]       = useState('all');
  const [page,               setPage]               = useState(1);
  const [showMobileFilters,  setShowMobileFilters]  = useState(false);

  const { products: allProducts } = useProducts();
  const { sellers } = useSellers();

  // ── Derived shelves for the default browse view ───────────────────────────
  const topRated    = useMemo(() => [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4), [allProducts]);
  const bestSellers = useMemo(() => [...allProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4), [allProducts]);
  const newArrivals = useMemo(() => allProducts.filter(p => p.isNew).slice(0, 4), [allProducts]);
  const onSale      = useMemo(() => allProducts.filter(p => p.isDeal).slice(0, 4), [allProducts]);
  const trendingNow = useMemo(() => [...allProducts].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(4, 8), [allProducts]);
  const budgetPicks = useMemo(() => allProducts.filter(p => p.price < 20).slice(0, 4), [allProducts]);

  const hasActiveFilters = activeCategory !== 'All' || sortBy !== 'default' || priceRange !== 'all' || ratingFilter !== 'all' || search.trim() !== '';
  const activeFilterCount = [activeCategory !== 'All', sortBy !== 'default', priceRange !== 'all', ratingFilter !== 'all'].filter(Boolean).length;

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];
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
    if (ratingFilter !== 'all') {
      const min = parseInt(ratingFilter);
      filtered = filtered.filter(p => p.rating >= min);
    }
    switch (sortBy) {
      case 'price-asc':  return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc': return filtered.sort((a, b) => b.price - a.price);
      case 'rating':     return filtered.sort((a, b) => b.rating - a.rating);
      case 'new':        return filtered.sort((a) => (a.isNew ? -1 : 1));
      default:           return filtered;
    }
  }, [allProducts, search, activeCategory, priceRange, ratingFilter, sortBy]);

  const clearFilters = useCallback(() => {
    setActiveCategory('All');
    setSortBy('default');
    setPriceRange('all');
    setRatingFilter('all');
    setSearch('');
    setPage(1);
  }, []);

  const totalPages    = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const pagedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Section component ─────────────────────────────────────────────────────
  const Section = ({
    icon: Icon, accent, label, title, items, linkTo,
  }: {
    icon: React.ElementType; accent: string; label: string; title: string;
    items: typeof allProducts; linkTo: string;
  }) => (
    <section className="py-6">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>{label}</p>
            <h2 className="text-gray-900" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</h2>
          </div>
        </div>
        <button onClick={() => navigate(linkTo)} className="flex items-center gap-1 transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600, color: accent }}>
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-2.5">
        <Breadcrumbs crumbs={[{ label: 'Shop' }]} />
      </div>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Browse Products</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.82rem' }}>
              {hasActiveFilters ? (
                <>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</>
              ) : (
                <>{allProducts.length}+ products from verified Zimbabwean sellers</>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#009739] text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-6 items-start">

          {/* ─── Left Sidebar ─── */}
          <aside className="hidden md:flex flex-col gap-3 w-56 shrink-0 sticky top-20">

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                {['All', ...categories.map(c => c.name)].map(cat => {
                  const isActive = cat === activeCategory;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => { setActiveCategory(cat); setPage(1); }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 700 : 400,
                          background: isActive ? '#f0faf4' : 'transparent',
                          color: isActive ? '#009739' : '#374151',
                        }}
                      >
                        <span className="flex-1 truncate">{cat}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#009739] shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Price</h3>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {PRICE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="shop-price"
                      value={opt.value}
                      checked={priceRange === opt.value}
                      onChange={() => { setPriceRange(opt.value); setPage(1); }}
                      className="accent-[#009739]"
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: priceRange === opt.value ? 600 : 400, color: priceRange === opt.value ? '#009739' : '#374151' }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Rating</h3>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {RATING_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="shop-rating"
                      value={opt.value}
                      checked={ratingFilter === opt.value}
                      onChange={() => { setRatingFilter(opt.value); setPage(1); }}
                      className="accent-[#009739]"
                    />
                    <span className="flex items-center gap-1" style={{ fontSize: '0.82rem', fontWeight: ratingFilter === opt.value ? 600 : 400, color: ratingFilter === opt.value ? '#009739' : '#374151' }}>
                      {opt.value !== 'all' && <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />}
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
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

            {/* Sort + active filter chips bar */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== 'All' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {activeCategory}
                    <button onClick={() => setActiveCategory('All')} className="p-0 bg-transparent border-none cursor-pointer leading-none"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {PRICE_OPTIONS.find(o => o.value === priceRange)?.label}
                    <button onClick={() => setPriceRange('all')} className="p-0 bg-transparent border-none cursor-pointer leading-none"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {ratingFilter !== 'all' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {RATING_OPTIONS.find(o => o.value === ratingFilter)?.label}
                    <button onClick={() => setRatingFilter('all')} className="p-0 bg-transparent border-none cursor-pointer leading-none"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-500 hidden sm:block" style={{ fontSize: '0.8rem' }}>Sort:</span>
                <FilterDropdown label="Sort by" value={sortBy} onChange={v => { setSortBy(v); setPage(1); }} options={SORT_OPTIONS} />
              </div>
            </div>

            {/* ── FILTERED VIEW ── */}
            {hasActiveFilters ? (
              filteredProducts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gray-100">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products found</h3>
                  <p className="text-gray-500 mb-5" style={{ fontSize: '0.875rem' }}>Try a different category, search term, or remove some filters</p>
                  <button onClick={clearFilters} className="px-6 py-2.5 bg-[#009739] text-white rounded-xl hover:bg-[#007f30] transition-colors cursor-pointer border-none" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pagedProducts.map(product => <ProductCard key={product.id} product={product} />)}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-white"
                        style={{ fontWeight: 600 }}
                      >Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce<(number | '...')[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) => p === '...' ? (
                          <span key={`dot-${i}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button key={p}
                            onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-9 h-9 rounded-xl text-sm border transition-colors cursor-pointer"
                            style={{ fontWeight: 700, background: page === p ? '#009739' : '#fff', color: page === p ? '#fff' : '#374151', borderColor: page === p ? '#009739' : '#e5e7eb' }}
                          >{p}</button>
                        ))}
                      <button
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-white"
                        style={{ fontWeight: 600 }}
                      >Next</button>
                    </div>
                  )}
                </>
              )

            ) : (
              /* ── SECTIONED BROWSE VIEW (no filters) ── */
              <div className="divide-y divide-gray-100">
                <Section icon={Star}       accent="#009739" label="Highest Rated"   title="Top Rated"    items={topRated}    linkTo="/shop?sort=rating" />
                <Section icon={Flame}      accent="#CE1126" label="Most Purchased"  title="Best Sellers" items={bestSellers} linkTo="/shop?sort=popular" />
                {newArrivals.length > 0  && <Section icon={Sparkles}  accent="#009739" label="Just Dropped"      title="New Arrivals" items={newArrivals}  linkTo="/shop?filter=new" />}
                {onSale.length > 0       && <Section icon={Tag}       accent="#CE1126" label="Limited Time"      title="On Sale"      items={onSale}       linkTo="/shop?filter=deals" />}
                {trendingNow.length > 0  && <Section icon={TrendingUp} accent="#FFD100" label="Popular Right Now" title="Trending Now" items={trendingNow}  linkTo="/shop?sort=trending" />}
                {budgetPicks.length > 0  && <Section icon={Zap}       accent="#009739" label="Under $20"         title="Budget Picks" items={budgetPicks}  linkTo="/shop?price=under-20" />}

                {/* Shop by Seller */}
                {sellers.length > 0 && (
                  <section className="py-8">
                    <div className="flex items-end justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#009739]/10">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#009739]" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>Verified Stores</p>
                          <h2 className="text-gray-900" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Shop by Seller</h2>
                        </div>
                      </div>
                      <button onClick={() => navigate('/shops')} className="flex items-center gap-1 text-[#009739]" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        All sellers <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {sellers.slice(0, 5).map(seller => (
                        <button
                          key={seller.id}
                          onClick={() => navigate(`/seller/${seller.id}`)}
                          className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#009739] hover:shadow-md transition-all text-center cursor-pointer"
                        >
                          <div className="relative">
                            <img src={seller.logo} alt={seller.name} className="w-14 h-14 rounded-xl object-cover" />
                            {seller.verified && (
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-[#009739]">
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
                  </section>
                )}
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
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009739]"
            />
          </div>
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</p>
          <FilterDropdown label="Category" value={activeCategory} onChange={v => { setActiveCategory(v); setPage(1); }} options={[{ label: 'All Categories', value: 'All' }, ...categories.map(c => ({ label: c.name, value: c.name }))]} minWidth="100%" />
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort By</p>
          <FilterDropdown label="Sort by" value={sortBy} onChange={v => { setSortBy(v); setPage(1); }} options={SORT_OPTIONS} minWidth="100%" />
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price Range</p>
          <FilterDropdown label="Price range" value={priceRange} onChange={v => { setPriceRange(v); setPage(1); }} options={PRICE_OPTIONS} minWidth="100%" />
        </div>
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rating</p>
          <FilterDropdown label="Rating" value={ratingFilter} onChange={v => { setRatingFilter(v); setPage(1); }} options={RATING_OPTIONS} minWidth="100%" />
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
          Show {filteredProducts.length} Results
        </button>
      </MobileFilterDrawer>
    </div>
  );
};
