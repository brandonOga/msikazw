import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { Package, Bell, User, Mail, MapPin, Wallet, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Orders } from './Orders';
import { NotificationsPage } from './NotificationsPage';
import { PhoneInput, joinPhone, splitPhone } from '../components/PhoneInput';
import { ZIM_CITIES } from '../data/mockData';
import { MsikaLogo } from '../components/MsikaLogo';

type Tab = 'orders' | 'notifications' | 'profile';

// ─── Simple buyer profile form ─────────────────────────────────────────────
function BuyerProfileForm() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneCode, setPhoneCode] = useState(() => splitPhone(user?.phone || '')[0]);
  const [phoneNumber, setPhoneNumber] = useState(() => splitPhone(user?.phone || '')[1]);
  const [location, setLocation] = useState(user?.location || '');
  const [payCode, setPayCode] = useState(() => splitPhone(user?.preferredPayment || '')[0]);
  const [payNumber, setPayNumber] = useState(() => splitPhone(user?.preferredPayment || '')[1]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateProfile({
      name,
      phone: joinPhone(phoneCode, phoneNumber),
      location,
      preferredPayment: joinPhone(payCode, payNumber),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profile</h1>
      <p className="text-sm text-gray-500 mt-1">Your details and payment preferences.</p>

      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 flex flex-col gap-5">
        <div>
          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Full name</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#009739] transition-colors">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Email address</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#009739] transition-colors">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Phone number</label>
          <PhoneInput
            code={phoneCode}
            onCodeChange={setPhoneCode}
            number={phoneNumber}
            onNumberChange={setPhoneNumber}
            inputClassName="rounded-xl py-2.5"
            selectClassName="rounded-xl py-2.5"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Location</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-[#009739] transition-colors">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 cursor-pointer">
              <option value="">Select your city</option>
              {ZIM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Preferred mobile money number</label>
          <PhoneInput
            code={payCode}
            onCodeChange={setPayCode}
            number={payNumber}
            onNumberChange={setPayNumber}
            inputClassName="rounded-xl py-2.5"
            selectClassName="rounded-xl py-2.5"
          />
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><Wallet className="w-3 h-3" />Used to pre-fill EcoCash/OneMoney at checkout</p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 700 }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && !saving && <span className="text-sm text-[#009739]" style={{ fontWeight: 600 }}>Saved.</span>}
        </div>
      </div>
    </div>
  );
}

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'orders',        icon: Package, label: 'My Orders' },
  { id: 'notifications', icon: Bell,    label: 'Notifications' },
  { id: 'profile',       icon: User,    label: 'Profile' },
];

// ─── Compact profile menu (avatar + logout, folded into the single header row) ──
function ProfileMenu() {
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
    localStorage.removeItem('msika_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#009739' }}>
          <span className="text-white text-xs" style={{ fontWeight: 700 }}>{initials}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50" style={{ border: '1px solid #e5e7eb' }}>
          <button
            onClick={() => { navigate('/shop'); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
          >
            <ShoppingBag className="w-4 h-4 text-gray-400" /> Continue Shopping
          </button>
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
  );
}

export function BuyerDashboard() {
  const { unreadCount } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = TABS.some(t => t.id === searchParams.get('tab'))
    ? (searchParams.get('tab') as Tab)
    : 'orders';
  const [tab, setTab] = useState<Tab>(initialTab);

  // React to ?tab= changes even when this page is already mounted (e.g.
  // clicking a notification in the header bell while already on this page).
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (TABS.some(t => t.id === tabParam)) setTab(tabParam as Tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const selectTab = (id: Tab) => {
    setTab(id);
    setSearchParams(id === 'orders' ? {} : { tab: id }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single-row header: logo + tabs + profile menu, matching the mockup */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-1">
          <Link to="/" className="flex items-center pr-5 shrink-0 no-underline">
            <MsikaLogo size="md" />
          </Link>
          <div className="flex gap-1 overflow-x-auto">
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
          <div className="flex-1" />
          <ProfileMenu />
        </div>
      </div>

      {tab === 'orders' && <Orders />}
      {tab === 'notifications' && <NotificationsPage />}
      {tab === 'profile' && <BuyerProfileForm />}
    </div>
  );
}
