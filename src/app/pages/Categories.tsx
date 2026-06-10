import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Search, X, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal,
  Star, ArrowRight, Loader2,
  Flame, Sparkles, Tag, TrendingUp, Zap, MapPin, Package,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  categories, products as mockProducts, Product,
  getRecentPurchaseCount, getSmartBadge,
} from '../data/mockData';
import { useProducts } from '../../lib/hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { StarRating } from '../components/StarRating';

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // â”€â”€ Shein-style categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  // â”€â”€ legacy names â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  // â”€â”€ Supermarket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'Fresh Produce':          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=85&fit=crop',
  'Dairy & Eggs':           'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=85&fit=crop',
  'Meat & Poultry':         'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=85&fit=crop',
  'Beverages & Drinks':     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=85&fit=crop',
  'Household Cleaning':     'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=85&fit=crop',
  'Bread & Bakery':         'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85&fit=crop',
  // â”€â”€ Tech Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'Smart TVs & Displays':   'https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=800&q=85&fit=crop',
  'Gaming & Consoles':      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=85&fit=crop',
  'Cameras & Photography':  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=85&fit=crop',
  // â”€â”€ Furniture Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  { label: '$15 - $50',    value: '15-50' },
  { label: '$50 - $100',   value: '50-100' },
  { label: 'Over $100',   value: 'over-100' },
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: 'all' },
  { label: '4 stars and above',  value: '4' },
  { label: '3 stars and above',  value: '3' },
];

