import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, LogOut, LayoutDashboard, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MsikaLogo } from './MsikaLogo';

export const HEADER_H = 56; // px

interface DashboardHeaderProps {
  role: 'seller' | 'admin';
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = () => {
    logout();
    navigate(role === 'admin' ? '/admin/login' : '/login', { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-white"
      style={{ height: HEADER_H, borderBottom: '1px solid #e5e7eb' }}
    >
      {/* Logo */}
      <MsikaLogo size="md" />

      {/* Right — name + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
        >
          <span className="text-sm text-gray-800 hidden sm:block" style={{ fontWeight: 500 }}>
            {user?.name || (role === 'admin' ? 'Admin' : 'Seller')}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#009739' }}
          >
            <span className="text-white text-xs" style={{ fontWeight: 700 }}>{initials}</span>
          </div>
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 z-50"
            style={{ border: '1px solid #e5e7eb', top: '100%' }}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
                  onClick={() => { navigate('/shop'); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
                >
                  <Store className="w-4 h-4 text-gray-400" /> Visit Store
                </button>
              </>
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
    </header>
  );
}
