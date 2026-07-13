import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Package, Bell, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Orders } from './Orders';
import { NotificationsPage } from './NotificationsPage';
import { Profile } from './Profile';

type Tab = 'orders' | 'notifications' | 'profile';

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'orders',        icon: Package, label: 'My Orders' },
  { id: 'notifications', icon: Bell,    label: 'Notifications' },
  { id: 'profile',       icon: User,    label: 'Profile' },
];

export function BuyerDashboard() {
  const { unreadCount } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = TABS.some(t => t.id === searchParams.get('tab'))
    ? (searchParams.get('tab') as Tab)
    : 'orders';
  const [tab, setTab] = useState<Tab>(initialTab);

  const selectTab = (id: Tab) => {
    setTab(id);
    setSearchParams(id === 'orders' ? {} : { tab: id }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map(t => {
            const active = tab === t.id;
            const badge = t.id === 'notifications' && unreadCount > 0 ? unreadCount : undefined;
            return (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className="flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap cursor-pointer bg-transparent border-none"
                style={{
                  color: active ? '#009739' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                  borderBottom: active ? '2px solid #009739' : '2px solid transparent',
                }}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {badge != null && (
                  <span className="px-1.5 py-0 rounded-full text-white min-w-[18px] text-center"
                    style={{ background: '#CE1126', fontSize: '0.65rem', fontWeight: 700 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'orders' && <Orders />}
      {tab === 'notifications' && <NotificationsPage />}
      {tab === 'profile' && <Profile />}
    </div>
  );
}