// â”€â”€ Styled dropdown component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Mobile filter drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Section component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  items: Product[];
  onViewAll?: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>
              {label}
            </p>
            <h2 className="text-gray-900" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</h2>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: '0.8rem', fontWeight: 600, color: accent }}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  const { products: dbProducts } = useProducts({ limit: 500 });

  // Merge DB products with mock products; DB products take precedence (dedup by id)
  const products = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of mockProducts) map.set(p.id, p);
    for (const p of dbProducts)   map.set(p.id, p);
    return Array.from(map.values());
  }, [dbProducts]);


  useEffect(() => {
    const cat    = searchParams.get('cat');
    const search = searchParams.get('search');
    if (cat)    setActiveCategory(cat);
    if (search) setSearchQuery(search);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchParams]);

  // Reset pagination on filter change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [activeCategory, searchQuery, sortBy, priceRange, ratingFilter]);


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

  // â”€â”€ Category-specific product shelves (when a single category is selected) â”€â”€
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

  // â”€â”€ Per-category rows for the "All" browse view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // “Popular in Zimbabwe” - top rated products not in current filter
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

  const isSingleCategory = activeCategory !== 'All';
  const hasActiveFilters = (!isSingleCategory && activeCategory !== 'All') || searchQuery.trim() !== '' || sortBy !== 'default' || priceRange !== 'all' || ratingFilter !== 'all';
  const activeFilterCount = [sortBy !== 'default', priceRange !== 'all', ratingFilter !== 'all'].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setSearchQuery('');
    if (!isSingleCategory) setActiveCategory('All');
    setSortBy('default');
    setPriceRange('all');
    setRatingFilter('all');
  }, [isSingleCategory]);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* â”€â”€ Breadcrumb â”€â”€ */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-2.5">
        <Breadcrumbs crumbs={
          activeCategory === 'All'
            ? [{ label: 'Categories' }]
            : [{ label: 'Categories', href: '/categories' }, { label: activeCategory }]
        } />
      </div>

      {/* â”€â”€ Page header â”€â”€ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {activeCategory === 'All' ? 'All Products' : activeCategory}
            </h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.82rem' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchQuery.trim() && <> for "<strong className="text-gray-700">{searchQuery}</strong>"</>}
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

      {/* â”€â”€ Main layout â”€â”€ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-6 items-start">

          {/* â”€â”€â”€ Left Sidebar â”€â”€â”€ */}
          <aside className="hidden md:flex flex-col gap-3 w-56 shrink-0 sticky top-20">

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#009739] transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
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
                      name="price"
                      value={opt.value}
                      checked={priceRange === opt.value}
                      onChange={() => setPriceRange(opt.value)}
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
                      name="rating"
                      value={opt.value}
                      checked={ratingFilter === opt.value}
                      onChange={() => setRatingFilter(opt.value)}
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
                onClick={clearAll}
                className="w-full py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                style={{ fontSize: '0.8rem', fontWeight: 600 }}
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </aside>

          {/* â”€â”€â”€ Main content â”€â”€â”€ */}
          <div className="flex-1 min-w-0">

            {/* Sort + active filter chips bar */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== 'All' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0faf4] text-[#009739] rounded-full border border-[#009739]/20" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {activeCategory}
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
                <FilterDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} minWidth="140px" />
              </div>
            </div>

            {/* â”€â”€ MODE A: "All" with no active filters â†’ per-category browse rows â”€â”€ */}
            {activeCategory === 'All' &&
             searchQuery.trim() === '' &&
             sortBy === 'default' &&
             priceRange === 'all' &&
             ratingFilter === 'all' ? (
              <div className="space-y-2">
                {allCategoryRows.map((row, idx) => (
                  <React.Fragment key={row.category.id}>
                    <section className="py-6">
                      <div className="flex items-end justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: 'rgba(0,151,57,0.08)' }}>
                            {row.category.emoji}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>
                              {row.total} products
                            </p>
                            <h2 className="text-gray-900" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{row.category.name}</h2>
                          </div>
                        </div>
                        <button onClick={() => setActiveCategory(row.category.name)} className="flex items-center gap-1 transition-colors shrink-0" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#009739' }}>
                          View all <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {row.items.map(product => <ProductCard key={product.id} product={product} />)}
                      </div>
                    </section>
                    {idx < allCategoryRows.length - 1 && <div className="border-b border-gray-100" />}
                  </React.Fragment>
                ))}
                {allCategoryRows.length === 0 && (
                  <div className="py-20 text-center text-gray-400" style={{ fontSize: '0.9rem' }}>No products available yet.</div>
                )}
              </div>

            /* â”€â”€ MODE B: Specific category, no filters â†’ themed shelves â”€â”€ */
            ) : activeCategory !== 'All' &&
                searchQuery.trim() === '' &&
                sortBy === 'default' &&
                priceRange === 'all' &&
                ratingFilter === 'all' &&
                categorySections ? (
              <div className="divide-y divide-gray-100">
                <CategorySection icon={Star}       accent="#009739" label="Highest Rated"   title="Top Rated"     items={categorySections.topRated}    onViewAll={() => setSortBy('rating')} />
                <CategorySection icon={Flame}      accent="#CE1126" label="Most Purchased"  title="Best Sellers"  items={categorySections.bestSellers} onViewAll={() => setSortBy('popular')} />
                {categorySections.newArrivals.length > 0 && <CategorySection icon={Sparkles} accent="#009739" label="Just Dropped" title="New Arrivals" items={categorySections.newArrivals} />}
                {categorySections.onSale.length > 0        && <CategorySection icon={Tag}      accent="#CE1126" label="Limited Time" title="On Sale"      items={categorySections.onSale} />}
                {categorySections.trendingNow.length > 0   && <CategorySection icon={TrendingUp} accent="#FFD100" label="Popular Right Now" title="Trending Now" items={categorySections.trendingNow} />}
                {categorySections.budgetPicks.length > 0   && <CategorySection icon={Zap}      accent="#009739" label="Under $20"    title="Budget Picks" items={categorySections.budgetPicks} />}
              </div>

            ) : (
              /* â”€â”€ MODE C: Filters active â†’ flat filtered grid â”€â”€ */
              <>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                    <p className="text-4xl mb-4">&#128269;</p>
                    <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products found</h3>
                    <p className="text-gray-500 mb-5" style={{ fontSize: '0.875rem' }}>Try a different category, search term, or remove some filters</p>
                    <button onClick={clearAll} className="px-6 py-2.5 bg-[#009739] text-white rounded-xl hover:bg-[#007f30] transition-colors cursor-pointer border-none" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {visibleProducts.slice(0, ITEMS_PER_PAGE).map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {visibleCount >= ITEMS_PER_PAGE && popularInZim.length > 0 && (
                      <div className="my-10 py-7 px-5 rounded-2xl bg-white border border-gray-100">
                        <div className="flex items-end justify-between mb-5">
                          <div>
                            <p className="text-[#009739] mb-0.5" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Trending Now</p>
                            <h2 className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 800 }}>Popular in Zimbabwe</h2>
                          </div>
                          <button onClick={() => navigate('/shop')} className="flex items-center gap-1 text-[#009739]" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            View all <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {popularInZim.map(p => <ProductCard key={`pop-${p.id}`} product={p} />)}
                        </div>
                      </div>
                    )}

                    {visibleProducts.length > ITEMS_PER_PAGE && (
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                        {visibleProducts.slice(ITEMS_PER_PAGE).map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}

                    {hasMore && (
                      <div className="text-center mt-8">
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer border-none disabled:opacity-60"
                          style={{ fontWeight: 700, fontSize: '0.88rem' }}
                        >
                          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : <>Load More <span className="text-white/60 text-xs">({filteredProducts.length - visibleCount} remaining)</span></>}
                        </button>
                        <p className="text-gray-400 mt-2" style={{ fontSize: '0.75rem' }}>Showing {visibleProducts.length} of {filteredProducts.length}</p>
                      </div>
                    )}

                    {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                      <div className="text-center mt-8 py-5 border-t border-gray-100">
                        <p className="text-gray-400" style={{ fontSize: '0.82rem', fontWeight: 600 }}>You've seen all {filteredProducts.length} products</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Mobile filter drawer â”€â”€ */}
      <MobileFilterDrawer isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
        <div>
          <p className="text-gray-500 mb-3" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009739]"
            />
          </div>
        </div>
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
