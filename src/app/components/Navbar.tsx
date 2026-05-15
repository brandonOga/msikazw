import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Search, ShoppingBag, User, Store, Menu, X, Package,
  Heart, LogOut, ChevronDown, Bell, LayoutDashboard, AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MsikaLogo } from './MsikaLogo';

export const Navbar = () => {
  const { user, cart, logout, cartItemsCount, openCart, currency, toggleCurrency, notifications, unreadCount, markAllRead, onboardingStatus } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileMenu(false);
    setShowNotifs(false);
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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontWeight: isActive(path) ? 700 : 500,
    color: isActive(path) ? '#009739' : '#6b7280',
    borderBottom: isActive(path) ? '2px solid #009739' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'all 0.15s',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">

          {/* Logo — left */}
          <Link to="/" className="flex items-center shrink-0">
            <MsikaLogo size="md" color="dark" />
          </Link>

          {/* Nav Links — center (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-6 absolute left-1/2 -translate-x-1/2">
            {[
              { to: '/', label: 'Home' },
              { to: '/shop', label: 'Browse Products' },
              { to: '/shops', label: 'Shops' },
              { to: '/all-categories', label: 'Categories' },
              ...(user ? [{ to: '/orders', label: 'Orders' }] : []),
              ...(user?.role === 'seller' ? [{ to: '/seller-dashboard', label: 'Dashboard' }] : []),
              ...(user?.role === 'admin' ? [{ to: '/admin-dashboard', label: 'Admin' }] : []),
              ...(user && user.role !== 'seller' && onboardingStatus === 'none' ? [] : []),
            ].map(link => (
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

          {/* Actions — right */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Pending application badge */}
            {user && onboardingStatus === 'pending' && (
              <button
                onClick={() => navigate('/seller-onboarding')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border-none transition-colors"
                style={{ background: 'rgba(255,209,0,0.15)', color: '#856404', fontWeight: 700, border: '1px solid rgba(255,209,0,0.4)' }}
              >
                <AlertCircle className="w-3.5 h-3.5" /> Application pending
              </button>
            )}

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
                    <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white" style={{ fontSize: '13px', fontWeight: 700 }}>
                      {user.name.charAt(0)}
                    </div>
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
                        {[
                          { icon: User, label: 'My Profile', path: '/profile' },
                          { icon: Package, label: 'My Orders', path: '/orders' },
                          { icon: Heart, label: 'Wishlist', path: '/wishlist' },
                          { icon: ShoppingBag, label: `Cart (${cartItemsCount})`, action: openCart },
                          ...(user.role === 'seller' ? [{ icon: LayoutDashboard, label: 'Seller Dashboard', path: '/seller-dashboard' }] : []),
                        ].map(item => (
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
              <Link
                to="/signup"
                className="bg-[#009739] hover:bg-[#007f30] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                Sign Up
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden max-w-lg mx-auto">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 px-2 py-2.5"
              autoFocus
            />
            <button type="submit" className="px-3 py-2 text-[#009739]" style={{ fontSize: '13px', fontWeight: 600 }}>Go</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/shop', label: 'Browse Products' },
            { to: '/shops', label: 'Shops' },
            { to: '/all-categories', label: 'Categories' },
            ...(user ? [{ to: '/orders', label: 'My Orders' }, { to: '/profile', label: 'My Profile' }] : []),
            ...(user?.role === 'seller' ? [{ to: '/seller-dashboard', label: '📊 Dashboard' }] : []),
          ].map(link => (
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