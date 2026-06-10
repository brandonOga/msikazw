import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Clock,
  Search, ChevronDown, X,
  CheckCircle, XCircle, AlertCircle, Eye, Mail, Phone, MapPin,
  FileText, Shield, MessageCircle, ArrowLeft, Loader2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ADMIN_HEADER_H } from '../AdminLayout';
import {
  SellerApplicationData, SellerApplicationStatus,
  Dispute, DisputeStatus,
} from '../data/mockData';
import * as adminDb from '../../lib/db/admin';
import type { PlatformStats } from '../../lib/db/admin';
import { isSupabaseConfigured } from '../../lib/supabase';

type AdminView = 'dashboard' | 'pending-sellers' | 'disputes';

const REASON_LABELS: Record<string, string> = {
  not_received: 'Item Not Received',
  wrong_item: 'Wrong Item Sent',
  damaged: 'Item Damaged',
  not_as_described: 'Not as Described',
  other: 'Other',
};

export const AdminDashboard = () => {
  const { user, authLoading } = useStore();
  const [applications, setApplications] = useState<SellerApplicationData[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SellerApplicationStatus | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<SellerApplicationData | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeResolution, setDisputeResolution] = useState('');

  // Load real data from Supabase, fall back to seed data
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    Promise.all([
      adminDb.fetchSellerApplications(),
      adminDb.fetchDisputes(),
      adminDb.fetchPlatformStats(),
    ]).then(([apps, disp, stats]) => {
      if (apps.length > 0) setApplications(apps);
      if (disp.length > 0) setDisputes(disp);
      setPlatformStats(stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateApplicationStatus = async (id: string, status: SellerApplicationStatus, notes?: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status, reviewNotes: notes || a.reviewNotes } : a));
    setSelectedApp(null);
    await adminDb.updateSellerApplicationStatus(id, status, notes);
  };

  const updateDisputeStatus = async (id: string, status: DisputeStatus, resolution?: string) => {
    setDisputes(prev => prev.map(d => d.id === id ? {
      ...d, status, resolution: resolution || d.resolution,
      resolvedAt: status.startsWith('resolved') || status === 'closed' ? new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }) : d.resolvedAt,
    } : d));
    setSelectedDispute(null);
    setDisputeResolution('');
    await adminDb.updateDisputeStatus(id, status, resolution);
  };

  const filteredApps = applications.filter(a => {
    const matchSearch = a.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    openDisputes: disputes.filter(d => d.status === 'open' || d.status === 'under_review').length,
  };

  // Auth guard
  if (authLoading) return (
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#009739]" />
    </div>
  );

  const getStatusStyle = (s: SellerApplicationStatus) => {
    switch (s) {
      case 'pending': return 'text-[#856404] bg-[#FFD100]/15';
      case 'approved': return 'text-[#009739] bg-[#009739]/10';
      case 'rejected': return 'text-[#CE1126] bg-[#CE1126]/10';
      case 'suspended': return 'text-gray-600 bg-gray-100';
    }
  };

  const getDisputeStatusStyle = (s: DisputeStatus) => {
    switch (s) {
      case 'open': return 'text-[#CE1126] bg-[#CE1126]/10';
      case 'under_review': return 'text-[#856404] bg-[#FFD100]/15';
      case 'resolved_buyer': case 'resolved_seller': return 'text-[#009739] bg-[#009739]/10';
      case 'closed': return 'text-gray-600 bg-gray-100';
    }
  };

  const NAV = [
    { id: 'dashboard' as AdminView, icon: LayoutDashboard, label: 'Overview' },
    { id: 'pending-sellers' as AdminView, icon: Users, label: 'Seller Applications' },
    { id: 'disputes' as AdminView, icon: Shield, label: 'Disputes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile horizontal tab bar */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-[#EAEAEA] px-4 py-2 flex gap-2 overflow-x-auto">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => { setCurrentView(n.id); setSelectedApp(null); setSelectedDispute(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer border-none transition-all"
            style={{
              background: currentView === n.id ? '#009739' : '#f3f4f6',
              color: currentView === n.id ? '#fff' : '#6b7280',
              fontWeight: currentView === n.id ? 700 : 500,
            }}
          >
            <n.icon className="w-3 h-3" />
            {n.label}
            {n.id === 'pending-sellers' && stats.pending > 0 && (
              <span className="px-1 rounded-full text-white" style={{ fontSize: '0.55rem', fontWeight: 700, background: '#CE1126' }}>{stats.pending}</span>
            )}
            {n.id === 'disputes' && stats.openDisputes > 0 && (
              <span className="px-1 rounded-full text-white" style={{ fontSize: '0.55rem', fontWeight: 700, background: '#CE1126' }}>{stats.openDisputes}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sidebar — desktop only, starts exactly below the fixed header */}
      <aside
        className="hidden md:flex fixed left-0 w-64 bg-white border-r border-[#EAEAEA] z-40 flex-col"
        style={{ top: ADMIN_HEADER_H, height: `calc(100vh - ${ADMIN_HEADER_H}px)` }}
      >
        <div className="p-6 border-b border-[#EAEAEA]">
          <h1 className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 800 }}>Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">Marketplace Control</p>
        </div>
        <nav className="p-4 space-y-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => { setCurrentView(n.id); setSelectedApp(null); setSelectedDispute(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer border-none text-left"
              style={{
                fontWeight: currentView === n.id ? 700 : 500,
                background: currentView === n.id ? 'rgba(0,151,57,0.08)' : 'transparent',
                color: currentView === n.id ? '#009739' : '#6b7280',
              }}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
              {n.id === 'pending-sellers' && stats.pending > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#CE1126' }}>
                  {stats.pending}
                </span>
              )}
              {n.id === 'disputes' && stats.openDisputes > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#CE1126' }}>
                  {stats.openDisputes}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="md:ml-64 p-4 md:p-8">
        {/* ── Dashboard Overview ── */}
        {currentView === 'dashboard' && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Platform Revenue', value: platformStats ? `$${platformStats.totalRevenue.toFixed(0)}` : String(stats.total), icon: Users, color: '#009739' },
                { label: 'Total Orders', value: platformStats ? String(platformStats.totalOrders) : String(stats.pending), icon: Clock, color: '#856404' },
                { label: 'Approved Sellers', value: platformStats ? String(platformStats.approvedSellers) : String(stats.approved), icon: CheckCircle, color: '#009739' },
                { label: 'Open Disputes', value: stats.openDisputes, icon: Shield, color: '#CE1126' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl border border-[#EAEAEA]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>{s.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>Recent Applications</h3>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {app.sellerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{app.businessName}</p>
                    <p className="text-xs text-gray-500">{app.sellerName} · {app.city}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${getStatusStyle(app.status)}`} style={{ fontWeight: 700 }}>
                    {app.status}
                  </span>
                  <button
                    onClick={() => { setSelectedApp(app); setCurrentView('pending-sellers'); }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Seller Applications ── */}
        {currentView === 'pending-sellers' && !selectedApp && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Seller Applications</h2>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 flex-1 border border-[#EAEAEA] rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or business..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                />
              </div>
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 border border-[#EAEAEA] rounded-xl text-sm bg-white cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Table */}
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-6 gap-4">
                {['Seller', 'Business', 'City', 'Category', 'Status', 'Actions'].map(h => (
                  <p key={h} className="text-xs text-gray-500 uppercase" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>{h}</p>
                ))}
              </div>
              {filteredApps.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 text-sm">No applications found</p>
                </div>
              ) : filteredApps.map(app => (
                <div key={app.id} className="px-5 py-4 grid grid-cols-6 gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {app.sellerName.charAt(0)}
                    </div>
                    <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{app.sellerName}</p>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{app.businessName}</p>
                  <p className="text-sm text-gray-500">{app.city}</p>
                  <p className="text-xs text-gray-500 truncate">{app.category}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs capitalize w-fit ${getStatusStyle(app.status)}`} style={{ fontWeight: 700 }}>
                    {app.status}
                  </span>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#009739] hover:bg-[#009739]/5 transition-colors border-none bg-transparent cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Application Detail ── */}
        {currentView === 'pending-sellers' && selectedApp && (
          <div>
            <button onClick={() => setSelectedApp(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" /> Back to list
            </button>

            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#009739] flex items-center justify-center text-white" style={{ fontWeight: 800, fontSize: '1.3rem' }}>
                  {selectedApp.sellerName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-gray-900" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedApp.businessName}</h2>
                  <p className="text-sm text-gray-500">by {selectedApp.sellerName} · Submitted {selectedApp.submittedAt}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs capitalize ${getStatusStyle(selectedApp.status)}`} style={{ fontWeight: 700 }}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Details */}
              <div className="border border-[#EAEAEA] rounded-xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { icon: Phone, label: 'Phone', value: selectedApp.phone },
                    { icon: MessageCircle, label: 'WhatsApp', value: selectedApp.whatsapp },
                    { icon: Mail, label: 'Email', value: selectedApp.email },
                    { icon: MapPin, label: 'Location', value: `${selectedApp.address}, ${selectedApp.city}` },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <f.icon className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">{f.label}</p>
                        <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-1">Category</p>
                  <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>{selectedApp.category}</p>
                  <p className="text-[11px] text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedApp.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-2">Documents ({selectedApp.documents.length})</p>
                  <div className="flex gap-2">
                    {selectedApp.documents.map(d => (
                      <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700" style={{ fontWeight: 600 }}>
                        <FileText className="w-3 h-3 text-gray-400" /> {d}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedApp.reviewNotes && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600" style={{ fontWeight: 600 }}>Review Notes: {selectedApp.reviewNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedApp.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Seller
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected', 'Application did not meet verification requirements.')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#CE1126] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-red-700 transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Disputes ── */}
        {currentView === 'disputes' && !selectedDispute && (
          <div>
            <h2 className="text-gray-900 mb-6" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dispute Resolution</h2>
            <div className="border border-[#EAEAEA] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-5 py-3 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-6 gap-4">
                {['Order', 'Buyer', 'Seller', 'Reason', 'Status', 'Actions'].map(h => (
                  <p key={h} className="text-xs text-gray-500 uppercase" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>{h}</p>
                ))}
              </div>
              {disputes.map(d => (
                <div key={d.id} className="px-5 py-4 grid grid-cols-6 gap-4 items-center border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50/50 transition-colors">
                  <p className="text-sm text-gray-900 font-mono" style={{ fontWeight: 700 }}>{d.orderId}</p>
                  <p className="text-sm text-gray-700">{d.buyerName}</p>
                  <p className="text-sm text-gray-700">{d.sellerName}</p>
                  <p className="text-xs text-gray-500">{REASON_LABELS[d.reason]}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs w-fit ${getDisputeStatusStyle(d.status)}`} style={{ fontWeight: 700 }}>
                    {d.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#009739] hover:bg-[#009739]/5 transition-colors border-none bg-transparent cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dispute Detail ── */}
        {currentView === 'disputes' && selectedDispute && (
          <div className="max-w-2xl">
            <button onClick={() => { setSelectedDispute(null); setDisputeResolution(''); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" /> Back to disputes
            </button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dispute: {selectedDispute.orderId}</h2>
                <p className="text-sm text-gray-500">Filed {selectedDispute.createdAt} · ${selectedDispute.amount} at stake</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${getDisputeStatusStyle(selectedDispute.status)}`} style={{ fontWeight: 700 }}>
                {selectedDispute.status.replace('_', ' ')}
              </span>
            </div>

            <div className="border border-[#EAEAEA] rounded-xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Buyer</p>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{selectedDispute.buyerName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Seller</p>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{selectedDispute.sellerName}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[11px] text-gray-400 mb-0.5">Reason</p>
                <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{REASON_LABELS[selectedDispute.reason]}</p>
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

            {/* Actions for open/under_review disputes */}
            {(selectedDispute.status === 'open' || selectedDispute.status === 'under_review') && (
              <div className="border border-[#EAEAEA] rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>Resolve Dispute</p>
                <textarea
                  value={disputeResolution}
                  onChange={e => setDisputeResolution(e.target.value)}
                  placeholder="Enter resolution notes..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:border-[#009739] bg-gray-50 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_buyer', disputeResolution || 'Resolved in favour of buyer. Full refund issued.')}
                    className="flex-1 py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none hover:bg-[#007f30] transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    Refund Buyer (${selectedDispute.amount})
                  </button>
                  <button
                    onClick={() => updateDisputeStatus(selectedDispute.id, 'resolved_seller', disputeResolution || 'Resolved in favour of seller. Funds released.')}
                    className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    Release to Seller
                  </button>
                  {selectedDispute.status === 'open' && (
                    <button
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'under_review')}
                      className="px-4 py-2.5 border-2 border-[#FFD100] text-[#856404] rounded-xl text-sm cursor-pointer bg-[#FFD100]/10 hover:bg-[#FFD100]/20 transition-colors"
                      style={{ fontWeight: 700 }}
                    >
                      Mark Under Review
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
