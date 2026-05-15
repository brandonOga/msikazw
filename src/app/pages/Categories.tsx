import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, X, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal,
  Star, ArrowRight, Loader2,
  Flame, Sparkles, Tag, TrendingUp, Zap, MapPin, Package,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  categories, products, Product,
  getRecentPurchaseCount, getSmartBadge,
} from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { StarRating } from '../components/StarRating';

// ── Constants ──────────────────────────────────────────────────────────────────

const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

const ITEMS_PER_PAGE = 8;

const HERO_DEFAULT = 'https://images.unsplash.com/photo-1717913491210-f742a34f7d9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnQlMjBtYXJrZXQlMjBjYXRlZ29yaWVzJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzU5MDM0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080';

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
  // ── Shein-style categories ──────────────────────────────────────────
  "Women's Dresses":        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=85&fit=crop',
  "Women's Tops":           'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85&fit=crop',
  "Women's Bottoms":        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=85&fit=crop',
  'Outerwear & Jackets':    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=85&fit=crop',
  'Activewear':             'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85&fit=crop',
  "Men's Shirts & Tops":    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=85&fit=crop',
  "Men's Shorts & Pants":   'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=85&fit=crop',
  "Kids' Clothing":         'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=800&q=85&fit=crop',
  'Swimwear':               'https://images.unsplash.com/photo-1537223420-61c88cfa3e2e?w=800&q=85&fit=crop',
  'Lingerie & Sleepwear':   'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&q=85&fit=crop',
  'Heels & Sandals':        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=85&fit=crop',
  'Backpacks & Luggage':    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85&fit=crop',
  'Sunglasses & Eyewear':   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=85&fit=crop',
  'Hair Care & Wigs':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85&fit=crop',
  'Makeup & Cosmetics':     'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=85&fit=crop',
  'Nail Care':              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85&fit=crop',
  'Home Decor':             'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85&fit=crop',
  'Bedding & Pillows':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85&fit=crop',
  'Kitchen Gadgets':        'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=85&fit=crop',
  'Yoga & Pilates':         'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85&fit=crop',
  'Plus Size Fashion':      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=85&fit=crop',
  'Pet Supplies':           'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=85&fit=crop',
  // ── legacy names ───────────────────────────────────────────────────
  'Electronics':            'https://images.unsplash.com/photo-1653548147224-411e742e689b?w=800&q=85&fit=crop',
  'Thrift Clothes':         'https://images.unsplash.com/photo-1770012117468-9b1ee7aba977?w=800&q=85&fit=crop',
  'Cosmetics & Beauty':     'https://images.unsplash.com/photo-1644672014230-cf7cf1abed27?w=800&q=85&fit=crop',
  'Sneakers & Shoes':       'https://images.unsplash.com/photo-1554203713-aa56c626d2fa?w=800&q=85&fit=crop',
  'Traditional Wear':       'https://images.unsplash.com/photo-1757140448293-fa0de8f449e5?w=800&q=85&fit=crop',
  'Food & Snacks':          'https://images.unsplash.com/photo-1694825588875-190db201a997?w=800&q=85&fit=crop',
  'Art & Crafts':           'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?w=800&q=85&fit=crop',
  'Groceries':              'https://images.unsplash.com/photo-1694825588875-190db201a997?w=800&q=85&fit=crop',
  'Mobile Accessories':     'https://images.unsplash.com/photo-1568746980529-9061a45c8c88?w=800&q=85&fit=crop',
  'Baby & Kids':            'https://images.unsplash.com/photo-1766918780914-e19d9de76d85?w=800&q=85&fit=crop',
  'Sports & Outdoors':      'https://images.unsplash.com/photo-1710814824560-943273e8577e?w=800&q=85&fit=crop',
  'Home & Kitchen':         'https://images.unsplash.com/photo-1615402052294-a376393da320?w=800&q=85&fit=crop',
  'Books & Stationery':     'https://images.unsplash.com/photo-1707256786130-6d028236813f?w=800&q=85&fit=crop',
  'Jewelry & Watches':      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?w=800&q=85&fit=crop',
  'Bags & Accessories':     'https://images.unsplash.com/photo-1757140448293-fa0de8f449e5?w=800&q=85&fit=crop',
  "Men's Fashion":          'https://images.unsplash.com/photo-1757140448293-fa0de8f449e5?w=800&q=85&fit=crop',
  'Solar & Energy':         'https://images.unsplash.com/photo-1653548147224-411e742e689b?w=800&q=85&fit=crop',
  // ── Supermarket ──────────────────────────────────────────────────
  'Fresh Produce':          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=85&fit=crop',
  'Dairy & Eggs':           'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=85&fit=crop',
  'Meat & Poultry':         'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=85&fit=crop',
  'Beverages & Drinks':     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=85&fit=crop',
  'Household Cleaning':     'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=85&fit=crop',
  'Bread & Bakery':         'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85&fit=crop',
  // ── Tech Store ────────────────────────────────────────────────────
  'Smart TVs & Displays':   'https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=800&q=85&fit=crop',
  'Gaming & Consoles':      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=85&fit=crop',
  'Cameras & Photography':  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=85&fit=crop',
  // ── Furniture Store ───────────────────────────────────────────────
  'Living Room Furniture':  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85&fit=crop',
  'Bedroom Furniture':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85&fit=crop',
  'Office Furniture':       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85&fit=crop',
};

