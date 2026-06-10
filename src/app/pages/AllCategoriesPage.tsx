import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, ArrowUpRight, ShoppingBag, Sprout, Sparkles, ArrowRight, X,
  Star, Flame, Tag, TrendingUp, Zap, Shirt, Utensils, Monitor, PawPrint, Home as HomeIcon,
} from 'lucide-react';
import { products, categories } from '../data/mockData';
import { Breadcrumbs } from '../components/Breadcrumbs';
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
  // Women's Fashion
  "Women's Dresses":        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=85&fit=crop',
  "Women's Tops":           'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=85&fit=crop',
  "Women's Bottoms":        'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=800&q=85&fit=crop',
  'Outerwear & Jackets':    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=85&fit=crop',
  'Activewear':             'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=85&fit=crop',
  "Men's Shirts & Tops":    'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&q=85&fit=crop',
  "Men's Shorts & Pants":   'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=85&fit=crop',
  "Kids' Clothing":         'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=85&fit=crop',
  'Swimwear':               'https://images.unsplash.com/photo-1473187983305-f615310e7daa?w=800&q=85&fit=crop',
  'Lingerie & Sleepwear':   'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=85&fit=crop',
  'Heels & Sandals':        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=85&fit=crop',
  'Backpacks & Luggage':    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85&fit=crop',
  'Sunglasses & Eyewear':   'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=85&fit=crop',
  // Beauty
  'Hair Care & Wigs':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85&fit=crop',
  'Makeup & Cosmetics':     'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=85&fit=crop',
  'Nail Care':              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85&fit=crop',
  // Home & Living
  'Home Decor':             'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85&fit=crop',
  'Bedding & Pillows':      'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=85&fit=crop',
  'Kitchen Gadgets':        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85&fit=crop',
  'Yoga & Pilates':         'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85&fit=crop',
  'Plus Size Fashion':      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=85&fit=crop',
  'Pet Supplies':           'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800&q=85&fit=crop',
  // Grocery
  'Fresh Produce':          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=85&fit=crop',
  'Dairy & Eggs':           'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=85&fit=crop',
  'Meat & Poultry':         'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=85&fit=crop',
  'Beverages & Drinks':     'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=800&q=85&fit=crop',
  'Household Cleaning':     'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=85&fit=crop',
  'Bread & Bakery':         'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85&fit=crop',
  // Tech
  'Smart TVs & Displays':   'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=85&fit=crop',
  'Gaming & Consoles':      'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800&q=85&fit=crop',
  'Cameras & Photography':  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85&fit=crop',
  // Furniture
  'Living Room Furniture':  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85&fit=crop',
  'Bedroom Furniture':      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=85&fit=crop',
  'Office Furniture':       'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=85&fit=crop',
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
  "Women's Dresses":        'Dresses',
  "Women's Tops":           "Women's Tops",
  "Women's Bottoms":        "Women's Bottoms",
  'Outerwear & Jackets':    'Outerwear',
  'Activewear':             'Activewear',
  "Men's Shirts & Tops":    "Men's Tops",
  "Men's Shorts & Pants":   "Men's Pants",
  "Kids' Clothing":         "Kids' Wear",
  'Swimwear':               'Swimwear',
  'Lingerie & Sleepwear':   'Lingerie',
  'Heels & Sandals':        'Heels',
  'Backpacks & Luggage':    'Bags',
  'Sunglasses & Eyewear':   'Eyewear',
  'Hair Care & Wigs':       'Hair',
  'Makeup & Cosmetics':     'Makeup',
  'Nail Care':              'Nails',
  'Home Decor':             'Decor',
  'Bedding & Pillows':      'Bedding',
  'Kitchen Gadgets':        'Kitchen',
  'Yoga & Pilates':         'Yoga',
  'Plus Size Fashion':      'Plus Size',
  'Pet Supplies':           'Pets',
  'Fresh Produce':          'Produce',
  'Dairy & Eggs':           'Dairy',
  'Meat & Poultry':         'Meat',
  'Beverages & Drinks':     'Beverages',
  'Household Cleaning':     'Cleaning',
  'Bread & Bakery':         'Bakery',
  'Smart TVs & Displays':   'Smart TVs',
  'Gaming & Consoles':      'Gaming',
  'Cameras & Photography':  'Cameras',
  'Living Room Furniture':  'Living Room',
  'Bedroom Furniture':      'Bedroom',
  'Office Furniture':       'Office',
};

