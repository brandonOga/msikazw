import React, { useRef, useState } from 'react';
import { Heart, ShoppingBasket, Star } from 'lucide-react';
import { Product, sellers, getSmartBadge, isProductNew } from '../data/mockData';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}


export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, formatPrice } = useStore();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);
  const smartBadge = getSmartBadge(product);
  const sellerVerified = sellers.find(s => s.id === product.sellerId)?.verified;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const productIsNew = isProductNew(product);
  const badgeLabel = productIsNew ? 'New' : smartBadge?.label ?? null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const goTo = (idx: number) => setActiveIdx((idx + allImages.length) % allImages.length);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 5) {
      isDragging.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(activeIdx + (delta < 0 ? 1 : -1));
    } else if (!isDragging.current) {
      navigate(`/product/${product.id}`);
    }
    dragStartX.current = null;
    isDragging.current = false;
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Image area */}
      <div
        className="relative bg-gray-100 overflow-hidden select-none"
        style={{ paddingBottom: '75%', cursor: 'pointer' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Slides */}
        <div
          className="absolute top-0 left-0 bottom-0 flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIdx * 100 / allImages.length}%)`, width: `${allImages.length * 100}%` }}
        >
          {allImages.map((src, i) => (
            <div key={i} className="relative flex-shrink-0" style={{ width: `${100 / allImages.length}%` }}>
              <img
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="absolute inset-0 w-full h-full object-contain p-4"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Badge top-left */}
        {badgeLabel && (
          <span className="absolute top-3 left-3 bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10">
            {badgeLabel}
          </span>
        )}

        {/* Wishlist top-right */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={handleToggleWish}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90 hover:shadow-md z-10"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className="w-4 h-4"
            fill={wishlisted ? '#CE1126' : 'none'}
            stroke={wishlisted ? '#CE1126' : '#374151'}
            strokeWidth={2}
          />
        </button>

        {/* Carousel dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); goTo(i); }}
                className="transition-all duration-200"
                style={{
                  width: i === activeIdx ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  background: i === activeIdx ? '#111827' : '#D1D5DB',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        {/* Name */}
        <h3
          className="font-bold text-gray-900 text-base leading-tight line-clamp-1 cursor-pointer hover:text-[#009739] transition-colors"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>

        {/* Category · rating */}
        <div className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
          <span>{product.category}</span>
          {product.reviewCount > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span className="text-gray-700 font-medium">{product.rating}</span>
              </span>
              <span className="text-gray-400 text-xs">{product.reviewCount.toLocaleString()} reviews</span>
            </>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-gray-900 font-bold text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-400 line-through text-sm">{formatPrice(product.originalPrice)}</span>
              <span className="text-[#009739] font-semibold text-sm">{discount}% off</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        {showQuickAdd && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 mt-1">
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex-1 py-2 px-3 rounded-full border border-gray-200 text-gray-800 text-xs font-medium hover:border-gray-400 transition-colors whitespace-nowrap"
            >
              View Details
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-[#009739] transition-colors whitespace-nowrap"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBasket className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
