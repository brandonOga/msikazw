import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Search, ShoppingBag, User, Store, Menu, X, Package,
  Heart, LogOut, ChevronDown, Bell, LayoutDashboard, AlertCircle, TrendingUp,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MsikaLogo } from './MsikaLogo';
import { useProducts, useTrendingCategories } from '../../lib/hooks/useProducts';

export const Navbar = () => {
  const { user, logout, cartItemsCount, openCart, currency, toggleCurrency, formatPrice, notifications, unreadCount, markAllRead } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileMenu(false);
    setShowNotifs(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Close notifs on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when search opens; close on Escape
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowSearch(false);
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [showSearch]);

  // Debounce the query before hitting the product suggestions lookup
  useEffect(() => {
    if (!showSearch) { setDebouncedQuery(''); return; }
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery, showSearch]);

  const showSuggestions = debouncedQuery.length >= 2;
  const { products: suggestions, loading: suggestionsLoading } = useProducts({
    search: debouncedQuery,
    limit: 5,
    skip: !showSuggestions,
  });
  const { categories: trendingSearches } = useTrendingCategories(6);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontWeight: isActive(path) ? 700 : 500,
    color: isActive(path) ? '#009739' : '#6b7280',
    borderBottom: isActive(path) ? '2px solid #009739' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'all 0.15s',
  });

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Browse Products' },
    { to: '/shops', label: 'Shops' },
    { to: '/all-categories', label: 'Categories' },
    ...(user?.role === 'admin' ? [{ to: '/admin-dashboard', label: 'Admin' }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleTrendingClick = (term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo — left */}
          <Link to="/" className="flex items-center shrink-0">
            <MsikaLogo size="md" color="dark" />
          </Link>

          {/* Nav links — inline, desktop only */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm transition-colors whitespace-nowrap"
                style={navLinkStyle(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* Actions — right */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1.5 px-4 pr-[50px] py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full bg-gray-50 border border-gray-200 hover:border-gray-300"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline text-sm" style={{ fontWeight: 500 }}>Search</span>
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={`Shopping cart, ${cartItemsCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span
                  className="absolute top-0 right-0 bg-[#CE1126] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                  style={{ fontSize: '10px', fontWeight: 700, padding: '0 4px' }}
                >
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Currency toggle */}
            <button
              onClick={toggleCurrency}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#009739] hover:text-[#009739] transition-colors text-gray-600 bg-white"
              style={{ fontSize: '0.72rem', fontWeight: 700 }}
              aria-label={`Switch to ${currency === 'USD' ? 'ZiG' : 'USD'}`}
            >
              {currency}
              <ChevronDown className="w-3 h-3" />
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifsRef}>
                  <button
                    onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-0 right-0 bg-[#CE1126] text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center"
                        style={{ fontSize: '9px', fontWeight: 700, padding: '0 3px' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Notifications</p>
                          <button onClick={markAllRead} className="text-xs text-[#009739] bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 600 }}>
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                          ) : notifications.map(n => (
                            <div
                              key={n.id}
                              className="px-4 py-3 border-b border-gray-50 last:border-0"
                              style={{ background: n.read ? '#fff' : 'rgba(0,151,57,0.04)' }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? '#d1d5db' : '#009739' }} />
                                <div>
                                  <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{n.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                  <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-expanded={showProfileMenu}
                    aria-label="User menu"
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontSize: '13px', fontWeight: 700 }}>
                          {user.name.charAt(0)}
                        </div>
                    }
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 w-56 mt-2 py-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                        <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        {(user.role === 'seller' ? [
                          { icon: LayoutDashboard, label: 'Seller Dashboard', path: '/seller-dashboard' },
                          { icon: Store, label: 'My Store', path: `/store/${(user as any).sellerDbId || ''}` },
                        ] : user.role === 'admin' ? [
                          { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin-dashboard' },
                        ] : [
                          { icon: User, label: 'My Profile', path: '/dashboard?tab=profile' },
                          { icon: Package, label: 'My Orders', path: '/dashboard?tab=orders' },
                          { icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, path: '/dashboard?tab=notifications' },
                          { icon: Heart, label: 'Wishlist', path: '/wishlist' },
                          { icon: ShoppingBag, label: `Cart (${cartItemsCount})`, action: openCart },
                        ]).map(item => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if ((item as any).path) navigate((item as any).path);
                              else if ((item as any).action) (item as any).action();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                          >
                            <item.icon className="w-4 h-4 text-gray-400" /> {item.label}
                          </button>
                        ))}
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); navigate('/'); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                          >
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors bg-white"
                  style={{ fontWeight: 600 }}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#009739] hover:bg-[#007f30] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search modal — slides down over the header, full width, with trending searches */}
      {showSearch && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowSearch(false)} />
          <div className="absolute inset-x-0 top-0 z-50 bg-white shadow-xl border-b border-gray-100 animate-in slide-in-from-top fade-in-0 duration-300">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden focus-within:border-[#009739] transition-colors px-1.5 py-0.5">
                  <Search className="w-4 h-4 text-gray-400 ml-2.5 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands, categories…"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 px-2.5 py-3 placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button type="submit" className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white text-xs transition-colors shrink-0 rounded-full border-none cursor-pointer" style={{ fontWeight: 700 }}>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2.5 text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {showSuggestions ? (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2.5" style={{ fontWeight: 600 }}>
                    {suggestionsLoading ? 'Searching…' : suggestions.length > 0 ? 'Products' : `No products found for "${debouncedQuery}"`}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {suggestions.slice(0, 5).map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product.id)}
                          className="flex flex-col items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left cursor-pointer bg-transparent border-none"
                        >
                          <img src={product.image} alt={product.name} className="w-full aspect-square rounded-lg object-cover bg-gray-100" />
                          <div className="min-w-0 w-full">
                            <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{product.name}</p>
                            <p className="text-xs text-gray-400 truncate">{product.category}</p>
                            <p className="text-sm text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{formatPrice(product.price)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : trendingSearches.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5" style={{ fontWeight: 600 }}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trending searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleTrendingClick(term)}
                        className="px-3 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer"
                        style={{ fontWeight: 500 }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              style={{ fontWeight: isActive(link.to) ? 700 : 500, color: isActive(link.to) ? '#009739' : '#374151' }}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 mt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/signup"
                onClick={() => setShowMobileMenu(false)}
                className="block w-full text-center px-3 py-2.5 rounded-lg text-sm bg-[#009739] text-white transition-colors"
                style={{ fontWeight: 700 }}
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block w-full text-center px-3 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors"
                style={{ fontWeight: 600 }}
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
