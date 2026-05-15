import React from 'react';
import { Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { MsikaLogo } from './MsikaLogo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <MsikaLogo size="md" color="dark" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Empowering Zimbabwe's youth entrepreneurs to sell online — powered by mobile money & local delivery.
            </p>
            <div className="flex gap-2">
              <div className="w-8 h-4 bg-green-600 rounded"></div>
              <div className="w-8 h-4 bg-yellow-400 rounded"></div>
              <div className="w-8 h-4 bg-red-600 rounded"></div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4" style={{ fontWeight: 600 }}>Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/categories?cat=Electronics" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Electronics</Link></li>
              <li><Link to="/categories?cat=Thrift+Clothes" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Thrift Clothes</Link></li>
              <li><Link to="/categories?cat=Cosmetics+%26+Beauty" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Cosmetics & Beauty</Link></li>
              <li><Link to="/categories?cat=Food+%26+Snacks" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Food & Snacks</Link></li>
              <li><Link to="/all-categories" className="text-[#009739] text-sm transition-colors" style={{ fontWeight: 500 }}>All Categories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4" style={{ fontWeight: 600 }}>Support</h3>
            <ul className="space-y-3">
              <li><Link to="/orders" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">My Account</Link></li>
              <li><Link to="/cart" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Shopping Cart</Link></li>
              <li><Link to="/trust-center" className="text-gray-500 hover:text-[#009739] text-sm transition-colors">Trust & Safety</Link></li>
              <li><Link to="/seller-onboarding" className="text-[#009739] text-sm transition-colors" style={{ fontWeight: 500 }}>Become a Seller</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4" style={{ fontWeight: 600 }}>Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full" style={{ fontWeight: 500 }}>EcoCash</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full" style={{ fontWeight: 500 }}>Innbucks</span>
              <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full" style={{ fontWeight: 500 }}>OneMoney</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full" style={{ fontWeight: 500 }}>Cash on Delivery</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full" style={{ fontWeight: 500 }}>Bank Transfer</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            &copy; 2026 Msika Zimbabwe. Built for young hustlers.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/trust-center" className="hover:text-[#009739] transition-colors">Trust & Safety</Link>
            <span>&middot;</span>
            <span>Made in Zimbabwe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};