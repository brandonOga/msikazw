import React from 'react';
import { useNavigate } from 'react-router';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { products } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart, formatPrice } = useStore();
  const navigate = useNavigate();

  const wishlistProducts = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>Your wishlist is empty</h2>
        <p className="text-sm text-gray-500 mb-5 max-w-xs text-center">
          Save items you love by tapping the heart icon on any product.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
          style={{ fontWeight: 600 }}
        >
          <ShoppingBag className="w-4 h-4" /> Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900" style={{ fontWeight: 900, fontSize: '1.6rem' }}>My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-1">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 600 }}
          >
            Continue Shopping
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Quick add all to cart */}
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 flex items-center justify-between" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div>
            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Add all to cart</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Total: {formatPrice(wishlistProducts.reduce((s, p) => s + p.price, 0))} · {wishlistProducts.length} items
            </p>
          </div>
          <button
            onClick={() => {
              wishlistProducts.forEach(p => addToCart(p, 1));
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 700 }}
          >
            <ShoppingBag className="w-4 h-4" /> Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
};