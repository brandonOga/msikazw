import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Store, Users, ShoppingBag, AlertTriangle,
  CreditCard, Settings, Search, Shield, Loader2,
  CheckCircle, XCircle, Eye, ArrowLeft, X,
  Mail, Phone, MapPin, MessageCircle, FileText,
  Package, TrendingUp, UserPlus, Bell, Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ADMIN_HEADER_H } from '../AdminLayout';
import {
  SellerApplicationData, SellerApplicationStatus,
  Dispute, DisputeStatus,
} from '../data/mockData';
import * as adminDb from '../../lib/db/admin';
import type { PlatformStats, AdminUser, AdminRecord, AdminOrder, DayRevenue } from '../../lib/db/admin';
import { isSupabaseConfigured } from '../../lib/supabase';

type AdminView = 'overview' | 'stores' | 'users' | 'orders' | 'disputes' | 'payouts' | 'settings' | 'notifications';
type StoreFilter = 'all' | 'pending' | 'approved' | 'suspended';
type UserFilter = 'all' | 'buyer' | 'seller' | 'admin';
type OrderFilter = 'all' | 'held' | 'released' | 'disputed';

const REASON_LABELS: Record<string, string> = {
  not_received: 'Item Not Received',
  wrong_item: 'Wrong Item Sent',
  damaged: 'Item Damaged',
  not_as_described: 'Not as Described',
  other: 'Other',
};

const NAV: { id: AdminView; Icon: React.ElementType; label: string }[] = [
  { id: 'overview',       Icon: LayoutDashboard, label: 'Overview' },
  { id: 'stores',         Icon: Store,           label: 'Stores & Listings' },
  { id: 'users',          Icon: Users,           label: 'Users' },
  { id: 'orders',         Icon: ShoppingBag,     label: 'Orders & Escrow' },
  { id: 'disputes',       Icon: AlertTriangle,   label: 'Disputes' },
  { id: 'payouts',        Icon: CreditCard,      label: 'Payouts & Currency' },
  { id: 'notifications',  Icon: Bell,            label: 'Notifications' },
  { id: 'settings',       Icon: Settings,        label: 'Settings' },
];

function appStatusCls(s: SellerApplicationStatus) {
  switch (s) {
    case 'pending':   return 'text-[#856404] bg-[#FFD100]/15';
    case 'approved':  return 'text-[#009739] bg-[#009739]/10';
    case 'rejected':  return 'text-[#CE1126] bg-[#CE1126]/10';
    case 'suspended': return 'text-gray-600 bg-gray-100';
  }
}

function disputeCls(s: DisputeStatus) {
  switch (s) {
    case 'open':            return 'text-[#CE1126] bg-[#CE1126]/10';
    case 'under_review':    return 'text-[#856404] bg-[#FFD100]/15';
    case 'resolved_buyer':
    case 'resolved_seller': return 'text-[#009739] bg-[#009739]/10';
    case 'closed':          return 'text-gray-600 bg-gray-100';
  }
}

function orderStatusCls(s: string) {
  if (s === 'delivered') return 'text-[#009739] bg-[#009739]/10';
  if (s === 'cancelled') return 'text-[#CE1126] bg-[#CE1126]/10';
  if (s === 'confirmed') return 'text-[#856404] bg-[#FFD100]/15';
  return 'text-gray-600 bg-gray-100';
}

function userRoleCls(r: string) {
  if (r === 'seller') return 'text-[#856404] bg-[#FFD100]/15';
  if (r === 'admin')  return 'text-[#009739] bg-[#009739]/10';
  return 'text-gray-600 bg-gray-100';
}

const EmptyState = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="py-16 flex flex-col items-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-gray-700 text-sm mb-1" style={{ fontWeight: 700 }}>{title}</p>
    <p className="text-gray-400 text-xs max-w-xs">{sub}</p>
  </div>
);

const Toggle = ({ val, set }: { val: boolean; set: (v: boolean) => void }) => (
  <button
    onClick={() => set(!val)}
    className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors border-none cursor-pointer flex-shrink-0"
    style={{ background: val ? '#009739' : '#D1D5DB' }}
  >
    <span
      className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
      style={{ transform: val ? 'translateX(22px)' : 'translateX(2px)' }}
    />
  </button>
);

