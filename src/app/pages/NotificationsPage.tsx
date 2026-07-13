import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markNotificationRead } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'system' | 'promo' | 'quotation'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const typeBadge = (type: string) => {
    switch (type) {
      case 'order':     return { bg: 'rgba(0,151,57,0.1)',  color: '#009739', label: 'Order' };
      case 'system':    return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'System' };
      case 'promo':     return { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Promo' };
      case 'quotation': return { bg: 'rgba(147,51,234,0.1)', color: '#9333ea', label: 'Quotation' };
      default:          return { bg: '#f3f4f6', color: '#6b7280', label: type };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notifications</h1>
          <button
            onClick={markAllRead}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-gray-600 hover:bg-gray-100 cursor-pointer bg-white transition-colors"
            style={{ fontWeight: 600 }}
          >
            Mark all read
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { id: 'all',    label: 'All' },
            { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { id: 'order',     label: 'Orders' },
            { id: 'quotation', label: 'Quotations' },
            { id: 'system',    label: 'System' },
            { id: 'promo',     label: 'Promos' },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border-none"
              style={{
                background: filter === f.id ? '#009739' : '#fff',
                color: filter === f.id ? '#fff' : '#6b7280',
                fontWeight: filter === f.id ? 700 : 500,
                border: filter === f.id ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '1rem' }}>No notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'unread' ? "You're all caught up." : "Nothing here yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {filtered.map((n, idx) => {
              const badge = typeBadge(n.type);
              return (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                  className="w-full flex items-start gap-4 px-5 py-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                  style={{
                    background: n.read ? '#fff' : 'rgba(0,151,57,0.03)',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: n.read ? '#d1d5db' : '#009739', marginTop: 6 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm text-gray-900 truncate" style={{ fontWeight: n.read ? 500 : 700 }}>
                        {n.title}
                      </p>
                      <span
                        className="px-2 py-0.5 rounded-full shrink-0"
                        style={{ fontSize: '0.65rem', fontWeight: 700, background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
