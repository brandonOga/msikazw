import React, { useState, useRef, useEffect } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link, useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import {
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart, Shield,
  Truck, Clock, Star, Eye, Users, Flame, ChevronRight,
  User, Package, Tag, Bell, MessageCircle, ChevronLeft,
} from 'lucide-react';
import {
  products, getTrendingProducts, getCustomersAlsoBought,
  getSimilarProducts, getRecentPurchaseCount, getStockLeft,
} from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { toast } from 'sonner';

// ── Horizontal scroll carousel ────────────────────────────────────────────────
function ProductCarousel({
  title, overline, items, viewAllPath,
}: {
  title: string;
  overline: string;
  items: typeof products;
  viewAllPath?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.offsetWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[#009739] mb-0.5" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{overline}</p>
          <h2 className="text-gray-900" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAllPath && (
            <button
              onClick={() => navigate(viewAllPath)}
              className="flex items-center gap-1 text-[#009739] hover:text-[#007f30] transition-colors bg-transparent border-none cursor-pointer"
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="hidden sm:flex gap-1">
            <button onClick={() => scroll('left')} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 border-none flex items-center justify-center cursor-pointer transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 border-none flex items-center justify-center cursor-pointer transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {items.map(product => (
          <div key={product.id} className="snap-start shrink-0" style={{ width: 'clamp(160px, 42vw, 200px)' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Cart Page ────────────────────────────────────────────────────────────
export const CartPage = () => {
  const {
    cart, updateQuantity, removeFromCart, addToCart,
    cartTotal, cartItemsCount, formatPrice, user,
    toggleWishlist, isWishlisted, recentlyViewed,
  } = useStore();
  const navigate = useNavigate();
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Sticky checkout bar
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 300 && cart.length > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cart.length]);

  // Recommendation data
  const trending = getTrendingProducts();
  const firstProduct = cart[0]?.product;
  const alsoBought = firstProduct ? getCustomersAlsoBought(firstProduct.id, 8) : products.slice(4, 12);
  const similar = firstProduct ? getSimilarProducts(firstProduct.id, 8) : [];
  const popularInZW = products.filter(p => p.reviewCount > 60).slice(0, 8);

  // Recently viewed
  const recentlyViewedProducts = recentlyViewed
    .map(pid => products.find(p => p.id === pid))
    .filter(Boolean)
    .filter(p => !cart.some(c => c.product.id === p!.id)) as typeof products;

  const platformFee = cartTotal * 0.02;
  const total = cartTotal + platformFee;

  // ── EMPTY CART STATE ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="w-full bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Empty state hero */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-10 md:p-16 text-center mb-10" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 text-[#009739]" />
            </div>
            <h1 className="text-2xl text-gray-900 mb-3" style={{ fontWeight: 900 }}>Your cart is empty</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
              Discover products from trusted Zimbabwean sellers and start shopping.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl transition-colors no-underline"
                style={{ fontWeight: 700, fontSize: '0.9rem' }}
              >
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
              <Link
                to="/all-categories"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors no-underline bg-white"
                style={{ fontWeight: 600, fontSize: '0.9rem' }}
              >
                <Tag className="w-4 h-4" /> Browse Categories
              </Link>
            </div>

            {/* Sign-in prompt (non-blocking) */}
            {!user && (
              <div className="flex items-center justify-center gap-2 mt-4 py-3 px-5 rounded-xl mx-auto w-fit" style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid #EAEAEA' }}>
                <User className="w-4 h-4 text-[#009739] shrink-0" />
                <p className="text-sm text-gray-600">
                  <button onClick={() => navigate('/login')} className="text-[#009739] bg-transparent border-none cursor-pointer p-0 underline" style={{ fontWeight: 700 }}>
                    Sign in
                  </button>
                  {' '}to save your cart and track your orders.
                </p>
              </div>
            )}
          </div>

          {/* Recommendation sections for empty cart */}
          <ProductCarousel title="Trending on Msika" overline="Popular Now" items={trending} viewAllPath="/shop" />
          <ProductCarousel title="Popular in Zimbabwe" overline="Best Sellers" items={popularInZW} viewAllPath="/shop" />

          {recentlyViewedProducts.length > 0 && (
            <ProductCarousel title="Recently Viewed" overline="Pick Up Where You Left Off" items={recentlyViewedProducts} />
          )}

          {/* Newsletter */}
          <NewsletterSection />
        </div>
      </div>
    );
  }

  // ── FILLED CART STATE ───────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white min-h-screen pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Breadcrumbs className="mb-6" crumbs={[{ label: 'Cart' }]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">{cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Link to="/shop" className="flex items-center gap-1.5 text-[#009739] hover:text-[#007f30] transition-colors no-underline" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Cart items ── */}
          <div className="flex-1 space-y-3">
            {cart.map((item) => {
              const stockLeft = getStockLeft(item.product.id);
              const recentPurchases = getRecentPurchaseCount(item.product.id);
              const wishlisted = isWishlisted(item.product.id);

              return (
                <div key={item.product.id} className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      {/* Image */}
                      <button
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        className="shrink-0 p-0 border-none bg-transparent cursor-pointer"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover"
                          loading="lazy"
                        />
                      </button>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#009739] uppercase mb-0.5" style={{ fontWeight: 600, letterSpacing: '0.06em' }}>{item.product.category}</p>
                        <h3 className="text-sm sm:text-base text-gray-900 mb-0.5" style={{ fontWeight: 700 }}>
                          <button
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="bg-transparent border-none cursor-pointer p-0 text-left text-gray-900 hover:text-[#009739] transition-colors"
                            style={{ fontWeight: 700 }}
                          >
                            {item.product.name}
                          </button>
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{item.product.sellerName}</p>

                        {/* Social proof badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {stockLeft <= 6 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                              style={{ background: 'rgba(206,17,38,0.08)', color: '#CE1126', fontWeight: 700 }}>
                              <Flame className="w-2.5 h-2.5" /> Only {stockLeft} left
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                            style={{ background: 'rgba(0,151,57,0.06)', color: '#009739', fontWeight: 600 }}>
                            <Users className="w-2.5 h-2.5" /> {recentPurchases}+ bought this week
                          </span>
                        </div>

                        {/* Delivery info */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <Truck className="w-3 h-3 text-[#009739]" />
                          <span style={{ fontWeight: 500 }}>{item.product.deliveryBadge}</span>
                        </div>

                        {/* Price + quantity row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="w-10 text-center text-sm" style={{ fontWeight: 700 }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer"
                              aria-label="Increase"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>

                          {/* Price */}
                          <div>
                            <span className="text-lg text-gray-900" style={{ fontWeight: 900 }}>
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({formatPrice(item.product.price)} each)
                              </span>
                            )}
                          </div>

                          <div className="flex-1" />

                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                toggleWishlist(item.product.id);
                                toast(wishlisted ? 'Removed from wishlist' : 'Saved for later');
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                              aria-label="Save for later"
                            >
                              <Heart className="w-4 h-4" fill="none" color={wishlisted ? '#CE1126' : '#9ca3af'} />
                            </button>
                            <button
                              onClick={() => { removeFromCart(item.product.id); toast('Item removed'); }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary (desktop sidebar) ── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sticky top-20" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base text-gray-900 mb-5" style={{ fontWeight: 700 }}>Order Summary</h2>

              {/* Items preview */}
              <div className="space-y-2.5 mb-4">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-2.5">
                    <img src={product.image} alt="" className="w-9 h-9 rounded-md object-cover shrink-0" />
                    <p className="text-xs text-gray-700 truncate flex-1" style={{ fontWeight: 500 }}>{product.name} x{quantity}</p>
                    <span className="text-xs text-gray-900 shrink-0" style={{ fontWeight: 700 }}>{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cartItemsCount} items)</span>
                  <span className="text-gray-900" style={{ fontWeight: 600 }}>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform fee (2%)</span>
                  <span className="text-gray-500">{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-[#009739]" style={{ fontWeight: 600 }}>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-base text-gray-900" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-xl text-gray-900" style={{ fontWeight: 900 }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust signal */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4" style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid #EAEAEA' }}>
                <Shield className="w-4 h-4 text-[#009739] shrink-0" />
                <div>
                  <p className="text-xs text-gray-900" style={{ fontWeight: 700 }}>Buyer Protection</p>
                  <p className="text-[11px] text-gray-500">EcoCash escrow — funds released on delivery.</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#009739] hover:bg-[#007f30] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm border-none cursor-pointer"
                style={{ fontWeight: 700 }}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              {/* Sign-in hint */}
              {!user && (
                <p className="text-[11px] text-gray-400 text-center mt-3">
                  <button onClick={() => navigate('/login?redirect=checkout')} className="text-[#009739] bg-transparent border-none cursor-pointer p-0 underline" style={{ fontWeight: 600 }}>
                    Sign in
                  </button>
                  {' '}to save cart and track orders.
                </p>
              )}

              {/* Payment methods */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase mb-2" style={{ fontWeight: 600 }}>Accepted payments</p>
                <div className="flex flex-wrap gap-1">
                  {['EcoCash', 'OneMoney', 'Innbucks', 'COD', 'Bank'].map(m => (
                    <span key={m} className="text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommendation Sections ── */}
        <div className="mt-10">
          <ProductCarousel title="Customers Also Bought" overline="Frequently Paired" items={alsoBought} viewAllPath="/shop" />

          {similar.length > 0 && (
            <ProductCarousel title="Similar Products" overline="You Might Also Like" items={similar} viewAllPath="/shop" />
          )}

          <ProductCarousel title="Trending on Msika" overline="Popular Now" items={trending} viewAllPath="/shop" />

          {recentlyViewedProducts.length > 0 && (
            <ProductCarousel title="Recently Viewed" overline="Pick Up Where You Left Off" items={recentlyViewedProducts} />
          )}

          <ProductCarousel title="Popular in Zimbabwe" overline="Best Sellers" items={popularInZW} viewAllPath="/shop" />
        </div>

        {/* Newsletter */}
        <NewsletterSection />
      </div>

      {/* ── Sticky Bottom Checkout Bar (mobile) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden transition-transform duration-300"
        style={{
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">{cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''}</p>
            <p className="text-lg text-gray-900" style={{ fontWeight: 900 }}>{formatPrice(total)}</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 px-6 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 700 }}
          >
            Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Newsletter Section Component ──────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      toast.success('Subscribed!', { description: "You'll get alerts on deals and new products." });
    }
  };

  return (
    <section className="mt-12 mb-4">
      <div className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(0,151,57,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,209,0,0.04)' }} />
        </div>

        <div className="relative z-10">
          <p className="mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFD100' }}>
            Stay Updated
          </p>
          <h2 className="text-white mb-2" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Get Alerts on Deals & New Products
          </h2>
          <p className="text-gray-400 mb-6 mx-auto" style={{ fontSize: '0.85rem', maxWidth: '380px' }}>
            Be the first to know about price drops, new arrivals, and exclusive offers.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-[#009739]">
              <Shield className="w-5 h-5" />
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>You're subscribed! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex overflow-hidden rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3.5 border-none outline-none text-white placeholder-white/40 bg-transparent"
                  style={{ fontSize: '0.88rem' }}
                />
                <button
                  type="submit"
                  className="m-1.5 px-6 bg-[#009739] hover:bg-[#007f30] text-white rounded-lg shrink-0 transition-colors border-none cursor-pointer"
                  style={{ fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Subscribe
                </button>
              </div>

              {/* WhatsApp opt-in */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <MessageCircle className="w-3.5 h-3.5" style={{ color: '#25D366' }} />
                <p className="text-gray-500" style={{ fontSize: '0.72rem' }}>
                  Also get notifications via{' '}
                  <button
                    type="button"
                    onClick={() => toast.success('WhatsApp notifications enabled!')}
                    className="bg-transparent border-none cursor-pointer p-0 underline"
                    style={{ color: '#25D366', fontWeight: 600, fontSize: '0.72rem' }}
                  >
                    WhatsApp
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}