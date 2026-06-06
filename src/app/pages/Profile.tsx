import React, { useState } from 'react';
import {
  User, MapPin, Phone, ChevronRight, Star, Package, Heart, Bell,
  Shield, HelpCircle, LogOut, Store, Edit3, X, Loader2, CheckCircle2,
  Mail, Plus, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { toast } from 'sonner';

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateProfile } = useStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    location: user?.location || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    updateProfile({ name: form.name, phone: form.phone, email: form.email, location: form.location });
    setLoading(false);
    setDone(true);
    toast.success('Profile updated!');
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900" style={{ fontWeight: 700 }}>Edit Profile</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-5">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-[#009739] mx-auto mb-3" />
              <p className="text-gray-900" style={{ fontWeight: 700 }}>Profile saved!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { field: 'name', label: 'Full name', placeholder: 'Tatenda Moyo', icon: User, type: 'text' },
                { field: 'phone', label: 'Phone', placeholder: '+263 77 123 4567', icon: Phone, type: 'tel' },
                { field: 'email', label: 'Email', placeholder: 'tatenda@example.com', icon: Mail, type: 'email' },
                { field: 'location', label: 'Location', placeholder: 'Harare, Zimbabwe', icon: MapPin, type: 'text' },
              ].map(({ field, label, placeholder, icon: Icon, type }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>{label}</label>
                  <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${(errors as any)[field] ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type={type}
                      value={(form as any)[field]}
                      onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); }}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                    />
                  </div>
                  {(errors as any)[field] && <p className="text-xs text-red-500 mt-1">{(errors as any)[field]}</p>}
                </div>
              ))}
              <button
                onClick={save}
                disabled={loading}
                className="w-full py-2.5 bg-[#009739] text-white rounded-lg text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ fontWeight: 700 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Saved Addresses Panel ──────────────────────────────────────────────────────
