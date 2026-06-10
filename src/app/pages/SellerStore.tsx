import React, { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProducts, useSellers } from '../../lib/hooks/useProducts';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Star, CheckCircle, ChevronLeft, ChevronRight, ChevronDown,
  Search, X, SlidersHorizontal, ArrowRight, MapPin, Clock,
  Send, ThumbsUp, BadgeCheck, MessageCircle, Package,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { StarRating } from '../components/StarRating';
import { products } from '../data/mockData';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShopReview {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

// ── Mock shop reviews per seller ──────────────────────────────────────────────
const MOCK_SHOP_REVIEWS: Record<string, ShopReview[]> = {
  s1: [
    { id: 'sr1', user: 'Tatenda M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', rating: 5, comment: 'Absolutely fast delivery! Got my earbuds the same afternoon I ordered. Will definitely buy again from TechHaven.', date: '3 days ago', helpful: 14, verified: true },
    { id: 'sr2', user: 'Rudo C.',    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80', rating: 4, comment: 'Good products, packaging was solid. One item was slightly delayed but they kept me updated on WhatsApp.', date: '1 week ago', helpful: 8, verified: true },
    { id: 'sr3', user: 'Blessing N.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', rating: 5, comment: 'Best tech shop on Msika. Prices are fair and the seller is very responsive — replied within 2 minutes!', date: '2 weeks ago', helpful: 21, verified: false },
  ],
  s2: [
    { id: 'sr4', user: 'Farai D.',  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80', rating: 5, comment: 'Grade-A bale is no joke — top quality. Found a Ralph Lauren jacket for $5. This shop is the real deal.', date: '5 days ago', helpful: 33, verified: true },
    { id: 'sr5', user: 'Tsitsi Z.', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80', rating: 4, comment: 'Loved the selection! Only thing is the website photos don\'t always match exactly but the quality is great.', date: '2 weeks ago', helpful: 12, verified: true },
  ],
  s3: [
    { id: 'sr6', user: 'Chido K.',  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', rating: 5, comment: 'My skin has never looked better since I started using Naturals ZW shea butter. 100% natural, no harsh chemicals.', date: '4 days ago', helpful: 19, verified: true },
    { id: 'sr7', user: 'Paidamoyo L.', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80', rating: 5, comment: 'Ordered the marula oil and it arrived in beautiful packaging. Smells divine and works wonders.', date: '1 week ago', helpful: 9, verified: false },
    { id: 'sr8', user: 'Nyarai W.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80', rating: 4, comment: 'Great Zimbabwean skincare. Delivery was prompt and the seller included a handwritten thank-you note 💚', date: '3 weeks ago', helpful: 27, verified: true },
  ],
  s4: [
    { id: 'sr9', user: 'Kudzi B.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', rating: 4, comment: 'Picked up a pair of Air Force 1s and they\'re authentic. Came with box and receipt. Solid seller.', date: '6 days ago', helpful: 16, verified: true },
  ],
  s5: [
    { id: 'sr10', user: 'Mai Shumba',  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', rating: 5, comment: 'Nhamo yenyu! The maputi brought back memories of being a kid at gogo\'s house. Authentic taste, fast delivery!', date: '2 days ago', helpful: 44, verified: true },
    { id: 'sr11', user: 'Taurai F.',   avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80', rating: 5, comment: 'Mbuya\'s Kitchen is the only place I trust for proper Zimbabwean snacks. Never disappoints.', date: '1 week ago', helpful: 31, verified: true },
    { id: 'sr12', user: 'Amara S.',    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80', rating: 5, comment: 'Ordered biltong and dried mopane as a gift for family abroad. They were thrilled! Top quality.', date: '3 weeks ago', helpful: 18, verified: false },
  ],
  s6: [
    { id: 'sr13', user: 'Simba M.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', rating: 5, comment: 'Got a stone sculpture as a wedding gift — absolutely stunning. ZimCrafts Studio is a gem on Msika.', date: '1 week ago', helpful: 22, verified: true },
    { id: 'sr14', user: 'Nyasha T.', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80', rating: 4, comment: 'Beautiful woven baskets. Very detailed craftsmanship. Packaging could be a bit sturdier for shipping.', date: '2 weeks ago', helpful: 7, verified: true },
  ],
};

// ── Star input for review form ─────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className="w-7 h-7 transition-colors"
            style={{
              color: n <= (hovered || value) ? '#FFD100' : '#e5e7eb',
              fill: n <= (hovered || value) ? '#FFD100' : 'none',
            }}
          />
        </button>
      ))}
      <span className="ml-2 text-gray-500" style={{ fontSize: '0.8rem' }}>
        {(hovered || value) > 0 && ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hovered || value)]}
      </span>
    </div>
  );
}