const SORT_OPTIONS = [
  { label: 'Featured',      value: 'default'    },
  { label: 'Most Popular',  value: 'popular'    },
  { label: 'Lowest Price',  value: 'price-asc'  },
  { label: 'Highest Price', value: 'price-desc' },
  { label: 'Top Rated',     value: 'rating'     },
];

const PRICE_OPTIONS = [
  { label: 'Any Price',   value: 'all' },
  { label: 'Under $15',   value: 'under-15' },
  { label: '$15 – $50',   value: '15-50' },
  { label: '$50 – $100',  value: '50-100' },
  { label: 'Over $100',   value: 'over-100' },
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: 'all' },
  { label: '4★ & above',  value: '4' },
  { label: '3★ & above',  value: '3' },
];

// ── Styled dropdown component ──────────────────────────────────────────────────
function FilterDropdown({
  value, onChange, options, label, minWidth = '150px', dark = false,
}: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; label: string; minWidth?: string; dark?: boolean;
}) {
  const isActive = value !== options[0].value;
  if (dark) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-label={label}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-full cursor-pointer focus:outline-none transition-all"
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            background: isActive ? '#009739' : 'rgba(255,255,255,0.06)',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
            border: isActive ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
            minWidth,
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} style={{ background: '#111', color: '#fff' }}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }} />
      </div>
    );
  }
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

