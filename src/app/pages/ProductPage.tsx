import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  getSellerById, getProductsBySeller,
  getFrequentlyBoughtTogether, getSimilarProducts, getCustomersAlsoBought,
  getStockLeft, getViewingCount, getRecentPurchaseCount,
  getDeliveryEstimate, getSmartBadge, products,
  getDealEndTime, getBoughtTodayCount,
} from '../data/mockData';
import { useProductById } from '../../lib/hooks/useProducts';
import { useStore } from '../context/StoreContext';
import {
  Star, Truck, Plus, Minus, ShoppingBag, Heart, CheckCircle, Clock,
  Shield, Share2, Eye, Users, TrendingUp, Flame,
  Package, CreditCard, Zap, ChevronRight,
  FileText, DollarSign, Loader2, X, Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductCard } from '../components/ProductCard';
import { StarRating } from '../components/StarRating';

// ── Variant data by category ──────────────────────────────────────────────────
const CATEGORY_VARIANTS: Record<string, { sizes?: string[]; colors?: { name: string; hex: string }[] }> = {
  'Thrift Clothes': { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Blue', hex: '#3B82F6' }, { name: 'Black', hex: '#111' }, { name: 'Grey', hex: '#6B7280' }] },
  'Traditional Wear': { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ name: 'Multi', hex: '#E11D48' }, { name: 'Blue', hex: '#2563EB' }, { name: 'Green', hex: '#16A34A' }] },
  "Men's Fashion": { sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ name: 'Black', hex: '#111' }, { name: 'White', hex: '#F9FAFB' }, { name: 'Grey', hex: '#6B7280' }] },
  'Sneakers & Shoes': { sizes: ['7', '8', '9', '10', '11', '12'], colors: [{ name: 'White', hex: '#F9FAFB' }, { name: 'Black', hex: '#111' }] },
  'Baby & Kids': { sizes: ['0-3m', '3-6m', '6-12m'], colors: [{ name: 'Yellow', hex: '#FBBF24' }, { name: 'Green', hex: '#34D399' }, { name: 'White', hex: '#F9FAFB' }] },
  'Bags & Accessories': { colors: [{ name: 'Brown', hex: '#92400E' }, { name: 'Black', hex: '#111' }, { name: 'Tan', hex: '#D97706' }] },
  'Jewelry & Watches': { colors: [{ name: 'Gold', hex: '#D97706' }, { name: 'Silver', hex: '#9CA3AF' }, { name: 'Multi', hex: '#E11D48' }] },
  'Sports & Outdoors': { sizes: ['S', 'M', 'L', 'XL'] },
};

