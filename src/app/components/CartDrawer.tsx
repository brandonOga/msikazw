import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShieldCheck, Lock, ArrowRight, ShoppingBag, Truck, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router';
import { products, getDeliveryEstimate, getCustomersAlsoBought } from '../data/mockData';

export function CartDrawer() {
  const {
    isCartOpen, closeCart,
    cart, updateQuantity, removeFromCart, addToCart,
    cartTotal, cartItemsCount,
    user, formatPrice, currency,
  } = useStore();
  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  const platformFee = cartTotal * 0.02;
  const total = cartTotal + platformFee;

  // Get recommendations based on first cart item
  const firstCartProduct = cart[0]?.product;
  const recommendations = firstCartProduct
    ? getCustomersAlsoBought(firstCartProduct.id, 4).filter(p => !cart.some(c => c.product.id === p.id))
    : products.filter(p => !cart.some(c => c.product.id === p.id)).slice(0, 4);

  const handleCheckout = () => {
    if (!user) {
      closeCart();
      navigate('/login?redirect=checkout');
    } else {
      closeCart();
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.45)',
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'auto' : 'none',
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white"
        style={{
          width: '420px',
          maxWidth: '100vw',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
            <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>
              Your Cart
            </span>
            {cartItemsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#009739] text-white" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {cartItemsCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escrow trust bar */}
        <div className="flex items-center gap-2 px-5 py-2.5" style={{ background: 'rgba(0,151,57,0.06)', borderBottom: '1px solid rgba(0,151,57,0.1)' }}>
          <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} />
          <p style={{ fontSize: '0.72rem', color: '#007f30', fontWeight: 600 }}>
            EcoCash Escrow Protected — funds held until delivery confirmed
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: '1rem' }}>Your cart is empty</p>
                <p className="text-gray-400" style={{ fontSize: '0.85rem' }}>Browse products and add items to get started</p>
              </div>
              <button
                onClick={() => { closeCart(); navigate('/shop'); }}
                className="px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl transition-colors"
                style={{ fontSize: '0.875rem', fontWeight: 700 }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map(({ product, quantity }) => {
                const deliveryEst = getDeliveryEstimate(product.deliveryBadge);
                return (
                  <div key={product.id} className="flex gap-3">
                    {/* Thumb */}
                    <div
                      className="shrink-0 rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                      style={{ width: 72, height: 72 }}
                      onClick={() => { closeCart(); navigate(`/product/${product.id}`); }}
                    >
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-gray-900 leading-snug line-clamp-1 cursor-pointer hover:text-[#009739] transition-colors"
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                        onClick={() => { closeCart(); navigate(`/product/${product.id}`); }}
                      >
                        {product.name}
                      </p>
                      <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.72rem' }}>{product.sellerName}</p>

                      {/* Trust + delivery badges */}
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {product.paymentMethods.includes('EcoCash') && (
                          <span className="px-1.5 py-0.5 rounded bg-green-50 text-[#009739]" style={{ fontSize: '0.62rem', fontWeight: 600 }}>
                            Escrow
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-50 text-gray-500" style={{ fontSize: '0.62rem', fontWeight: 600 }}>
                          <Truck className="w-2.5 h-2.5" /> {deliveryEst}
                        </span>
                      </div>

                      {/* Price + qty */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#009739]" style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-7 text-center text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center ml-1 transition-colors"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ─── You might also like ─── */}
              {recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-900 mb-3" style={{ fontSize: '0.78rem', fontWeight: 700 }}>You might also like</p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {recommendations.slice(0, 4).map(product => (
                      <div
                        key={product.id}
                        className="shrink-0 cursor-pointer group"
                        style={{ width: '100px' }}
                      >
                        <div className="w-full rounded-lg overflow-hidden bg-gray-100 mb-1.5 relative" style={{ aspectRatio: '1' }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onClick={() => { closeCart(); navigate(`/product/${product.id}`); }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#009739] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p
                          className="text-gray-700 line-clamp-1"
                          style={{ fontSize: '0.7rem', fontWeight: 600 }}
                          onClick={() => { closeCart(); navigate(`/product/${product.id}`); }}
                        >
                          {product.name}
                        </p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#009739' }}>{formatPrice(product.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only visible when cart has items */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5">
            {/* Order summary */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500" style={{ fontSize: '0.82rem' }}>Subtotal</span>
                <span className="text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400" style={{ fontSize: '0.78rem' }}>Buyer Protection Fee (2%)</span>
                <span className="text-gray-400" style={{ fontSize: '0.78rem' }}>{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                <span className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total</span>
                <span className="text-[#009739]" style={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* THE AUTH GATE — only here, at the very last second */}
            {!user ? (
              <div>
                <div className="rounded-xl p-3.5 mb-3" style={{ background: 'rgba(255,209,0,0.1)', border: '1px solid rgba(255,209,0,0.3)' }}>
                  <p className="text-gray-800 mb-1" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Almost there!</p>
                  <p className="text-gray-500" style={{ fontSize: '0.75rem' }}>
                    Create a free account to confirm payment securely via EcoCash escrow.
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
                  style={{ fontWeight: 700, fontSize: '0.9rem' }}
                >
                  <Lock className="w-4 h-4" />
                  Sign in to Confirm Payment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
                style={{ fontWeight: 700, fontSize: '0.9rem' }}
              >
                <Lock className="w-4 h-4" />
                Confirm Payment — EcoCash
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Verified trust line */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#009739]" />
              <span className="text-gray-400" style={{ fontSize: '0.68rem' }}>
                Funds held in escrow until delivery confirmed by DHL / InDrive
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}