// Themed sections — all 50 categories
const SECTIONS: Array<{ id: string; overline: string; title: string; iconColor: string; iconBg: string; bg: string; categories: string[] }> = [
  {
    id:         'everyday',
    overline:   'Most Popular',
    title:      'Everyday Favourites',
    iconColor:  '#009739',
    iconBg:     'rgba(0,151,57,0.08)',
    bg:         '#fff',
    categories: ['Fashion & Clothing', 'Food & Groceries', 'Beauty & Personal Care', 'Home & Furniture', 'Phones & Computers', 'Electronics & Gadgets'],
  },
  {
    id:         'womens',
    overline:   "Women's Collection",
    title:      "Women's Fashion",
    iconColor:  '#be185d',
    iconBg:     'rgba(190,24,93,0.08)',
    bg:         '#fafafa',
    categories: ["Women's Dresses", "Women's Tops", "Women's Bottoms", 'Swimwear', 'Lingerie & Sleepwear', 'Heels & Sandals', 'Plus Size Fashion'],
  },
  {
    id:         'mens',
    overline:   "Men's Collection",
    title:      "Men's Fashion",
    iconColor:  '#1d4ed8',
    iconBg:     'rgba(29,78,216,0.08)',
    bg:         '#fff',
    categories: ["Men's Shirts & Tops", "Men's Shorts & Pants", 'Outerwear & Jackets', 'Activewear'],
  },
  {
    id:         'kids',
    overline:   'Young Ones',
    title:      "Kids & Accessories",
    iconColor:  '#7c3aed',
    iconBg:     'rgba(124,58,237,0.08)',
    bg:         '#fafafa',
    categories: ["Kids' Clothing", 'Backpacks & Luggage', 'Sunglasses & Eyewear'],
  },
  {
    id:         'beauty',
    overline:   'Look & Feel Good',
    title:      'Beauty & Wellness',
    iconColor:  '#db2777',
    iconBg:     'rgba(219,39,119,0.08)',
    bg:         '#fff',
    categories: ['Hair Care & Wigs', 'Makeup & Cosmetics', 'Nail Care', 'Yoga & Pilates'],
  },
  {
    id:         'homeliving',
    overline:   'Your Space',
    title:      'Home & Living',
    iconColor:  '#0d9488',
    iconBg:     'rgba(13,148,136,0.08)',
    bg:         '#fafafa',
    categories: ['Home Decor', 'Bedding & Pillows', 'Kitchen Gadgets', 'Living Room Furniture', 'Bedroom Furniture', 'Office Furniture'],
  },
  {
    id:         'grocery',
    overline:   'Fresh & Tasty',
    title:      'Food & Supermarket',
    iconColor:  '#16a34a',
    iconBg:     'rgba(22,163,74,0.08)',
    bg:         '#fff',
    categories: ['Fresh Produce', 'Dairy & Eggs', 'Meat & Poultry', 'Beverages & Drinks', 'Household Cleaning', 'Bread & Bakery'],
  },
  {
    id:         'tech',
    overline:   'Digital World',
    title:      'Tech & Gaming',
    iconColor:  '#2563eb',
    iconBg:     'rgba(37,99,235,0.08)',
    bg:         '#fafafa',
    categories: ['Smart TVs & Displays', 'Gaming & Consoles', 'Cameras & Photography'],
  },
  {
    id:         'pets',
    overline:   'Furry Friends',
    title:      'Pet Supplies',
    iconColor:  '#ea580c',
    iconBg:     'rgba(234,88,12,0.08)',
    bg:         '#fff',
    categories: ['Pet Supplies'],
  },
  {
    id:         'trade',
    overline:   'Grow & Build',
    title:      'Business & Trade',
    iconColor:  '#b8930a',
    iconBg:     'rgba(255,209,0,0.12)',
    bg:         '#fafafa',
    categories: ['Farming & Agriculture', 'Vehicles & Auto Parts', 'Services', 'Property & Rentals', 'Construction Materials'],
  },
  {
    id:         'discover',
    overline:   'Unique Finds',
    title:      'Discover More',
    iconColor:  '#009739',
    iconBg:     'rgba(0,151,57,0.08)',
    bg:         '#fff',
    categories: ['Handmade & Crafts', 'Thrift / Second Hand', 'Baby Products', 'Sports & Fitness', 'Books & Education'],
  },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  everyday:   <ShoppingBag className="w-4 h-4" />,
  womens:     <Shirt className="w-4 h-4" />,
  mens:       <Shirt className="w-4 h-4" />,
  kids:       <Shirt className="w-4 h-4" />,
  beauty:     <Sparkles className="w-4 h-4" />,
  homeliving: <HomeIcon className="w-4 h-4" />,
  grocery:    <Utensils className="w-4 h-4" />,
  tech:       <Monitor className="w-4 h-4" />,
  pets:       <PawPrint className="w-4 h-4" />,
  trade:      <Sprout className="w-4 h-4" />,
  discover:   <Sparkles className="w-4 h-4" />,
};


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
  const [search, setSearch] = useState('');

  const searchActive = search.trim().length > 0;

  // ── Derived product shelves ─────────────────────────────────────────────────
  const shelfTopRated    = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 4), []);
  const shelfBestSellers = useMemo(() => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4), []);
  const shelfNewArrivals = useMemo(() => products.filter(p => p.isNew).slice(0, 4), []);
  const shelfOnSale      = useMemo(() => products.filter(p => p.isDeal).slice(0, 4), []);
  const shelfTrending    = useMemo(() => [...products].sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating)).slice(4, 8), []);
  const shelfBudget      = useMemo(() => products.filter(p => p.price < 20).slice(0, 4), []);

  const searchResults = searchActive
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const visibleSections = SECTIONS.map(section => ({
    ...section,
    cats: categories.filter(c => section.categories.includes(c.name)),
  })).filter(s => s.cats.length > 0);

  const resultCount = searchActive ? searchResults.length : categories.length;

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* ── Dark banner ── */}
      <section style={{ background: '#111' }}>
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={ALL_CATEGORIES_BANNER}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-55"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#111]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-8">
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Browse Categories</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                <Sprout className="w-3 h-3" /> All Departments
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{categories.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>categories</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{products.length}+ products</span>
            </div>
            <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>
              Explore every department on Msika — from fashion and electronics to food, crafts and property.
            </p>
          </div>
        </div>
      </section>

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#009739] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH RESULTS (shown only when searching) ── */}
      {searchActive && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
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
            className="border-t border-gray-100 py-10"
            style={{ background: section.bg }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
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
          {shelfTopRated.length > 0    && <ProductSection icon={Star}      accent="#009739" label="Highest Rated"    title="Top Rated on Msika" items={shelfTopRated}    linkTo="/shop" navigate={navigate} />}
          {shelfBestSellers.length > 0 && <ProductSection icon={Flame}     accent="#CE1126" label="Most Purchased"   title="Best Sellers"       items={shelfBestSellers} linkTo="/shop" navigate={navigate} bg="#fafafa" />}
          {shelfNewArrivals.length > 0  && <ProductSection icon={Sparkles}  accent="#009739" label="Just Dropped"     title="New Arrivals"        items={shelfNewArrivals} linkTo="/shop" navigate={navigate} />}
          {shelfOnSale.length > 0       && <ProductSection icon={Tag}       accent="#CE1126" label="Limited Time"     title="On Sale"             items={shelfOnSale}      linkTo="/shop" navigate={navigate} bg="#fafafa" />}
          {shelfTrending.length > 0     && <ProductSection icon={TrendingUp} accent="#b8930a" label="Popular Right Now" title="Trending Now"       items={shelfTrending}    linkTo="/shop" navigate={navigate} />}
          {shelfBudget.length > 0       && <ProductSection icon={Zap}       accent="#009739" label="Under $20"        title="Budget Picks"        items={shelfBudget}      linkTo="/shop" navigate={navigate} bg="#fafafa" />}
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