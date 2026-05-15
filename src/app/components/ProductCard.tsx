import React from 'react';
import { Heart, ShieldCheck, Zap, ShoppingCart, Truck, TrendingUp, Flame, Clock } from 'lucide-react';
import { Product, sellers, getSmartBadge, getDeliveryEstimate, getDealEndTime, getBoughtTodayCount } from '../data/mockData';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

const DISPLAY_FONT: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
};

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, formatPrice } = useStore();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);
  const sellerVerified = sellers.find(s => s.id === product.sellerId)?.verified;
  const smartBadge = getSmartBadge(product);
  const deliveryEst = getDeliveryEstimate(product.deliveryBadge);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const dealEndTime = product.isDeal ? getDealEndTime(product.id) : null;
  const boughtToday = getBoughtTodayCount(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article
      className="w-full aspect-[4/3] sm:aspect-[3/4]"
      style={{ position: 'relative' }}
      aria-label={`${product.name} — ${formatPrice(product.price)}`}
    >
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl text-left group cursor-pointer"
      >
        {/* Product image */}
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.02) 80%)' }}
        />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ background: 'rgba(0,151,57,0.85)', backdropFilter: 'blur(8px)', fontSize: '0.65rem', fontWeight: 700 }}
            >
              New
            </span>
          )}
          {smartBadge && !product.isNew && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
              style={{ background: smartBadge.color === '#CE1126' ? 'rgba(206,17,38,0.88)' : 'rgba(0,151,57,0.85)', backdropFilter: 'blur(8px)', fontSize: '0.65rem', fontWeight: 700 }}
            >
              {smartBadge.label.includes('Best') && <TrendingUp className="w-2.5 h-2.5" />}
              {smartBadge.label.includes('Hot') && <Flame className="w-2.5 h-2.5" />}
              {smartBadge.label}
            </span>
          )}
          {discount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ background: 'rgba(206,17,38,0.88)', backdropFilter: 'blur(8px)', fontSize: '0.65rem', fontWeight: 700 }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Top-right: wishlist */}
        <button
          onClick={handleToggleWish}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-transform active:scale-90"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <Heart className="w-4 h-4" fill="none" color={wishlisted ? '#CE1126' : 'rgba(255,255,255,0.8)'} strokeWidth={2} />
        </button>

        {/* Bottom content — pinned */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex flex-col items-start z-10">
          {/* Seller + delivery row */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1">
              <span className="text-white/50 truncate" style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', maxWidth: '50%' }}>
                {product.sellerName}
              </span>
              {sellerVerified && <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: '#009739' }} />}
              {product.isDeal && <Zap className="w-3 h-3 shrink-0" style={{ color: '#CE1126' }} />}
            </div>
            <span className="inline-flex items-center gap-1 text-white/60 shrink-0" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
              <Truck className="w-2.5 h-2.5" /> {deliveryEst}
            </span>
          </div>

          {/* Product name — single line clamp for consistency */}
          <h3
            className="text-white line-clamp-1 mb-2 w-full"
            style={{ ...DISPLAY_FONT, fontSize: 'clamp(1rem, 2vw, 1.3rem)', fontWeight: 900, lineHeight: 1.05 }}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFD100' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-white/40 line-through" style={{ fontSize: '0.72rem' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Deal countdown + sold count */}
          <div className="flex items-center gap-2 mb-2 w-full">
            {dealEndTime && (
              <span className="inline-flex items-center gap-1 text-white/70" style={{ fontSize: '0.6rem', fontWeight: 700 }}>
                <Clock className="w-2.5 h-2.5" style={{ color: '#CE1126' }} />
                {dealEndTime.hours}h {dealEndTime.minutes}m left
              </span>
            )}
            <span className="text-white/40" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
              {boughtToday}+ sold today
            </span>
          </div>

          {/* Rating + Add to cart row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <StarRating size={11} />
              <span className="text-white/80" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{product.rating}</span>
              <span className="text-white/40" style={{ fontSize: '0.68rem' }}>({product.reviewCount})</span>
            </div>
            {showQuickAdd && (
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1 text-white transition-all duration-300 hover:bg-[#009739] hover:border-[#009739]"
                aria-label={`Add ${product.name} to cart`}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(20,20,20,0.75)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                }}
              >
                <ShoppingCart className="w-3 h-3" /> Add
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}