// ── Mobile filter drawer ───────────────────────────────────────────────────────
function MobileFilterDrawer({
  isOpen, onClose, children,
}: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
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
        style={{
          maxHeight: '80vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Filters & Sort</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Section component — matches ShopPage Section exactly ──────────────────────
function CategorySection({
  icon: Icon,
  accent,
  label,
  title,
  items,
  onViewAll,
}: {
  icon: React.ElementType;
  accent: string;
  label: string;
  title: string;
  items: typeof products;
  onViewAll?: () => void;
}) {
  if (items.length === 0) return null;

  return (
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
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: accent }}
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function Categories() {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { formatPrice, recentlyViewed, user } = useStore();

  const [searchQuery,    setSearchQuery]    = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'All');
  const [sortBy,         setSortBy]         = useState('default');
  const [priceRange,     setPriceRange]     = useState('all');
  const [ratingFilter,   setRatingFilter]   = useState('all');
  const [visibleCount,   setVisibleCount]   = useState(ITEMS_PER_PAGE);
  const [isLoading,      setIsLoading]      = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (dir: 'left' | 'right') => {
    pillsRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  useEffect(() => {
    const cat    = searchParams.get('cat');
    const search = searchParams.get('search');
    if (cat)    setActiveCategory(cat);
    if (search) setSearchQuery(search);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchParams]);

  // Reset pagination on filter change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [activeCategory, searchQuery, sortBy, priceRange, ratingFilter]);

  // Category options
  const categoryOptions = useMemo(() => [
    { label: '🛍️  All Categories', value: 'All' },
    ...categories.map(c => ({ label: `${c.emoji}  ${c.name}`, value: c.name })),
  ], []);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    const filterParam = searchParams.get('filter');
    if (filterParam === 'deals') filtered = filtered.filter(p => p.isDeal);

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
      case 'popular':    return filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      default:           return filtered;
    }
  }, [activeCategory, searchQuery, sortBy, priceRange, ratingFilter, searchParams]);

  // ── Category-specific product shelves (when a single category is selected) ──
  const categorySections = useMemo(() => {
    if (activeCategory === 'All') return null;
    const categoryProducts = products.filter(p => p.category === activeCategory);
    if (categoryProducts.length === 0) return null;
    return {
      topRated:    [...categoryProducts].sort((a, b) => b.rating - a.rating).slice(0, 4),
      bestSellers: [...categoryProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4),
      newArrivals: categoryProducts.filter(p => p.isNew).slice(0, 4),
      onSale:      categoryProducts.filter(p => p.isDeal).slice(0, 4),
      trendingNow: [...categoryProducts].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(0, 4),
      budgetPicks: [...categoryProducts].filter(p => p.price < 20).slice(0, 4),
    };
  }, [activeCategory]);

  // ── Per-category rows for the "All" browse view ─────────────────────────────
  const allCategoryRows = useMemo(() => {
    if (activeCategory !== 'All') return [];
    return categories
      .map(cat => {
        const catProducts = products.filter(p => p.category === cat.name);
        if (catProducts.length === 0) return null;
        const sorted = [...catProducts].sort(
          (a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating
        );
        return { category: cat, items: sorted.slice(0, 4), total: catProducts.length };
      })
      .filter(Boolean) as { category: typeof categories[0]; items: typeof products; total: number }[];
  }, [activeCategory]);

  // Derived
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const heroImage = CATEGORY_IMAGES[activeCategory] || HERO_DEFAULT;

  // "Popular in Zimbabwe" — top rated products not in current filter
  const popularInZim = useMemo(() => {
    return products
      .filter(p => p.rating >= 4.5 && (activeCategory === 'All' || p.category !== activeCategory))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 4);
  }, [activeCategory]);

  // Recently viewed
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[];
  }, [recentlyViewed]);

  const hasActiveFilters = activeCategory !== 'All' || searchQuery.trim() !== '' || sortBy !== 'default' || priceRange !== 'all' || ratingFilter !== 'all';
  const activeFilterCount = [activeCategory !== 'All', sortBy !== 'default', priceRange !== 'all', ratingFilter !== 'all'].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('All');
    setSortBy('default');
    setPriceRange('all');
    setRatingFilter('all');
  }, []);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoading(false);
    }, 400);
  };

  // -- Filter section content (reused in mobile drawer + desktop) --
  const FilterControls = () => (
    <>
      <div>
        <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort By</p>
        <FilterDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} minWidth="100%" />
      </div>
      <div>
        <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price Range</p>
        <FilterDropdown label="Price range" value={priceRange} onChange={setPriceRange} options={PRICE_OPTIONS} minWidth="100%" />
      </div>
      <div>
        <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rating</p>
        <FilterDropdown label="Rating" value={ratingFilter} onChange={setRatingFilter} options={RATING_OPTIONS} minWidth="100%" />
      </div>
      {hasActiveFilters && (
        <button onClick={clearAll} className="w-full py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          <X className="w-3.5 h-3.5 inline mr-1" /> Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="w-full bg-white min-h-screen">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO — Dark header matching SellerStore design
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#111' }}>
        {/* Banner image */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={heroImage}
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
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {activeCategory === 'All' ? 'All Products' : activeCategory}
                </h1>
                {activeCategory === 'All' ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                    <Package className="w-3 h-3" /> All Categories
                  </span>
                ) : (() => {
                  const cat = categories.find(c => c.name === activeCategory);
                  return cat ? (
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                      {cat.emoji} {cat.name}
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{filteredProducts.length}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {filteredProducts.length === 1 ? 'product' : 'products'} found
                  </span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Zimbabwe
                </div>
                {activeCategory !== 'All' && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                    <button
                      onClick={() => navigate('/all-categories')}
                      className="bg-transparent border-none cursor-pointer p-0 hover:underline"
                      style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}
                    >
                      Browse all categories
                    </button>
                  </>
                )}
              </div>
              <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>
                {activeCategory === 'All'
                  ? 'Browse all products from verified Zimbabwean sellers across every category.'
                  : `Discover the best ${activeCategory} products from trusted local Zimbabwean sellers.`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder={`Search in ${activeCategory === 'All' ? 'all categories' : activeCategory}…`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'white',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid #009739'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer">
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. STICKY FILTER BAR — Dark matching ShopPage / AllCategoriesPage
      ═══════════════════════════════════════════════════════════════════════ */}
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
              {[{ name: 'All', emoji: '🛍️' }, ...categories].map(cat => {
                const isActive = cat.name === activeCategory;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className="shrink-0 px-4 py-1.5 rounded-full cursor-pointer transition-all"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? '#009739' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      border: isActive ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}
                    aria-pressed={isActive}
                  >
                    {'emoji' in cat && <span className="mr-1">{cat.emoji}</span>}{cat.name}
                  </button>
                );
              })}
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

            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-2">
              <FilterDropdown dark label="Sort by" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
              <FilterDropdown dark label="Price" value={priceRange} onChange={setPriceRange} options={PRICE_OPTIONS} />
              <FilterDropdown dark label="Rating" value={ratingFilter} onChange={setRatingFilter} options={RATING_OPTIONS} minWidth="130px" />
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                background: activeFilterCount > 0 ? '#009739' : 'rgba(255,255,255,0.06)',
                color: activeFilterCount > 0 ? '#fff' : 'rgba(255,255,255,0.55)',
                border: activeFilterCount > 0 ? 'none' : '1.5px solid rgba(255,255,255,0.1)',
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center" style={{ fontSize: '0.6rem', fontWeight: 700 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <>
                <div className="w-px h-5 shrink-0 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
                <button
                  onClick={clearAll}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CE1126', background: 'rgba(206,17,38,0.1)', border: '1.5px solid rgba(206,17,38,0.2)' }}
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </>
            )}

            {/* Result count */}
            <div className="ml-auto shrink-0">
              <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{filteredProducts.length}</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>results</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* ── MODE A: "All" with no filters → per-category browse rows ── */}
      {activeCategory === 'All' &&
       searchQuery.trim() === '' &&
       sortBy === 'default' &&
       priceRange === 'all' &&
       ratingFilter === 'all' ? (
        <>
          <div className="border-b border-[#EAEAEA]" />
          {allCategoryRows.map((row, idx) => (
            <React.Fragment key={row.category.id}>
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-end justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: 'rgba(0,151,57,0.08)' }}>
                      {row.category.emoji}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>
                        {row.total} products
                      </p>
                      <h2 className="text-gray-900" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{row.category.name}</h2>
                    </div>
                  </div>
                  <button onClick={() => setActiveCategory(row.category.name)} className="flex items-center gap-1 transition-colors shrink-0" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#009739' }}>
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {row.items.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </section>
              {idx < allCategoryRows.length - 1 && <div className="border-b border-[#EAEAEA] mx-8" />}
            </React.Fragment>
          ))}
          <div className="border-b border-[#EAEAEA]" />
        </>

      /* ── MODE B: Specific category, no filters → themed section shelves ── */
      ) : activeCategory !== 'All' &&
          searchQuery.trim() === '' &&
          sortBy === 'default' &&
          priceRange === 'all' &&
          ratingFilter === 'all' &&
          categorySections ? (
        /* ══════════════════════════════════════════════════════════════════════
            SECTIONED CATEGORY VIEW — when viewing category with no filters
        ═══════════════════════════════════════════════════════════════════════ */
        <>
          {/* divider */}
          <div className="border-b border-[#EAEAEA]" />

          {/* ── 1. TOP RATED ── */}
          <CategorySection
            icon={Star}
            accent="#009739"
            label="Highest Rated"
            title="Top Rated"
            items={categorySections.topRated}
            onViewAll={() => setSortBy('rating')}
          />

          <div className="border-b border-[#EAEAEA] mx-8" />

          {/* ── 2. BEST SELLERS ── */}
          <CategorySection
            icon={Flame}
            accent="#CE1126"
            label="Most Purchased"
            title="Best Sellers"
            items={categorySections.bestSellers}
            onViewAll={() => setSortBy('popular')}
          />

          <div className="border-b border-[#EAEAEA] mx-8" />

          {/* ── 3. NEW ARRIVALS ── */}
          {categorySections.newArrivals.length > 0 && (
            <>
              <CategorySection
                icon={Sparkles}
                accent="#009739"
                label="Just Dropped"
                title="New Arrivals"
                items={categorySections.newArrivals}
                onViewAll={() => setSortBy('rating')}
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 4. ON SALE ── */}
          {categorySections.onSale.length > 0 && (
            <>
              <CategorySection
                icon={Tag}
                accent="#CE1126"
                label="Limited Time"
                title="On Sale"
                items={categorySections.onSale}
                onViewAll={() => setPriceRange('under-15')}
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 5. TRENDING NOW ── */}
          {categorySections.trendingNow.length > 0 && (
            <>
              <CategorySection
                icon={TrendingUp}
                accent="#FFD100"
                label="Popular Right Now"
                title="Trending Now"
                items={categorySections.trendingNow}
                onViewAll={() => setSortBy('popular')}
              />
              <div className="border-b border-[#EAEAEA] mx-8" />
            </>
          )}

          {/* ── 6. BUDGET PICKS ── */}
          {categorySections.budgetPicks.length > 0 && (
            <>
              <CategorySection
                icon={Zap}
                accent="#009739"
                label="Under $20"
                title="Budget Picks"
                items={categorySections.budgetPicks}
                onViewAll={() => setPriceRange('under-15')}
              />
            </>
          )}

          <div className="border-b border-[#EAEAEA]" />
        </>

      ) : (
        /* ── MODE C: Filters active → flat filtered grid ──────────────────────
        ═══════════════════════════════════════════════════════════════════════ */
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500" style={{ fontSize: '0.85rem' }}>
              Showing <span className="text-gray-900" style={{ fontWeight: 700 }}>{Math.min(visibleCount, filteredProducts.length)}</span> of{' '}
              <span className="text-gray-900" style={{ fontWeight: 700 }}>{filteredProducts.length}</span> products
              {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-16 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products found</h3>
            <p className="text-gray-500 mb-5" style={{ fontSize: '0.875rem' }}>Try a different category, search term, or remove some filters</p>
            <button onClick={clearAll} className="px-6 py-2.5 bg-[#009739] text-white rounded-xl hover:bg-[#007f30] transition-colors cursor-pointer border-none" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* ── Sponsored / Featured Row ── */}
            {activeCategory !== 'All' && (
              (() => {
                const sponsored = filteredProducts.filter(p => p.isDeal || p.rating >= 4.7).slice(0, 2);
                if (sponsored.length === 0) return null;
                return (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Featured
                      </span>
                      <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>Top picks in {activeCategory}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sponsored.map(product => (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex gap-4 p-4 bg-gradient-to-r from-amber-50/60 to-white border border-amber-100 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                {getSmartBadge(product) && (
                                  <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: '0.6rem', fontWeight: 700, background: getSmartBadge(product)!.color }}>
                                    {getSmartBadge(product)!.label}
                                  </span>
                                )}
                                <span className="text-amber-600" style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sponsored</span>
                              </div>
                              <h3 className="text-gray-900 line-clamp-1" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{product.name}</h3>
                              <p className="text-gray-500 line-clamp-1" style={{ fontSize: '0.75rem' }}>{product.sellerName}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#009739' }}>{formatPrice(product.price)}</span>
                                {product.originalPrice && (
                                  <span className="text-gray-400 line-through" style={{ fontSize: '0.75rem' }}>{formatPrice(product.originalPrice)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <StarRating size={11} />
                                <span className="text-gray-700" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{product.rating}</span>
                                <span className="text-gray-400" style={{ fontSize: '0.68rem' }}>({product.reviewCount})</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}

            {/* ── Product Grid — first batch ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {visibleProducts.slice(0, ITEMS_PER_PAGE).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ═══ Recommendation: Popular in Zimbabwe (after first 8) ═══ */}
            {visibleCount >= ITEMS_PER_PAGE && popularInZim.length > 0 && (
              <div className="my-12 py-8 px-6 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[#009739] mb-0.5" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Trending Now</p>
                    <h2 className="text-gray-900" style={{ fontSize: '1.15rem', fontWeight: 800 }}>Popular in Zimbabwe</h2>
                  </div>
                  <button onClick={() => navigate('/shop')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {popularInZim.map(p => (
                    <ProductCard key={`pop-${p.id}`} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Product Grid — remaining batches ── */}
            {visibleProducts.length > ITEMS_PER_PAGE && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {visibleProducts.slice(ITEMS_PER_PAGE).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* ═══ Recommendation: Recently Viewed ═══ */}
            {visibleCount >= ITEMS_PER_PAGE * 2 && recentlyViewedProducts.length > 0 && (
              <div className="my-12 py-8 px-6 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[#009739] mb-0.5" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Your History</p>
                    <h2 className="text-gray-900" style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recently Viewed</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {recentlyViewedProducts.slice(0, 4).map(p => (
                    <ProductCard key={`rv-${p.id}`} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Load More / Pagination ── */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer border-none disabled:opacity-60"
                  style={{ fontWeight: 700, fontSize: '0.88rem' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </>
                  ) : (
                    <>
                      Load More Products
                      <span className="text-white/60" style={{ fontSize: '0.75rem' }}>
                        ({filteredProducts.length - visibleCount} remaining)
                      </span>
                    </>
                  )}
                </button>
                <p className="text-gray-400 mt-2" style={{ fontSize: '0.75rem' }}>
                  Showing {visibleProducts.length} of {filteredProducts.length}
                </p>
              </div>
            )}

            {/* ── All loaded indicator ── */}
            {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="text-center mt-10 py-6 border-t border-gray-100">
                <p className="text-gray-400" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  You've seen all {filteredProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          4. CHAT WITH MSIKA — WhatsApp contact section
      ═══════════════════════════════════════════════════════════════════════ */}
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
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="rgba(255,255,255,0.6)" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
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

      {/* ═══════════════════════════════════════════════════════════════════════
          5. MOBILE FILTER DRAWER
      ═══════════════════════════════════════════════════════════════════════ */}
      <MobileFilterDrawer isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
        {/* Category selector */}
        <div>
          <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</p>
          <FilterDropdown label="Category" value={activeCategory} onChange={setActiveCategory} options={categoryOptions} minWidth="100%" />
        </div>
        <FilterControls />
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
}