function AddressManager({ onClose }: { onClose: () => void }) {
  const [addresses, setAddresses] = useState([
    { id: 'a1', label: 'Home', address: '12 Nkrumah Ave, Harare CBD' },
    { id: 'a2', label: 'Work', address: '3rd Floor, Corner House, Harare' },
  ]);
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', address: '' });

  const add = () => {
    if (!newAddr.label.trim() || !newAddr.address.trim()) return;
    setAddresses(prev => [...prev, { id: `a${Date.now()}`, ...newAddr }]);
    setNewAddr({ label: '', address: '' });
    setAdding(false);
    toast.success('Address saved');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900" style={{ fontWeight: 700 }}>Delivery Addresses</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {addresses.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <MapPin className="w-4 h-4 text-[#009739] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{a.label}</p>
                <p className="text-xs text-gray-500">{a.address}</p>
              </div>
              <button
                onClick={() => { setAddresses(p => p.filter(x => x.id !== a.id)); toast.success('Address removed'); }}
                className="p-1 bg-transparent border-none cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {adding ? (
            <div className="space-y-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <input value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} placeholder="Label (e.g. Home)" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#009739]" />
              <input value={newAddr.address} onChange={e => setNewAddr(p => ({ ...p, address: e.target.value }))} placeholder="Full address" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#009739]" />
              <div className="flex gap-2">
                <button onClick={add} className="flex-1 py-2 bg-[#009739] text-white rounded-lg text-xs border-none cursor-pointer" style={{ fontWeight: 700 }}>Add</button>
                <button onClick={() => setAdding(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs border-none cursor-pointer" style={{ fontWeight: 600 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-transparent"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" /> Add new address
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Notifications Panel ────────────────────────────────────────────────────────
function NotifsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useStore();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900" style={{ fontWeight: 700 }}>Notifications</p>
          <div className="flex items-center gap-3">
            <button onClick={markAllRead} className="text-xs text-[#009739] bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 600 }}>Mark all read</button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
          {notifications.map(n => (
            <div key={n.id} className="px-5 py-3.5" style={{ background: n.read ? '#fff' : 'rgba(0,151,57,0.04)' }}>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? '#d1d5db' : '#009739' }} />
                <div>
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export function Profile() {
  const navigate = useNavigate();
  const { user, logout, wishlist, placedOrders, unreadCount } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const totalOrders = placedOrders.length;

  const menuSections = [
    {
      title: 'Shopping',
      items: [
        { icon: Package, label: 'My Orders', sub: `${totalOrders} orders`, path: '/orders' },
        { icon: Heart, label: 'Wishlist', sub: `${wishlist.length} saved`, path: '/shop' },
        { icon: Store, label: 'Browse Shops', sub: 'Discover sellers', path: '/shop' },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Bell, label: 'Notifications',
          sub: unreadCount > 0 ? `${unreadCount} unread` : 'All read',
          action: () => setShowNotifs(true),
        },
        { icon: MapPin, label: 'Delivery Addresses', sub: '2 saved', action: () => setShowAddresses(true) },
        { icon: Shield, label: 'Privacy & Security', action: () => toast.info('Privacy settings', { description: 'Coming soon.' }) },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', action: () => toast.info('Help centre', { description: 'Visit help.msika.co.zw' }) },
        {
          icon: Store,
          label: user?.role === 'seller' ? 'Seller Dashboard' : 'Become a Seller',
          sub: user?.role === 'seller' ? 'Manage your shop' : 'Open your shop free',
          path: user?.role === 'seller' ? '/seller-dashboard' : '/seller-onboarding',
        },
      ],
    },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="bg-white min-h-screen">
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showAddresses && <AddressManager onClose={() => setShowAddresses(false)} />}
      {showNotifs && <NotifsPanel onClose={() => setShowNotifs(false)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl text-gray-900 mb-6" style={{ fontWeight: 900 }}>My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Profile card */}
          <div>
            <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-[#009739] flex items-center justify-center text-white text-xl" style={{ fontWeight: 800 }}>
                  {(user?.name || 'T').charAt(0)}
                </div>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <h2 className="text-base text-gray-900 mb-1" style={{ fontWeight: 800 }}>{user?.name || 'Tatenda Moyo'}</h2>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{user?.phone || '+263 77 123 4567'}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{user?.location || 'Harare, Zimbabwe'}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3" fill="none" color="#f5a623" />
                  ))}
                </div>
                <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>Trusted {user?.role || 'Buyer'}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white border border-[#EAEAEA] rounded-xl p-4 grid grid-cols-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {[
                { label: 'Orders', value: totalOrders },
                { label: 'Reviews', value: 7 },
                { label: 'Saved', value: wishlist.length },
              ].map((stat, idx) => (
                <div key={stat.label} className="text-center" style={{ borderRight: idx < 2 ? '1px solid #f0f0f0' : 'none' }}>
                  <p className="text-lg text-gray-900" style={{ fontWeight: 900 }}>{stat.value}</p>
                  <p className="text-[11px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu sections */}
          <div className="space-y-5">
            {menuSections.map(section => (
              <div key={section.title}>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2" style={{ fontWeight: 700 }}>{section.title}</p>
                <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {section.items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          if ((item as any).path) navigate((item as any).path);
                          else if ((item as any).action) (item as any).action();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-none cursor-pointer bg-transparent"
                        style={{ borderBottom: idx < section.items.length - 1 ? '1px solid #f5f5f5' : 'none' }}
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <ItemIcon className="w-4 h-4 text-gray-500" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{item.label}</p>
                          {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Become seller CTA */}
            {user?.role !== 'seller' && (
              <div className="bg-[#009739] rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white" style={{ fontWeight: 800 }}>Open your own shop</p>
                  <p className="text-xs text-white/80">Join 700+ sellers — free to start</p>
                </div>
                <button
                  onClick={() => navigate('/seller-onboarding')}
                  className="shrink-0 px-4 py-2 bg-white text-[#009739] rounded-lg text-xs border-none cursor-pointer"
                  style={{ fontWeight: 800 }}
                >
                  Start now
                </button>
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-red-600 text-sm cursor-pointer hover:bg-red-50 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}