export const AdminDashboard = () => {
  const { user, authLoading, notifications, unreadCount, markAllRead, addNotification } = useStore();

  const [applications, setApplications] = useState<SellerApplicationData[]>([]);
  const [disputes,     setDisputes]     = useState<Dispute[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [admins,       setAdmins]       = useState<AdminRecord[]>([]);
  const [orders,       setOrders]       = useState<AdminOrder[]>([]);
  const [chartData,    setChartData]    = useState<DayRevenue[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [view,        setView]        = useState<AdminView>('overview');
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'system' | 'promo' | 'unread'>('all');
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all');
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<SellerApplicationData | null>(null);
  const [userFilter,  setUserFilter]  = useState<UserFilter>('all');
  const [userSearch,  setUserSearch]  = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [selectedDispute,   setSelectedDispute]   = useState<Dispute | null>(null);
  const [disputeResolution, setDisputeResolution] = useState('');

  // Settings
  const [maintenance,     setMaintenance]     = useState(false);
  const [autoApprove,     setAutoApprove]     = useState(false);
  const [autoReleaseDays, setAutoReleaseDays] = useState('3');
  const [commissionPct,   setCommissionPct]   = useState('5');
  const [pwCurrent,       setPwCurrent]       = useState('');
  const [pwNew,           setPwNew]           = useState('');
  const [pwConfirm,       setPwConfirm]       = useState('');
  const [pwError,         setPwError]         = useState('');
  const [pwSuccess,       setPwSuccess]       = useState(false);

  // Add Admin modal
  const [addAdminOpen,     setAddAdminOpen]     = useState(false);
  const [addAdminName,     setAddAdminName]      = useState('');
  const [addAdminEmail,    setAddAdminEmail]     = useState('');
  const [addAdminRole,     setAddAdminRole]      = useState('Super Admin');
  const [addAdminPassword, setAddAdminPassword]  = useState('');
  const [addAdminError,    setAddAdminError]     = useState('');
  const [addAdminBusy,     setAddAdminBusy]      = useState(false);

  const loadAll = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    const results = await Promise.allSettled([
      adminDb.fetchSellerApplications(),
      adminDb.fetchDisputes(),
      adminDb.fetchPlatformStats(),
      adminDb.fetchUsers(),
      adminDb.fetchAdmins(),
      adminDb.fetchOrders(),
      adminDb.fetchWeeklyGMV(),
    ]);
    function val<T>(r: PromiseSettledResult<T>, fallback: T): T {
      if (r.status === 'fulfilled') return r.value;
      console.error('[admin] loadAll:', r.reason);
      return fallback;
    }
    setApplications(val(results[0], []));
    setDisputes(val(results[1], []));
    setPlatformStats(val(results[2], null));
    setUsers(val(results[3], []));
    setAdmins(val(results[4], []));
    setOrders(val(results[5], []));
    setChartData(val(results[6], []));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const updateApplicationStatus = async (id: string, status: SellerApplicationStatus, notes?: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status, reviewNotes: notes || a.reviewNotes } : a));
    setSelectedApp(null);
    await adminDb.updateSellerApplicationStatus(id, status, notes);
  };

  const updateDisputeStatus = async (id: string, status: DisputeStatus, resolution?: string) => {
    setDisputes(prev => prev.map(d => d.id === id ? {
      ...d, status, resolution: resolution || d.resolution,
      resolvedAt: ['resolved_buyer', 'resolved_seller', 'closed'].includes(status)
        ? new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }) : d.resolvedAt,
    } : d));
    setSelectedDispute(null);
    setDisputeResolution('');
    await adminDb.updateDisputeStatus(id, status, resolution);
  };

  const handleAddAdmin = async () => {
    if (!addAdminName.trim()) { setAddAdminError('Enter a full name.'); return; }
    if (!addAdminEmail.trim()) { setAddAdminError('Enter an email address.'); return; }
    if (addAdminPassword.length < 8) { setAddAdminError('Password must be at least 8 characters.'); return; }
    setAddAdminBusy(true);
    setAddAdminError('');
    const err = await adminDb.addAdmin(addAdminEmail.trim(), addAdminName.trim(), addAdminPassword, addAdminRole);
    setAddAdminBusy(false);
    if (err) { setAddAdminError(err); return; }
    setAddAdminOpen(false);
    setAddAdminName(''); setAddAdminEmail(''); setAddAdminPassword(''); setAddAdminRole('Super Admin');
    const fresh = await adminDb.fetchAdmins();
    setAdmins(fresh);
  };

  const handleRemoveAdmin = async (id: string) => {
    if (id === user?.id) return; // can't remove yourself
    await adminDb.removeAdmin(id);
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handleSavePassword = () => {
    setPwSuccess(false);
    if (!pwCurrent) { setPwError('Enter your current password.'); return; }
    if (pwNew.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError('Passwords do not match.'); return; }
    setPwError('');
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwSuccess(true);
  };

  const pendingCount     = applications.filter(a => a.status === 'pending').length;
  const approvedCount    = applications.filter(a => a.status === 'approved').length;
  const suspendedCount   = applications.filter(a => a.status === 'suspended').length;
  const openDisputeCount = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;

  const filteredStores = applications.filter(a => {
    const matchFilter = storeFilter === 'all' || a.status === storeFilter;
    const matchSearch = !storeSearch ||
      a.sellerName.toLowerCase().includes(storeSearch.toLowerCase()) ||
      a.businessName.toLowerCase().includes(storeSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchFilter = userFilter === 'all' || u.role === userFilter;
    const matchSearch = !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'held')     return o.escrowStatus === 'funds_held' || o.escrowStatus === 'payment_confirmed';
    if (orderFilter === 'released') return o.escrowStatus === 'released';
    if (orderFilter === 'disputed') return o.escrowStatus === 'disputed';
    return true;
  });

  const gmvTotal = platformStats?.totalRevenue ?? 0;
  const chartMax = Math.max(...chartData.map(d => d.value), 1);

  // ── Auth guards ──
  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#009739]" />
    </div>
  );
  if (!user || user.role !== 'admin') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Access Denied</h2>
      <p className="text-sm text-gray-500 max-w-xs">You need an admin account to view this page.</p>
    </div>
  );

  const navTo = (id: AdminView) => { setView(id); setSelectedApp(null); setSelectedDispute(null); };

  const filterTabCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
      active ? 'bg-white border-[#EAEAEA] text-gray-900 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
    }`;

  const TH = ({ label }: { label: string }) => (
    <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>{label}</p>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-[#EAEAEA] px-4 py-2 flex gap-2 overflow-x-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => navTo(n.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer border-none transition-all"
            style={{ background: view === n.id ? '#009739' : '#f3f4f6', color: view === n.id ? '#fff' : '#6b7280', fontWeight: view === n.id ? 700 : 500 }}
          >
            <n.Icon className="w-3 h-3" />{n.label}
            {n.id === 'stores' && pendingCount > 0 && <span className="px-1 rounded-full text-white" style={{ fontSize: '0.55rem', fontWeight: 700, background: '#CE1126' }}>{pendingCount}</span>}
            {n.id === 'disputes' && openDisputeCount > 0 && <span className="px-1 rounded-full text-white" style={{ fontSize: '0.55rem', fontWeight: 700, background: '#CE1126' }}>{openDisputeCount}</span>}
            {n.id === 'notifications' && unreadCount > 0 && <span className="px-1 rounded-full text-white" style={{ fontSize: '0.55rem', fontWeight: 700, background: '#CE1126' }}>{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 w-64 bg-white border-r border-[#EAEAEA] z-40 flex-col"
        style={{ top: ADMIN_HEADER_H, height: `calc(100vh - ${ADMIN_HEADER_H}px)` }}>
        <div className="p-6 border-b border-[#EAEAEA]">
          <h1 className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 800 }}>Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">Marketplace Control</p>
        </div>
        <nav className="p-4 space-y-0.5 overflow-y-auto flex-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => navTo(n.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border-none text-left"
              style={{ fontWeight: view === n.id ? 700 : 500, background: view === n.id ? 'rgba(0,151,57,0.08)' : 'transparent', color: view === n.id ? '#009739' : '#6b7280' }}
            >
              <n.Icon className="w-4 h-4" />
              <span className="flex-1">{n.label}</span>
              {n.id === 'stores' && pendingCount > 0 && <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#CE1126' }}>{pendingCount}</span>}
              {n.id === 'disputes' && openDisputeCount > 0 && <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#CE1126' }}>{openDisputeCount}</span>}
              {n.id === 'notifications' && unreadCount > 0 && <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#CE1126' }}>{unreadCount}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="md:ml-64 p-4 md:p-8 pt-4">

        {/* ── OVERVIEW ── */}
        {view === 'overview' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dashboard Overview</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Gross Merchandise Value', value: gmvTotal > 0 ? `$${gmvTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0', Icon: TrendingUp, color: '#009739' },
                { label: 'Total Orders', value: String(platformStats?.totalOrders ?? 0), Icon: ShoppingBag, color: '#856404' },
                { label: 'Active Sellers', value: String(platformStats?.approvedSellers ?? approvedCount), Icon: Store, color: '#009739' },
                { label: 'Open Disputes', value: String(openDisputeCount), Icon: AlertTriangle, color: openDisputeCount > 0 ? '#CE1126' : '#009739' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-white border border-[#EAEAEA]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>{s.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* GMV Chart */}
              <div className="bg-white rounded-xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>GMV — last 7 days</p>
                  <p className="text-xs text-gray-400">USD</p>
                </div>
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center" style={{ height: 120 }}>
                    <p className="text-xs text-gray-400">No sales data yet</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-2" style={{ height: 120 }}>
                    {chartData.map((d, i) => (
                      <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full rounded-t" style={{ height: chartMax > 0 ? `${(d.value / chartMax) * 96}px` : '2px', background: i === chartData.length - 1 ? '#009739' : 'rgba(0,151,57,0.2)', minHeight: 2 }} />
                        <span className="text-gray-400" style={{ fontSize: 10 }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Stores */}
              <div className="bg-white rounded-xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Recent Store Applications</p>
                {applications.length === 0 ? (
                  <EmptyState icon={Store} title="No applications yet" sub="New seller applications will appear here." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {applications.slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-center gap-3">
                        {a.logo ? <img src={a.logo} alt={a.businessName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>{a.businessName.charAt(0)}</div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{a.businessName}</p>
                          <p className="text-xs text-gray-400">{a.sellerName} · {a.city}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${appStatusCls(a.status)}`} style={{ fontWeight: 700 }}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Orders summary */}
              <div className="bg-white rounded-xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Order Status Split</p>
                {orders.length === 0 ? (
                  <EmptyState icon={ShoppingBag} title="No orders yet" sub="Order stats will display here." />
                ) : (() => {
                  const delivered  = orders.filter(o => o.status === 'delivered').length;
                  const confirmed  = orders.filter(o => o.status === 'confirmed').length;
                  const pending    = orders.filter(o => o.status === 'pending').length;
                  const cancelled  = orders.filter(o => o.status === 'cancelled').length;
                  const total      = orders.length;
                  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
                  const deliveredPct = pct(delivered);
                  const confirmedPct = pct(confirmed);
                  const pendingPct = pct(pending);
                  const cancelledPct = pct(cancelled);
                  return (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: `conic-gradient(#009739 0% ${deliveredPct}%, #856404 ${deliveredPct}% ${deliveredPct + confirmedPct}%, #CE1126 ${deliveredPct + confirmedPct}% ${deliveredPct + confirmedPct + cancelledPct}%, #D1D5DB ${deliveredPct + confirmedPct + cancelledPct}% 100%)` }}>
                        <div className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center">
                          <span className="text-gray-900 leading-none" style={{ fontSize: 13, fontWeight: 800 }}>{total}</span>
                          <span className="text-gray-400" style={{ fontSize: 9 }}>orders</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        {[
                          { label: 'Delivered', pct: deliveredPct, color: '#009739' },
                          { label: 'Confirmed', pct: confirmedPct, color: '#856404' },
                          { label: 'Pending',   pct: pendingPct,   color: '#D1D5DB' },
                          { label: 'Cancelled', pct: cancelledPct, color: '#CE1126' },
                        ].map(l => (
                          <div key={l.label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                              <span className="text-gray-500">{l.label}</span>
                            </div>
                            <span className="text-gray-900" style={{ fontWeight: 700 }}>{l.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Top stores */}
              <div className="bg-white rounded-xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Top Performing Stores</p>
                {applications.filter(a => a.status === 'approved').length === 0 ? (
                  <EmptyState icon={TrendingUp} title="No approved stores" sub="Approved stores will be ranked here." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {applications.filter(a => a.status === 'approved').slice(0, 5).map((a, i, arr) => (
                      <div key={a.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-900 truncate mr-2" style={{ fontWeight: 600 }}>{a.businessName}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#009739]" style={{ width: `${((arr.length - i) / arr.length) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Users summary */}
              <div className="bg-white rounded-xl border border-[#EAEAEA] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Users by Role</p>
                {users.length === 0 ? (
                  <EmptyState icon={Users} title="No users yet" sub="Registered users will appear here." />
                ) : (() => {
                  const buyers  = users.filter(u => u.role === 'buyer').length;
                  const sellers = users.filter(u => u.role === 'seller').length;
                  const adms    = users.filter(u => u.role === 'admin').length;
                  const total   = users.length;
                  return (
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Buyers',  count: buyers,  color: '#009739' },
                        { label: 'Sellers', count: sellers, color: '#856404' },
                        { label: 'Admins',  count: adms,    color: '#6b7280' },
                      ].map(r => (
                        <div key={r.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{r.label}</span>
                            <span className="text-gray-900" style={{ fontWeight: 700 }}>{r.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: total > 0 ? `${(r.count / total) * 100}%` : '0%', background: r.color }} />
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">Total: {total} users</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── STORES ── */}
        {view === 'stores' && !selectedApp && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Stores &amp; Listings</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {(['all', 'pending', 'approved', 'suspended'] as StoreFilter[]).map(f => (
                  <button key={f} onClick={() => setStoreFilter(f)} className={`${filterTabCls(storeFilter === f)} capitalize whitespace-nowrap`} style={{ fontWeight: storeFilter === f ? 700 : 500 }}>
                    {f} ({f === 'all' ? applications.length : f === 'pending' ? pendingCount : f === 'approved' ? approvedCount : suspendedCount})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 border border-[#EAEAEA] rounded-xl px-3 py-2 bg-white w-full sm:w-auto" style={{ minWidth: 0 }}>
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input value={storeSearch} onChange={e => setStoreSearch(e.target.value)} placeholder="Search stores…" className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 min-w-0" />
              </div>
            </div>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-6 gap-4">
                    {['Store', 'Owner', 'Location', 'Category', 'Status', 'Actions'].map(h => <TH key={h} label={h} />)}
                  </div>
                  {filteredStores.length === 0 ? (
                    <EmptyState icon={Store} title="No stores found" sub="Try adjusting your search or filter." />
                  ) : filteredStores.map(app => (
                    <div key={app.id} className="px-5 py-4 grid grid-cols-6 gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {app.logo ? <img src={app.logo} alt={app.businessName} className="w-8 h-8 rounded-full object-cover shrink-0" /> : <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>{app.businessName.charAt(0)}</div>}
                        <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{app.businessName}</p>
                      </div>
                      <p className="text-sm text-gray-700 truncate">{app.sellerName}</p>
                      <p className="text-sm text-gray-500">{app.city || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{app.category || '—'}</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs capitalize w-fit ${appStatusCls(app.status)}`} style={{ fontWeight: 700 }}>{app.status}</span>
                      <button onClick={() => setSelectedApp(app)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#009739] hover:bg-[#009739]/5 transition-colors border-none bg-transparent cursor-pointer" style={{ fontWeight: 600 }}>
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store detail */}
        {view === 'stores' && selectedApp && (
          <div>
            <button onClick={() => setSelectedApp(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" /> Back to stores
            </button>
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                {selectedApp.logo ? <img src={selectedApp.logo} alt={selectedApp.businessName} className="w-14 h-14 rounded-2xl object-cover" /> : <div className="w-14 h-14 rounded-2xl bg-[#009739] flex items-center justify-center text-white" style={{ fontWeight: 800, fontSize: '1.3rem' }}>{selectedApp.sellerName.charAt(0)}</div>}
                <div>
                  <h2 className="text-gray-900" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedApp.businessName}</h2>
                  <p className="text-sm text-gray-500">by {selectedApp.sellerName} · Applied {selectedApp.submittedAt}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs capitalize ${appStatusCls(selectedApp.status)}`} style={{ fontWeight: 700 }}>{selectedApp.status}</span>
              </div>
              <div className="border border-[#EAEAEA] rounded-xl p-6 mb-6 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { Icon: Phone, label: 'Phone', value: selectedApp.phone || '—' },
                    { Icon: MessageCircle, label: 'WhatsApp', value: selectedApp.whatsapp || '—' },
                    { Icon: Mail, label: 'Email', value: selectedApp.email || '—' },
                    { Icon: MapPin, label: 'Location', value: [selectedApp.address, selectedApp.city].filter(Boolean).join(', ') || '—' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><f.Icon className="w-3.5 h-3.5 text-gray-400" /></div>
                      <div>
                        <p className="text-[11px] text-gray-400">{f.label}</p>
                        <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-1">Category</p>
                  <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>{selectedApp.category || '—'}</p>
                  <p className="text-[11px] text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedApp.description || 'No description provided.'}</p>
                </div>
                {selectedApp.documents.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 mb-2">Documents ({selectedApp.documents.length})</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedApp.documents.map(d => (
                        <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700" style={{ fontWeight: 600 }}>
                          <FileText className="w-3 h-3 text-gray-400" /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedApp.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => updateApplicationStatus(selectedApp.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontWeight: 700 }}>
                    <CheckCircle className="w-4 h-4" /> Approve Store
                  </button>
                  <button onClick={() => updateApplicationStatus(selectedApp.id, 'rejected', 'Application did not meet verification requirements.')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#CE1126] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-red-700 transition-colors" style={{ fontWeight: 700 }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
              {selectedApp.status === 'approved' && (
                <button onClick={() => updateApplicationStatus(selectedApp.id, 'suspended')} className="w-full py-3 border border-[#EAEAEA] text-[#CE1126] rounded-xl text-sm cursor-pointer bg-white hover:bg-red-50 transition-colors" style={{ fontWeight: 700 }}>Suspend Store</button>
              )}
              {selectedApp.status === 'suspended' && (
                <button onClick={() => updateApplicationStatus(selectedApp.id, 'approved')} className="w-full py-3 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontWeight: 700 }}>Reinstate Store</button>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {view === 'users' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Users</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {([
                  { id: 'all' as UserFilter, label: `All (${users.length})` },
                  { id: 'buyer' as UserFilter, label: `Buyers (${users.filter(u => u.role === 'buyer').length})` },
                  { id: 'seller' as UserFilter, label: `Sellers (${users.filter(u => u.role === 'seller').length})` },
                  { id: 'admin' as UserFilter, label: `Admins (${users.filter(u => u.role === 'admin').length})` },
                ]).map(f => (
                  <button key={f.id} onClick={() => setUserFilter(f.id)} className={`${filterTabCls(userFilter === f.id)} whitespace-nowrap`} style={{ fontWeight: userFilter === f.id ? 700 : 500 }}>{f.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 border border-[#EAEAEA] rounded-xl px-3 py-2 bg-white w-full sm:w-auto" style={{ minWidth: 0 }}>
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users…" className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 min-w-0" />
              </div>
            </div>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-5 gap-4">
                    {['Name', 'Email', 'Location', 'Role', 'Joined'].map(h => <TH key={h} label={h} />)}
                  </div>
                  {filteredUsers.length === 0 ? (
                    <EmptyState icon={Users} title="No users found" sub={userSearch ? 'No users match your search.' : 'Registered users will appear here.'} />
                  ) : filteredUsers.map(u => (
                    <div key={u.id} className="px-5 py-4 grid grid-cols-5 gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>{u.name.charAt(0)}</div>
                        <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{u.name}</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{u.email || '—'}</p>
                      <p className="text-sm text-gray-500">{u.city || '—'}</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs capitalize w-fit ${userRoleCls(u.role)}`} style={{ fontWeight: 700 }}>{u.role}</span>
                      <p className="text-xs text-gray-400">{u.createdAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {view === 'orders' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Orders &amp; Escrow</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
              {([
                { id: 'all' as OrderFilter, label: `All (${orders.length})` },
                { id: 'held' as OrderFilter, label: 'Escrow Held' },
                { id: 'released' as OrderFilter, label: 'Released' },
                { id: 'disputed' as OrderFilter, label: 'Disputed' },
              ]).map(f => (
                <button key={f.id} onClick={() => setOrderFilter(f.id)} className={`${filterTabCls(orderFilter === f.id)} whitespace-nowrap`} style={{ fontWeight: orderFilter === f.id ? 700 : 500 }}>{f.label}</button>
              ))}
            </div>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid gap-4" style={{ gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr 1fr 1fr' }}>
                    {['Order ID', 'Buyer', 'Seller', 'Amount', 'Status', 'Escrow'].map(h => <TH key={h} label={h} />)}
                  </div>
                  {filteredOrders.length === 0 ? (
                    <EmptyState icon={ShoppingBag} title="No orders found" sub={orderFilter !== 'all' ? 'No orders match this filter.' : 'Orders from your marketplace will appear here.'} />
                  ) : filteredOrders.map(o => (
                    <div key={o.id} className="px-5 py-4 grid gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr 1fr 1fr' }}>
                      <p className="text-sm text-gray-900 font-mono truncate" style={{ fontWeight: 700 }}>{o.id.slice(0, 8)}…</p>
                      <p className="text-sm text-gray-700 truncate">{o.buyer}</p>
                      <p className="text-sm text-gray-700 truncate">{o.seller}</p>
                      <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>${o.amount.toFixed(2)}</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs capitalize w-fit ${orderStatusCls(o.status)}`} style={{ fontWeight: 700 }}>{o.status}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs capitalize w-fit text-gray-600 bg-gray-100" style={{ fontWeight: 700 }}>{o.escrowStatus.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DISPUTES ── */}
        {view === 'disputes' && !selectedDispute && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dispute Resolution</h2>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
              <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-6 gap-4">
                {['Order', 'Buyer', 'Seller', 'Reason', 'Status', 'Actions'].map(h => <TH key={h} label={h} />)}
              </div>
              {disputes.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No disputes" sub="Disputes raised by buyers will appear here." />
              ) : disputes.map(d => (
                <div key={d.id} className="px-5 py-4 grid grid-cols-6 gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                  <p className="text-sm text-gray-900 font-mono" style={{ fontWeight: 700 }}>{d.orderId}</p>
                  <p className="text-sm text-gray-700">{d.buyerName}</p>
                  <p className="text-sm text-gray-700">{d.sellerName}</p>
                  <p className="text-xs text-gray-500">{REASON_LABELS[d.reason] || d.reason}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs w-fit ${disputeCls(d.status)}`} style={{ fontWeight: 700 }}>{d.status.replace(/_/g, ' ')}</span>
                  <button onClick={() => setSelectedDispute(d)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#009739] hover:bg-[#009739]/5 transition-colors border-none bg-transparent cursor-pointer" style={{ fontWeight: 600 }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispute detail */}
        {view === 'disputes' && selectedDispute && (
          <div className="max-w-2xl">
            <button onClick={() => { setSelectedDispute(null); setDisputeResolution(''); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" /> Back to disputes
            </button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dispute: {selectedDispute.orderId}</h2>
                <p className="text-sm text-gray-500">Filed {selectedDispute.createdAt} · ${selectedDispute.amount} at stake</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${disputeCls(selectedDispute.status)}`} style={{ fontWeight: 700 }}>{selectedDispute.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="border border-[#EAEAEA] rounded-xl p-6 mb-6 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-[11px] text-gray-400 mb-0.5">Buyer</p><p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{selectedDispute.buyerName}</p></div>
                <div><p className="text-[11px] text-gray-400 mb-0.5">Seller</p><p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{selectedDispute.sellerName}</p></div>
              </div>
              <div className="mb-4">
                <p className="text-[11px] text-gray-400 mb-0.5">Reason</p>
                <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{REASON_LABELS[selectedDispute.reason] || selectedDispute.reason}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[11px] text-gray-400 mb-1">Buyer's Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedDispute.description}</p>
              </div>
              {selectedDispute.resolution && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
                  <p className="text-[11px] text-[#009739] mb-1" style={{ fontWeight: 700 }}>Resolution</p>
                  <p className="text-sm text-gray-700">{selectedDispute.resolution}</p>
                </div>
              )}
            </div>
            {(selectedDispute.status === 'open' || selectedDispute.status === 'under_review') && (
              <div className="border border-[#EAEAEA] rounded-xl p-6 bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>Resolve Dispute</p>
                <textarea value={disputeResolution} onChange={e => setDisputeResolution(e.target.value)} placeholder="Enter resolution notes…" rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:border-[#009739] bg-gray-50 mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_buyer', disputeResolution || 'Resolved in favour of buyer. Full refund issued.')} className="flex-1 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontWeight: 700 }}>
                    Refund Buyer (${selectedDispute.amount})
                  </button>
                  <button onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_seller', disputeResolution || 'Resolved in favour of seller. Funds released.')} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 700 }}>
                    Release to Seller
                  </button>
                  {selectedDispute.status === 'open' && (
                    <button onClick={() => updateDisputeStatus(selectedDispute.id, 'under_review')} className="px-4 py-2.5 border-2 border-[#FFD100] text-[#856404] rounded-xl text-sm cursor-pointer bg-[#FFD100]/10 hover:bg-[#FFD100]/20 transition-colors" style={{ fontWeight: 700 }}>
                      Under Review
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYOUTS ── */}
        {view === 'payouts' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Payouts &amp; Currency</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Pending Payouts', value: '$0.00' },
                { label: 'Paid this Month', value: '$0.00' },
                { label: 'USD → ZiG Rate', value: '1 : 360', editable: true },
              ].map(s => (
                <div key={s.label} className="bg-white border border-[#EAEAEA] rounded-xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>{s.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
                    {s.editable && <button className="text-xs text-[#009739] border-none bg-transparent cursor-pointer p-0" style={{ fontWeight: 600 }}>edit</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid gap-4" style={{ gridTemplateColumns: '1.6fr 1.3fr 1fr 1.1fr 130px' }}>
                    {['Seller', 'Requested', 'Currency', 'Status', ''].map((h, i) => <TH key={i} label={h} />)}
                  </div>
                  <EmptyState icon={CreditCard} title="No pending payouts" sub="Payout requests from sellers will appear here." />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {view === 'settings' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Settings</h2>
            <div className="grid md:grid-cols-2 gap-5">

              {/* Platform Settings */}
              <div className="bg-white border border-[#EAEAEA] rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-gray-900 mb-5" style={{ fontSize: '0.95rem', fontWeight: 700 }}>Platform Settings</h3>
                <div className="flex flex-col gap-5">
                  {[
                    { label: 'Maintenance mode', sub: 'Take the marketplace offline for buyers', val: maintenance, set: setMaintenance },
                    { label: 'Auto-approve new sellers', sub: 'Skip manual review for verified ID', val: autoApprove, set: setAutoApprove },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{s.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                      </div>
                      <Toggle val={s.val} set={s.set} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Escrow auto-release</p>
                      <p className="text-xs text-gray-400 mt-0.5">Days after delivery before auto-release</p>
                    </div>
                    <input value={autoReleaseDays} onChange={e => setAutoReleaseDays(e.target.value)} className="w-14 text-center px-2 py-1.5 border border-[#EAEAEA] rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#009739]" style={{ fontWeight: 600 }} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Platform commission</p>
                      <p className="text-xs text-gray-400 mt-0.5">Percentage taken per completed sale</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input value={commissionPct} onChange={e => setCommissionPct(e.target.value)} className="w-14 text-center px-2 py-1.5 border border-[#EAEAEA] rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#009739]" style={{ fontWeight: 600 }} />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button className="px-5 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontWeight: 700 }}>Save Settings</button>
                  </div>
                </div>
              </div>

              {/* My Account */}
              <div className="bg-white border border-[#EAEAEA] rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-gray-900 mb-5" style={{ fontSize: '0.95rem', fontWeight: 700 }}>My Account</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Current password', val: pwCurrent, set: setPwCurrent },
                    { label: 'New password',      val: pwNew,     set: setPwNew },
                    { label: 'Confirm new password', val: pwConfirm, set: setPwConfirm },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>{f.label}</label>
                      <input type="password" value={f.val} onChange={e => f.set(e.target.value)} placeholder="••••••••"
                        className="w-full px-3 py-2.5 border border-[#EAEAEA] rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#009739] transition-colors" />
                    </div>
                  ))}
                  {pwError   && <p className="text-xs text-[#CE1126]" style={{ fontWeight: 600 }}>{pwError}</p>}
                  {pwSuccess && <p className="text-xs text-[#009739]" style={{ fontWeight: 600 }}>Password updated successfully.</p>}
                  <button onClick={handleSavePassword} className="self-start mt-1 px-5 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors" style={{ fontWeight: 700 }}>
                    Update Password
                  </button>
                </div>
              </div>

              {/* Admin Roles */}
              <div className="bg-white border border-[#EAEAEA] rounded-xl p-6 md:col-span-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-900" style={{ fontSize: '0.95rem', fontWeight: 700 }}>Admin Roles</h3>
                  <button
                    onClick={() => { setAddAdminOpen(true); setAddAdminEmail(''); setAddAdminError(''); }}
                    className="flex items-center gap-1.5 text-xs text-[#009739] border border-[#009739]/30 bg-[#009739]/5 hover:bg-[#009739]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Admin
                  </button>
                </div>
                {admins.length === 0 ? (
                  <EmptyState icon={Shield} title="No admins found" sub="Add an admin to give a user access to this dashboard." />
                ) : (
                  <div className="flex flex-col">
                    {admins.map(r => (
                      <div key={r.id} className="flex items-center justify-between py-3 border-t border-gray-100 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>{r.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{r.name}</p>
                            <p className="text-xs text-gray-400 truncate">{r.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-xs text-[#009739] bg-[#009739]/10" style={{ fontWeight: 700 }}>{r.role}</span>
                          {r.id !== user?.id && (
                            <button onClick={() => handleRemoveAdmin(r.id)} className="text-xs text-[#CE1126] hover:text-red-700 border-none bg-transparent cursor-pointer p-0" style={{ fontWeight: 600 }}>Remove</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {view === 'notifications' && (() => {
          const filtered = notifications.filter(n => {
            if (notifFilter === 'unread') return !n.read;
            if (notifFilter === 'all') return true;
            return n.type === notifFilter;
          });

          const typeBadge = (type: string) => {
            switch (type) {
              case 'order':  return { bg: 'rgba(0,151,57,0.1)',  color: '#009739', label: 'Order' };
              case 'system': return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'System' };
              case 'promo':  return { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Promo' };
              default:       return { bg: '#f3f4f6', color: '#6b7280', label: type };
            }
          };

          return (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Notifications</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {([
                  { id: 'all',    label: 'All' },
                  { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                  { id: 'order',  label: 'Orders' },
                  { id: 'system', label: 'System' },
                  { id: 'promo',  label: 'Promos' },
                ] as const).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setNotifFilter(f.id)}
                    className="px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border-none"
                    style={{
                      background: notifFilter === f.id ? '#009739' : '#f3f4f6',
                      color: notifFilter === f.id ? '#fff' : '#6b7280',
                      fontWeight: notifFilter === f.id ? 700 : 500,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" sub={notifFilter === 'unread' ? "You're all caught up." : "Nothing here yet."} />
              ) : (
                <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {filtered.map((n, idx) => {
                    const badge = typeBadge(n.type);
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-4 px-5 py-4"
                        style={{
                          background: n.read ? '#fff' : 'rgba(0,151,57,0.03)',
                          borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}
                      >
                        <div className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: n.read ? '#d1d5db' : '#009739', marginTop: 6 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm text-gray-900 truncate" style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</p>
                            <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: '0.65rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

      </main>

      {/* ── Add Admin Modal ── */}
      {addAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setAddAdminOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 800 }}>Add Admin</h3>
              <button onClick={() => setAddAdminOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Full name</label>
                <input type="text" value={addAdminName} onChange={e => { setAddAdminName(e.target.value); setAddAdminError(''); }}
                  placeholder="e.g. Rudo Chirairo"
                  className="w-full px-3 py-2.5 border border-[#EAEAEA] rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#009739] transition-colors"
                  autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Email</label>
                <input type="email" value={addAdminEmail} onChange={e => { setAddAdminEmail(e.target.value); setAddAdminError(''); }}
                  placeholder="name@msika.co.zw"
                  className="w-full px-3 py-2.5 border border-[#EAEAEA] rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#009739] transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Role</label>
                <div className="flex flex-wrap gap-2">
                  {['Super Admin', 'Finance', 'Moderator', 'Support'].map(r => (
                    <button key={r} type="button" onClick={() => setAddAdminRole(r)}
                      className="px-4 py-1.5 rounded-full text-sm border cursor-pointer transition-all"
                      style={{ fontWeight: 600, background: addAdminRole === r ? '#009739' : '#f9fafb', color: addAdminRole === r ? '#fff' : '#374151', borderColor: addAdminRole === r ? '#009739' : '#e5e7eb' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Temporary password</label>
                <input type="password" value={addAdminPassword} onChange={e => { setAddAdminPassword(e.target.value); setAddAdminError(''); }}
                  placeholder="Set a temporary password"
                  className="w-full px-3 py-2.5 border border-[#EAEAEA] rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#009739] transition-colors" />
              </div>
              {addAdminError && <p className="text-xs text-[#CE1126]" style={{ fontWeight: 600 }}>{addAdminError}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAddAdminOpen(false)} className="flex-1 py-2.5 border border-[#EAEAEA] text-gray-700 rounded-xl text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
              <button onClick={handleAddAdmin} disabled={addAdminBusy} className="flex-1 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2" style={{ fontWeight: 700 }}>
                {addAdminBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {addAdminBusy ? 'Adding…' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
