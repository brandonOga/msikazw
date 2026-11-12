import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, LogOut, LayoutDashboard, Store, Bell, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MsikaLogo } from './MsikaLogo';
import { getNotificationDestination } from '../../lib/notificationDestination';

export const HEADER_H = 56; // px

interface DashboardHeaderProps {
  role: 'seller' | 'admin' | 'buyer';
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { user, logout, notifications, unreadCount, markAllRead, markNotificationRead, sellerDbId } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = () => {
    logout();
    localStorage.removeItem('msika_user');
    localStorage.removeItem('sellerDbId');
    navigate(role === 'admin' ? '/admin/login' : '/login', { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-white"
      style={{ height: HEADER_H, borderBottom: '1px solid #e5e7eb' }}
    >
      {/* Logo */}
      <MsikaLogo size="md" />

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-2">

      {/* Notification bell */}
      <div className="relative" ref={notifsRef}>
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
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
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      setShowNotifs(false);
                      const { path, params } = getNotificationDestination(n, role);
                      navigate(params ? `${path}?${new URLSearchParams(params)}` : path);
                    }}
                    className="w-full flex items-start gap-2 px-4 py-3 border-0 border-b border-gray-50 last:border-b-0 text-left cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                    style={{ background: n.read ? '#fff' : 'rgba(0,151,57,0.04)' }}
                  >
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? '#d1d5db' : '#009739' }} />
                    <div>
                      <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
        >
          <span className="text-sm text-gray-800 hidden sm:block" style={{ fontWeight: 500 }}>
            {user?.name || (role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Buyer')}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            : <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#009739' }}>
                <span className="text-white text-xs" style={{ fontWeight: 700 }}>{initials}</span>
              </div>
          }
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 z-50"
            style={{ border: '1px solid #e5e7eb', top: '100%' }}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                : <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#009739' }}>
                    <span className="text-white text-xs" style={{ fontWeight: 700 }}>{initials}</span>
                  </div>
              }
              <div className="min-w-0">
                <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Role-specific links */}
            {role === 'admin' && (
              <button
                onClick={() => { navigate('/admin-dashboard'); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
              </button>
            )}
            {role === 'seller' && (
              <>
                <button
                  onClick={() => { navigate('/seller-dashboard'); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                </button>
                <button
                  onClick={() => { navigate(sellerDbId ? `/store/${sellerDbId}` : '/shop'); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
                >
                  <Store className="w-4 h-4 text-gray-400" /> Visit Store
                </button>
              </>
            )}
            {role === 'buyer' && (
              <button
                onClick={() => { navigate('/shop'); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <ShoppingBag className="w-4 h-4 text-gray-400" /> Continue Shopping
              </button>
            )}

            <div className="border-t border-gray-50 mt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        )}
      </div>

      </div>{/* end right flex */}
    </header>
  );
}