const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, formatPrice, addToRecentlyViewed, recentlyViewed, openCart, addQuotation, addPreOrder, user, isBackInStockNotified, toggleBackInStock, addReview, getProductReviews, hasUserReviewed } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewHoverRating, setReviewHoverRating] = useState(0);

  // Fetch product from Supabase (falls back to mock data automatically)
  const { product, loading: productLoading } = useProductById(id || '');
  const seller = product ? getSellerById(product.sellerId) : undefined;
  const relatedProducts = product ? getProductsBySeller(product.sellerId).filter(p => p.id !== product.id) : [];
  const frequentlyBought = product ? getFrequentlyBoughtTogether(product.id) : [];
  const similarProducts = product ? getSimilarProducts(product.id) : [];
  const alsoB = product ? getCustomersAlsoBought(product.id) : [];

  // Recently viewed products (excluding current)
  const recentlyViewedProducts = recentlyViewed
    .filter(pid => pid !== id)
    .map(pid => products.find(p => p.id === pid))
    .filter(Boolean) as typeof products;

  // Track recently viewed
  useEffect(() => {
    if (id) addToRecentlyViewed(id);
  }, [id]);

  // Sticky bar on scroll
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (productLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-10 h-10 border-4 border-[#009739] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-4xl mb-3">😕</p>
        <h2 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>Product not found</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-[#009739] text-white rounded-lg text-sm" style={{ fontWeight: 600 }}>
          Browse products
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const stockLeft = getStockLeft(product.id);
  const viewingCount = getViewingCount(product.id);
  const recentPurchases = getRecentPurchaseCount(product.id);
  const deliveryEst = getDeliveryEstimate(product.deliveryBadge);
  const smartBadge = getSmartBadge(product);
  const dealEndTime = getDealEndTime(product.id);
  const boughtTodayCount = getBoughtTodayCount(product.id);

  const handleAddToCart = () => {
    const variants = CATEGORY_VARIANTS[product.category];
    if (variants) {
      if (variants.sizes && !selectedSize) { toast.error('Please select a size'); return; }
      if (variants.colors && !selectedColor) { toast.error('Please select a color'); return; }
    }
    addToCart(product, quantity);
    toast.success('Added to cart', {
      description: `${quantity}x ${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`,
    });
  };

  const handleBuyNow = () => {
    const variants = CATEGORY_VARIANTS[product.category];
    if (variants) {
      if (variants.sizes && !selectedSize) { toast.error('Please select a size'); return; }
      if (variants.colors && !selectedColor) { toast.error('Please select a color'); return; }
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Link copied!', { description: 'Product link copied to clipboard.' });
  };

  const handleWhatsApp = () => {
    if (!seller) return;
    const msg = encodeURIComponent(`Hi! I'm interested in *${product.name}* ($${product.price}) on Msika. Is it available?`);
    window.open(`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const bundleTotal = frequentlyBought.reduce((s, p) => s + p.price, product.price);

  // -- Section header helper --
  const SectionHeader = ({ overline, title, viewAllTo }: { overline: string; title: string; viewAllTo?: string }) => (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-[#009739] mb-0.5" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{overline}</p>
        <h2 className="text-gray-900" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{title}</h2>
      </div>
      {viewAllTo && (
        <button onClick={() => navigate(viewAllTo)} className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
          <button onClick={() => navigate('/')} className="text-[#009739] hover:underline bg-transparent border-none cursor-pointer p-0">Home</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => navigate('/shop')} className="text-[#009739] hover:underline bg-transparent border-none cursor-pointer p-0">Shop</button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* ─── Images ─── */}
          <div>
            <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio: '4/3' }}>
              <img
                src={product.images[activeImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {discount > 0 && (
                  <span className="bg-[#CE1126] text-white text-xs px-2.5 py-1 rounded-lg" style={{ fontWeight: 700 }}>
                    -{discount}%
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-[#009739] text-white text-xs px-2.5 py-1 rounded-lg" style={{ fontWeight: 700 }}>
                    New
                  </span>
                )}
                {smartBadge && !product.isNew && (
                  <span className="text-white text-xs px-2.5 py-1 rounded-lg inline-flex items-center gap-1" style={{ fontWeight: 700, background: smartBadge.color }}>
                    {smartBadge.label.includes('Best') && <TrendingUp className="w-3 h-3" />}
                    {smartBadge.label.includes('Hot') && <Flame className="w-3 h-3" />}
                    {smartBadge.label}
                  </span>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mb-5">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 p-0"
                    style={{ border: `2px solid ${activeImage === idx ? '#009739' : '#e5e5e5'}` }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* ─── Delivery Options (below image) ─── */}
            <div className="bg-gray-50 border border-[#EAEAEA] rounded-xl p-4 mb-3">
              <p className="text-xs text-gray-900 mb-3" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Options</p>
              <div className="space-y-2.5">
                {[
                  { icon: Truck,   label: 'Same-Day (InDrive)', time: 'Order before 12pm', price: '$5',   highlight: product.deliveryBadge === 'Same-Day Delivery' },
                  { icon: Package, label: 'Home Delivery',       time: '1-3 business days', price: '$2',   highlight: product.deliveryBadge === 'Home Delivery' },
                  { icon: Package, label: 'Free Delivery',       time: 'Tomorrow',           price: 'Free', highlight: product.deliveryBadge === 'Free Delivery' },
                ].map((opt, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ opacity: opt.highlight ? 1 : 0.45 }}>
                    <opt.icon className="w-4 h-4 shrink-0" style={{ color: opt.highlight ? '#009739' : '#9ca3af' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.time}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ fontWeight: 700, color: opt.price === 'Free' ? '#009739' : '#374151' }}>{opt.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Payment & Protection (below image) ─── */}
            <div className="bg-gray-50 border border-[#EAEAEA] rounded-xl p-4">
              <p className="text-xs text-gray-900 mb-3" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment & Protection</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#009739] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{product.paymentMethods.join(' · ')}</p>
                    <p className="text-xs text-gray-400">Secure payments via Msika</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#009739] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>Buyer Protection</p>
                    <p className="text-xs text-gray-400">EcoCash escrow — funds released on delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#009739] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>Estimated Delivery</p>
                    <p className="text-xs text-gray-400">
                      {deliveryEst === 'Today' ? 'Today if ordered before 12pm' : deliveryEst === 'Tomorrow' ? 'Tomorrow — free shipping' : '1-3 business days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Product Info ─── */}
          <div>
            <p className="text-xs text-[#009739] uppercase tracking-wide mb-2" style={{ fontWeight: 600 }}>{product.category}</p>
            <h1 className="text-2xl lg:text-3xl text-gray-900 mb-3" style={{ fontWeight: 800 }}>{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <StarRating size={16} />
              <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{product.rating}</span>
              <span className="text-sm text-gray-400">{product.reviewCount} reviews</span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="text-sm" style={{ fontWeight: 600, color: product.inStock ? '#009739' : '#dc2626' }}>
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mb-4 pb-4 border-b border-gray-100">
              <span className="text-3xl text-gray-900" style={{ fontWeight: 900 }}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm text-[#009739]" style={{ fontWeight: 700 }}>Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* ─── Social Proof / Urgency Row ─── */}
            <div className="flex flex-wrap gap-3 mb-5">
              {/* Deal countdown timer */}
              {product.isDeal && product.originalPrice && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(206,17,38,0.08)', border: '1px solid rgba(206,17,38,0.15)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#CE1126' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#CE1126' }}>
                    Deal ends in {dealEndTime.hours}h {dealEndTime.minutes}m
                  </span>
                </div>
              )}
              {stockLeft <= 8 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(206,17,38,0.08)', border: '1px solid rgba(206,17,38,0.15)' }}>
                  <Flame className="w-3.5 h-3.5" style={{ color: '#CE1126' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#CE1126' }}>Only {stockLeft} left in stock</span>
                </div>
              )}
              {/* Bought today */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.12)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#009739' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#009739' }}>{boughtTodayCount} bought today</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280' }}>{viewingCount} viewing now</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.12)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: '#009739' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#009739' }}>{recentPurchases} bought this week</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{product.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">#{tag}</span>
              ))}
            </div>

            {/* ─── Variant Selectors ─── */}
            {(() => {
              const variants = CATEGORY_VARIANTS[product.category];
              if (!variants) return null;
              return (
                <div className="mb-5 space-y-4">
                  {variants.sizes && (
                    <div>
                      <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                        Size {selectedSize && <span className="text-[#009739]">— {selectedSize}</span>}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variants.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                            className="min-w-[40px] h-10 px-3 rounded-lg text-sm cursor-pointer transition-all"
                            style={{
                              fontWeight: 600,
                              border: selectedSize === size ? '2px solid #009739' : '1px solid #e5e7eb',
                              background: selectedSize === size ? '#f0faf4' : '#fff',
                              color: selectedSize === size ? '#009739' : '#374151',
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {variants.colors && (
                    <div>
                      <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                        Color {selectedColor && <span className="text-[#009739]">— {selectedColor}</span>}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variants.colors.map(color => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(selectedColor === color.name ? '' : color.name)}
                            className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm cursor-pointer transition-all"
                            style={{
                              fontWeight: 600,
                              border: selectedColor === color.name ? '2px solid #009739' : '1px solid #e5e7eb',
                              background: selectedColor === color.name ? '#f0faf4' : '#fff',
                              color: selectedColor === color.name ? '#009739' : '#374151',
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded-full shrink-0"
                              style={{ background: color.hex, border: color.hex === '#F9FAFB' ? '1px solid #d1d5db' : 'none' }}
                            />
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm text-gray-600" style={{ fontWeight: 600 }}>Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer">
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-10 text-center text-sm" style={{ fontWeight: 700 }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer">
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <span className="text-sm text-gray-500">Total: <strong className="text-gray-900">{formatPrice(product.price * quantity)}</strong></span>
            </div>

            {/* ─── CTA Row ─── */}
            <div className="flex gap-2.5 mb-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#009739] text-white rounded-xl text-sm hover:bg-[#007f30] transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-xl text-sm transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 700, background: '#111' }}
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>

            {/* Back in stock notification for out-of-stock items */}
            {!product.inStock && (
              <button
                onClick={() => {
                  toggleBackInStock(product.id);
                  toast(isBackInStockNotified(product.id) ? 'Notification removed' : 'We\'ll notify you when it\'s back!', {
                    description: isBackInStockNotified(product.id) ? undefined : `You'll get a notification when ${product.name} is back in stock.`,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm mb-3 cursor-pointer transition-colors"
                style={{
                  fontWeight: 700,
                  background: isBackInStockNotified(product.id) ? 'rgba(0,151,57,0.08)' : '#FFD100',
                  color: isBackInStockNotified(product.id) ? '#009739' : '#111',
                  border: isBackInStockNotified(product.id) ? '1px solid rgba(0,151,57,0.2)' : 'none',
                }}
              >
                <Bell className="w-4 h-4" />
                {isBackInStockNotified(product.id) ? 'Notification Set — We\'ll Alert You' : 'Notify Me When Back in Stock'}
              </button>
            )}

            <div className="flex gap-2.5 mb-5">
              <button
                onClick={() => { toggleWishlist(product.id); toast(wishlisted ? 'Removed from wishlist' : 'Saved!'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                style={{ fontWeight: 600, color: wishlisted ? '#CE1126' : '#666' }}
              >
                <Heart className="w-4 h-4" fill="none" color={wishlisted ? '#CE1126' : '#666'} /> {wishlisted ? 'Saved' : 'Save for Later'}
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* ─── Request Quotation & Pre-order Row ─── */}
            <div className="flex gap-2.5 mb-5">
              <button
                onClick={() => setShowQuotationModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer text-sm bg-white"
                style={{ fontWeight: 600 }}
              >
                <FileText className="w-4 h-4" /> Request Quotation
              </button>
              {product.price >= 50 && (
                <button
                  onClick={() => setShowPreOrderModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm cursor-pointer bg-white transition-colors"
                  style={{ fontWeight: 600, borderColor: '#FFD100', color: '#856404' }}
                >
                  <DollarSign className="w-4 h-4" /> Pre-order (30% deposit)
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ─── Seller info & Reviews ─── */}
        {seller && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-base text-gray-900 mb-4" style={{ fontWeight: 700 }}>Seller Information</h2>
              <div className="flex items-center gap-3 mb-3">
                <img src={seller.logo} alt={seller.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" loading="lazy" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{seller.name}</p>
                    {seller.verified && <CheckCircle className="w-3.5 h-3.5" fill="none" color="#009739" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating size={12} />
                    <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{seller.rating}</span>
                    <span className="text-xs text-gray-400">({seller.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{seller.description}</p>
              <div className="flex gap-2 mb-3">
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{seller.location}</span>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Joined {seller.joined}</span>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{seller.productCount} products</span>
              </div>
              <button onClick={() => navigate(`/store/${seller.id}`)} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors" style={{ fontWeight: 600 }}>
                Visit Store
              </button>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Customer Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <StarRating size={14} />
                  <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviewCount})</span>
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = product.reviews.filter(r => r.rating === star).length;
                  const pct = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 shrink-0" style={{ width: '12px', textAlign: 'right' }}>{star}</span>
                      <Star className="w-3 h-3 shrink-0" fill="#f5a623" color="#f5a623" strokeWidth={0} />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#f5a623] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0" style={{ width: '20px' }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map(review => (
                    <div key={review.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#009739] flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
                            {review.user.charAt(0)}
                          </div>
                          <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{review.user}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating size={12} />
                          <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{review.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm text-gray-500" style={{ fontWeight: 600 }}>No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to review this product</p>
                </div>
              )}

              {/* ─── User-submitted reviews ─── */}
              {getProductReviews(product.id).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {getProductReviews(product.id).map((review, idx) => (
                    <div key={`user-${idx}`} className="pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#009739] flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
                            {review.user.charAt(0)}
                          </div>
                          <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{review.user}</p>
                          <span className="text-[10px] text-[#009739] bg-green-50 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>Verified Buyer</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-3 h-3" fill={s <= review.rating ? '#f5a623' : 'none'} color={s <= review.rating ? '#f5a623' : '#d1d5db'} strokeWidth={s <= review.rating ? 0 : 1.5} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{review.date}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Write Review Form ─── */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {!user ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                    style={{ fontWeight: 600 }}
                  >
                    Sign in to write a review
                  </button>
                ) : hasUserReviewed(product.id) ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)' }}>
                    <CheckCircle className="w-4 h-4 text-[#009739]" />
                    <p className="text-xs text-[#009739]" style={{ fontWeight: 600 }}>You've reviewed this product</p>
                  </div>
                ) : !showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full py-2.5 rounded-lg bg-[#009739] text-white text-sm hover:bg-[#007f30] transition-colors cursor-pointer border-none"
                    style={{ fontWeight: 700 }}
                  >
                    Write a Review
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Your Review</p>
                    {/* Star rating input */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Rating</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button
                            key={s}
                            onMouseEnter={() => setReviewHoverRating(s)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            onClick={() => setReviewRating(s)}
                            className="p-0.5 bg-transparent border-none cursor-pointer"
                          >
                            <Star
                              className="w-6 h-6 transition-colors"
                              fill={s <= (reviewHoverRating || reviewRating) ? '#f5a623' : 'none'}
                              color={s <= (reviewHoverRating || reviewRating) ? '#f5a623' : '#d1d5db'}
                              strokeWidth={s <= (reviewHoverRating || reviewRating) ? 0 : 1.5}
                            />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="text-xs text-gray-500 ml-2 self-center">
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Review text */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Your experience</p>
                      <textarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience with this product..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                      />
                    </div>
                    {/* Submit */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowReviewForm(false); setReviewRating(0); setReviewText(''); }}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (reviewRating === 0 || !reviewText.trim()) {
                            toast.error('Please add a rating and comment');
                            return;
                          }
                          addReview(product.id, { user: user.name, rating: reviewRating, comment: reviewText });
                          setShowReviewForm(false);
                          setReviewRating(0);
                          setReviewText('');
                          toast.success('Review submitted!', { description: 'Thank you for your feedback.' });
                        }}
                        disabled={reviewRating === 0 || !reviewText.trim()}
                        className="flex-1 py-2 rounded-lg bg-[#009739] text-white text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors disabled:opacity-50"
                        style={{ fontWeight: 700 }}
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Frequently Bought Together ─── */}
        {frequentlyBought.length > 0 && (
          <div className="mb-16 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <SectionHeader overline="Bundle & Save" title="Frequently Bought Together" />
            <div className="flex items-center gap-3 flex-wrap mb-5">
              {/* Current product */}
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#009739] shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {frequentlyBought.map((p, i) => (
                <React.Fragment key={p.id}>
                  <Plus className="w-4 h-4 text-gray-300 shrink-0" />
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:border-[#009739] transition-colors"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </React.Fragment>
              ))}
              <div className="ml-auto text-right">
                <p className="text-gray-500" style={{ fontSize: '0.75rem' }}>Bundle price</p>
                <p className="text-gray-900" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatPrice(bundleTotal)}</p>
                <button
                  onClick={() => {
                    addToCart(product);
                    frequentlyBought.forEach(p => addToCart(p));
                    toast.success('Bundle added!', { description: `${frequentlyBought.length + 1} items added to cart` });
                  }}
                  className="mt-2 px-4 py-2 bg-[#009739] text-white rounded-lg text-xs cursor-pointer hover:bg-[#007f30] transition-colors border-none"
                  style={{ fontWeight: 700 }}
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── More from this seller ─── */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <SectionHeader overline="Same Seller" title={`More from ${seller?.name}`} viewAllTo={seller ? `/store/${seller.id}` : undefined} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Similar Products ─── */}
        {similarProducts.length > 0 && (
          <div className="mb-16">
            <SectionHeader overline="You May Also Like" title="Similar Products" viewAllTo="/shop" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Customers Also Bought ─── */}
        {alsoB.length > 0 && (
          <div className="mb-16">
            <SectionHeader overline="Trending Together" title="Customers Also Bought" viewAllTo="/shop" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {alsoB.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Recently Viewed ─── */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mb-16">
            <SectionHeader overline="Your History" title="Recently Viewed" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Chat with the Msika Team ─── */}
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
            Have a question about this product or need help with your order? We're here — just send us a message.
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

      {/* ─── Sticky Bottom Bar ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 transition-transform duration-300"
        style={{
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
            <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{product.name}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#009739' }}>{formatPrice(product.price)}</p>
            </div>
          </div>
          <p className="sm:hidden flex-1 text-sm truncate" style={{ fontWeight: 800, color: '#009739' }}>{formatPrice(product.price)}</p>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-[#009739] text-white rounded-lg text-sm hover:bg-[#007f30] transition-colors cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ fontWeight: 700 }}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-white rounded-lg text-sm transition-colors cursor-pointer border-none disabled:opacity-50"
            style={{ fontWeight: 700, background: '#111' }}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ─── Quotation Modal ─── */}
      {showQuotationModal && product && (
        <QuotationModal
          product={product}
          seller={seller}
          quantity={quantity}
          user={user}
          onSubmit={(msg) => {
            addQuotation({
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              sellerName: product.sellerName,
              buyerName: user?.name || 'Guest',
              buyerPhone: user?.phone || '',
              message: msg,
              quantity,
            });
            setShowQuotationModal(false);
            toast.success('Quotation request sent!', { description: `${seller?.name} will respond shortly.` });
          }}
          onClose={() => setShowQuotationModal(false)}
        />
      )}

      {/* ─── Pre-order Modal ─── */}
      {showPreOrderModal && product && (
        <PreOrderModal
          product={product}
          quantity={quantity}
          formatPrice={formatPrice}
          onSubmit={() => {
            const depositAmount = Math.ceil(product.price * quantity * 0.3);
            addPreOrder({
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              sellerName: product.sellerName,
              depositAmount,
              totalAmount: product.price * quantity,
              remainingAmount: product.price * quantity - depositAmount,
            });
            setShowPreOrderModal(false);
            toast.success('Pre-order confirmed!', { description: `Deposit of ${formatPrice(depositAmount)} paid. We'll notify you when it's ready.` });
          }}
          onClose={() => setShowPreOrderModal(false)}
        />
      )}
    </div>
  );
};

// ── Quotation Modal Component ─────────────────────────────────────────────────
function QuotationModal({
  product, seller, quantity, user, onSubmit, onClose,
}: {
  product: any;
  seller: any;
  quantity: number;
  user: any;
  onSubmit: (message: string) => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState(`Hi, I'd like a quote for ${quantity}x ${product.name}. Is the price negotiable?`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onSubmit(message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#009739]" />
            </div>
            <p className="text-gray-900" style={{ fontWeight: 700 }}>Request Quotation</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{product.name}</p>
              <p className="text-xs text-gray-500">{product.sellerName} · Qty: {quantity}</p>
            </div>
          </div>
          <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Your message to seller</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="w-full mt-3 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            style={{ fontWeight: 700 }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Quotation Request'}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            The seller will respond with a custom price via Msika notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Pre-order Modal Component ─────────────────────────────────────────────────
function PreOrderModal({
  product, quantity, formatPrice, onSubmit, onClose,
}: {
  product: any;
  quantity: number;
  formatPrice: (n: number) => string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const total = product.price * quantity;
  const deposit = Math.ceil(total * 0.3);
  const remaining = total - deposit;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center" style={{ background: '#FFD100' }}>
          <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: '#856404' }} />
          <p style={{ fontWeight: 800, fontSize: '1rem', color: '#856404' }}>Pre-order with Deposit</p>
          <p style={{ fontSize: '0.8rem', color: '#856404' }}>Reserve this product with 30% down</p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{product.name}</p>
              <p className="text-xs text-gray-500">{product.sellerName} · Qty: {quantity}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Full price</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Deposit (30%)</span>
              <span style={{ fontWeight: 800, color: '#009739', fontSize: '0.9rem' }}>{formatPrice(deposit)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
              <span className="text-gray-500">Remaining on delivery</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{formatPrice(remaining)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
            <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} />
            <p style={{ fontSize: '0.72rem', color: '#007f30', fontWeight: 600 }}>
              Your deposit is held in EcoCash escrow. Refundable if seller can't fulfill.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              style={{ fontWeight: 700 }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : `Pay ${formatPrice(deposit)} Deposit`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}