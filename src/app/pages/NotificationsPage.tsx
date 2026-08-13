import React from 'react';
import { Bell, Package, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function NotificationsPage() {
  const { notifications, markNotificationRead } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notifications</h1>
        <p className="text-sm text-gray-400 mt-1.5 mb-6">Updates on your orders and messages.</p>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '1rem' }}>No notifications</p>
            <p className="text-sm text-gray-400 mt-1">Nothing here yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {notifications.map((n, idx) => {
              const isOrder = n.type === 'order';
              const Icon = isOrder ? Package : MessageSquare;
              return (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                  className="w-full flex items-start gap-3.5 px-5 py-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                  style={{
                    background: n.read ? '#fff' : 'rgba(0,151,57,0.03)',
                    borderBottom: idx < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isOrder ? 'rgba(0,151,57,0.1)' : 'rgba(37,99,235,0.1)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isOrder ? '#009739' : '#2563eb' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-snug" style={{ fontWeight: n.read ? 400 : 700 }}>
                      {n.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#009739] shrink-0 mt-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