// ── Filter/sort constants ─────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: 'Featured',          value: 'default'    },
  { label: 'Price: Low → High', value: 'price-asc'  },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Top Rated',         value: 'rating'     },
  { label: 'Newest',            value: 'new'        },
];

const PRICE_OPTIONS = [
  { label: 'Any Price',   value: 'all'      },
  { label: 'Under $15',  value: 'under-15' },
  { label: '$15 – $50',  value: '15-50'    },
  { label: '$50 – $100', value: '50-100'   },
  { label: 'Over $100',  value: 'over-100' },
];

// ── Inline shop card — matches "Top Rated on Msika" card style ────────────────
function ShopCard({ s }: { s: { id: string; name: string; logo: string; banner: string; rating: number; reviewCount: number; verified: boolean; location: string; category: string; productCount: number; joined?: string } }) {
  const navigate = useNavigate();
  const productCount = s.productCount;
  return (
    <button
      onClick={() => navigate(`/store/${s.id}`)}
      className="group bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden text-left hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      aria-label={`Visit ${s.name}`}
    >
      {/* Banner */}
      <div className="relative overflow-hidden bg-gray-100" style={{ height: '130px' }}>
        <img
          src={s.banner}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)' }} />
        {/* Rating pill */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <Star className="w-3 h-3" style={{ color: '#FFD100', fill: '#FFD100' }} />
          <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s.rating}</span>
        </div>
        {/* Verified badge */}
        {s.verified && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 text-white text-[10px] px-2.5 py-1 rounded-full"
            style={{ fontWeight: 700, background: 'rgba(0,151,57,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-5">
        <div className="-mt-10 relative mb-3">
          <img
            src={s.logo}
            alt={s.name}
            className="w-14 h-14 rounded-2xl object-cover shadow-lg"
            style={{ border: '3px solid #fff' }}
            loading="lazy"
          />
        </div>
        <p className="text-gray-900 mb-0.5 truncate" style={{ fontSize: '1rem', fontWeight: 700 }}>{s.name}</p>
        <p className="text-gray-500 mb-3" style={{ fontSize: '0.78rem' }}>{s.category}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.72rem' }}>
            <MapPin className="w-3 h-3 shrink-0" /> {s.location}
          </span>
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.72rem' }}>
            <Package className="w-3 h-3 shrink-0" /> {productCount} items
          </span>
        </div>
        <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>Since {s.joined}</span>
          <span className="flex items-center gap-1 text-[#009739] group-hover:gap-2 transition-all" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
            Visit shop <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function SellerStore() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sellers } = useSellers();
  const { products: allProducts } = useProducts({ sellerId: id });
  const seller = sellers.find(s => s.id === id);
  const allSellerProducts = allProducts;

  // Filter state
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('default');
  const [priceRange,     setPriceRange]     = useState('all');
  const [search,         setSearch]         = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Review state
  const [reviews, setReviews] = useState<ShopReview[]>(
    MOCK_SHOP_REVIEWS[id || ''] || []
  );
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());
  const [newReview, setNewReview] = useState({ name: '', rating: 0, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollPills = (dir: 'left' | 'right') => {
    pillsRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  // Derive unique categories
  const sellerCategories = useMemo(() => (
    [...new Set(allSellerProducts.map(p => p.category))]
  ), [allSellerProducts]);
  const ALL_CATS = ['All', ...sellerCategories];

  // Filtered products
  const sellerProducts = useMemo(() => {
    let filtered = [...allSellerProducts];
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
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
  }, [allSellerProducts, activeCategory, search, priceRange, sortBy]);

  // Other shops (exclude current)
  const otherShops = useMemo(() => (
    sellers.filter(s => s.id !== id).slice(0, 6)
  ), [id, sellers]);

  // Top rated (global)
  const topRated = useMemo(() => (
    [...products].sort((a, b) => b.rating - a.rating).slice(0, 4)
  ), []);

  const hasActiveFilters = activeCategory !== 'All' || sortBy !== 'default' || priceRange !== 'all' || search.trim() !== '';
  const clearFilters = () => { setActiveCategory('All'); setSortBy('default'); setPriceRange('all'); setSearch(''); };

  // Rating breakdown
  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
    return counts.reverse(); // 5→1
  }, [reviews]);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : String(seller?.rating ?? '0');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim()) { setReviewError('Please enter your name.'); return; }
    if (newReview.rating === 0) { setReviewError('Please select a star rating.'); return; }
    if (newReview.comment.trim().length < 10) { setReviewError('Comment must be at least 10 characters.'); return; }
    setReviewError('');
    const added: ShopReview = {
      id: `sr-${Date.now()}`,
      user: newReview.name.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newReview.name.trim())}&background=009739&color=fff&size=80`,
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      date: 'Just now',
      helpful: 0,
      verified: false,
    };
    setReviews(prev => [added, ...prev]);
    setNewReview({ name: '', rating: 0, comment: '' });
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (!seller) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-3xl mb-3">🏪</p>
        <h2 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>Shop not found</h2>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-[#009739] text-white rounded-lg text-sm border-none cursor-pointer" style={{ fontWeight: 600 }}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-10 py-3 border-b border-gray-100">
        <Breadcrumbs crumbs={[
          { label: 'Shops', href: '/shops' },
          { label: seller.name },
        ]} />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          1. DARK HEADER
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#111' }}>
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img src={seller.banner} alt="" aria-hidden="true" className="w-full h-full object-cover opacity-60" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#111]" />
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

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-10 relative z-10">
            <img
              src={seller.logo}
              alt={seller.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
              style={{ border: '3px solid rgba(255,255,255,0.12)', background: '#222' }}
            />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'rgba(0,151,57,0.2)', color: '#22c55e', border: '1px solid rgba(0,151,57,0.3)', fontWeight: 700 }}>
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating size={13} />
                  <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{seller.rating}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>({seller.reviewCount} reviews)</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5" /> {seller.location}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>·</span>
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <Clock className="w-3.5 h-3.5" /> {seller.responseTime}
                </div>
              </div>
              <p className="mt-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px' }}>{seller.description}</p>
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder="Search this store…"
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

      {/* ════════════════════════════════════════════════════════════════
          2. STICKY FILTER BAR
      ════════════════════════════════════════════════════════════════ */}
      <section className="sticky top-16 z-20 shadow-sm" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="flex items-center gap-2 py-3">

            <button onClick={() => scrollPills('left')} aria-label="Scroll left"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div ref={pillsRef} className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
              {ALL_CATS.map(cat => {
                const isActive = cat === activeCategory;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="shrink-0 px-4 py-1.5 rounded-full cursor-pointer transition-all"
                    style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, background: isActive ? '#009739' : 'rgba(255,255,255,0.06)', color: isActive ? '#fff' : 'rgba(255,255,255,0.55)', border: isActive ? '1.5px solid #009739' : '1.5px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
                    aria-pressed={isActive}>
                    {cat}
                  </button>
                );
              })}
            </div>

            <button onClick={() => scrollPills('right')} aria-label="Scroll right"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-5 shrink-0 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }} />

            <div className="relative shrink-0 hidden md:block">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-full cursor-pointer focus:outline-none transition-all"
                style={{ fontSize: '0.75rem', fontWeight: 600, background: sortBy !== 'default' ? '#009739' : 'rgba(255,255,255,0.06)', color: sortBy !== 'default' ? '#fff' : 'rgba(255,255,255,0.45)', border: sortBy !== 'default' ? 'none' : '1px solid rgba(255,255,255,0.12)' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: sortBy !== 'default' ? '#fff' : 'rgba(255,255,255,0.35)' }} />
            </div>

            <div className="relative shrink-0 hidden md:block">
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-full cursor-pointer focus:outline-none transition-all"
                style={{ fontSize: '0.75rem', fontWeight: 600, background: priceRange !== 'all' ? '#009739' : 'rgba(255,255,255,0.06)', color: priceRange !== 'all' ? '#fff' : 'rgba(255,255,255,0.45)', border: priceRange !== 'all' ? 'none' : '1px solid rgba(255,255,255,0.12)' }}>
                {PRICE_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: priceRange !== 'all' ? '#fff' : 'rgba(255,255,255,0.35)' }} />
            </div>

            <button onClick={() => setShowMobileFilters(true)}
              className="md:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer transition-all"
              style={{ fontSize: '0.78rem', fontWeight: 600, background: (sortBy !== 'default' || priceRange !== 'all') ? '#009739' : 'rgba(255,255,255,0.06)', color: (sortBy !== 'default' || priceRange !== 'all') ? '#fff' : 'rgba(255,255,255,0.55)', border: (sortBy !== 'default' || priceRange !== 'all') ? 'none' : '1.5px solid rgba(255,255,255,0.1)' }}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CE1126', background: 'rgba(206,17,38,0.1)', border: '1.5px solid rgba(206,17,38,0.2)' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            <div className="ml-auto shrink-0">
              <span className="text-white" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{sellerProducts.length}</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-5" style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Filters & Sort</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 border-none cursor-pointer bg-transparent"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full pl-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none cursor-pointer" style={{ fontSize: '0.85rem' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <p className="text-gray-500 mb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price Range</p>
                <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="w-full pl-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none cursor-pointer" style={{ fontSize: '0.85rem' }}>
                  {PRICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button onClick={() => setShowMobileFilters(false)} className="w-full py-3 rounded-xl bg-[#009739] text-white cursor-pointer border-none" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          3. PRODUCTS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#EAEAEA] py-14" aria-label="Store products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,151,57,0.08)' }}>
                <Package className="w-4 h-4 text-[#009739]" />
              </div>
              <div>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>Store Listing</p>
                <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Products from {seller.name}</h2>
              </div>
            </div>
            <span className="text-gray-500" style={{ fontSize: '0.82rem' }}>
              <span className="text-gray-900" style={{ fontWeight: 700 }}>{sellerProducts.length}</span> results
            </span>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-16 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="text-3xl mb-3">📦</p>
              <p className="text-gray-900 mb-1" style={{ fontSize: '1rem', fontWeight: 700 }}>
                {hasActiveFilters ? 'No products match your filters' : 'No products listed yet'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 px-5 py-2.5 bg-[#009739] text-white rounded-xl cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sellerProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. CUSTOMER REVIEWS
      ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#EAEAEA] py-14" aria-label="Customer reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,209,0,0.1)' }}>
              <MessageCircle className="w-4 h-4" style={{ color: '#FFD100' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>Buyer Feedback</p>
              <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Customer Reviews</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — rating summary + write review */}
            <div className="lg:col-span-1 space-y-6">

              {/* Score card */}
              <div className="rounded-2xl border border-[#EAEAEA] p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="text-gray-900 mb-1" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{avgRating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className="w-4 h-4" style={{ color: n <= Math.round(parseFloat(avgRating)) ? '#FFD100' : '#e5e7eb', fill: n <= Math.round(parseFloat(avgRating)) ? '#FFD100' : 'none' }} />
                  ))}
                </div>
                <p className="text-gray-400" style={{ fontSize: '0.78rem' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>

                {/* Bar breakdown */}
                <div className="mt-5 space-y-2">
                  {[5,4,3,2,1].map((star, i) => {
                    const count = ratingBreakdown[i];
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-gray-500 shrink-0" style={{ fontSize: '0.72rem', fontWeight: 600, width: '20px', textAlign: 'right' }}>{star}★</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: '6px', background: '#f3f4f6' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 0 ? '#FFD100' : '#e5e7eb' }} />
                        </div>
                        <span className="text-gray-400 shrink-0" style={{ fontSize: '0.68rem', width: '28px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write a review form */}
              <div className="rounded-2xl border border-[#EAEAEA] p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-gray-900 mb-4" style={{ fontSize: '1rem', fontWeight: 800 }}>Share Your Experience</h3>
                {reviewSubmitted ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,151,57,0.1)' }}>
                      <CheckCircle className="w-6 h-6 text-[#009739]" />
                    </div>
                    <p className="text-gray-900" style={{ fontWeight: 700 }}>Review submitted!</p>
                    <p className="text-gray-500 mt-1" style={{ fontSize: '0.82rem' }}>Thank you for your feedback.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Rating</label>
                      <StarInput value={newReview.rating} onChange={v => setNewReview(p => ({ ...p, rating: v }))} />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tatenda M."
                        value={newReview.name}
                        onChange={e => setNewReview(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#EAEAEA] focus:outline-none focus:border-[#009739] transition-colors"
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Review</label>
                      <textarea
                        placeholder="How was your experience buying from this shop?"
                        value={newReview.comment}
                        onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#EAEAEA] focus:outline-none focus:border-[#009739] transition-colors resize-none"
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>
                    {reviewError && <p className="text-[#CE1126]" style={{ fontSize: '0.78rem' }}>{reviewError}</p>}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#009739] text-white hover:bg-[#007f30] transition-colors cursor-pointer border-none"
                      style={{ fontWeight: 700, fontSize: '0.88rem' }}
                    >
                      <Send className="w-4 h-4" /> Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right — review list */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-[#EAEAEA] p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-gray-900" style={{ fontWeight: 700 }}>No reviews yet</p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: '0.85rem' }}>Be the first to share your experience.</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="rounded-2xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-start gap-3">
                      <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{review.user}</span>
                          {review.verified && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(0,151,57,0.08)', color: '#009739', border: '1px solid rgba(0,151,57,0.15)' }}>
                              <BadgeCheck className="w-3 h-3" /> Verified buyer
                            </span>
                          )}
                          <span className="text-gray-400 ml-auto shrink-0" style={{ fontSize: '0.72rem' }}>{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= review.rating ? '#FFD100' : '#e5e7eb', fill: n <= review.rating ? '#FFD100' : 'none' }} />
                          ))}
                        </div>
                        <p className="text-gray-600 leading-relaxed" style={{ fontSize: '0.875rem' }}>{review.comment}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              if (!helpfulClicked.has(review.id)) {
                                setHelpfulClicked(prev => new Set([...prev, review.id]));
                                setReviews(prev => prev.map(r => r.id === review.id ? { ...r, helpful: r.helpful + 1 } : r));
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer bg-transparent"
                            style={{
                              fontSize: '0.72rem', fontWeight: 600,
                              borderColor: helpfulClicked.has(review.id) ? '#009739' : '#e5e7eb',
                              color: helpfulClicked.has(review.id) ? '#009739' : '#6b7280',
                              background: helpfulClicked.has(review.id) ? 'rgba(0,151,57,0.06)' : 'transparent',
                            }}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          5. BROWSE OTHER SHOPS — card grid
      ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#EAEAEA] py-14" aria-label="Browse other shops">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,151,57,0.08)' }}>
                <BadgeCheck className="w-4 h-4 text-[#009739]" />
              </div>
              <div>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>Verified Stores</p>
                <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Browse Other Shops</h2>
              </div>
            </div>
            <button onClick={() => navigate('/shops')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              All shops <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherShops.map(s => <ShopCard key={s.id} s={s} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. TOP RATED PRODUCTS (from landing page)
      ════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#EAEAEA] py-14" aria-label="Top rated products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,151,57,0.08)' }}>
                <Star className="w-4 h-4 text-[#009739]" />
              </div>
              <div>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#009739' }}>Highest Rated</p>
                <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Top Rated on Msika</h2>
              </div>
            </div>
            <button onClick={() => navigate('/shop?filter=top-rated')} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topRated.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. CHAT WITH MSIKA TEAM
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20" style={{ background: '#0a0a0a' }} aria-label="Chat with Msika team">
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
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="rgba(255,255,255,0.6)" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="text-white/50" style={{ fontSize: '0.88rem' }}>+263 · WhatsApp</span>
              </div>
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
