import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import {
  Store, ShoppingBag, ArrowLeft, Eye, EyeOff,
  User, Phone, Mail, Lock, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'select' | 'login' | 'signup';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export const AuthPage = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Determine initial mode from path — no flash
  const initialMode: AuthMode =
    window.location.pathname === '/signup' ? 'signup' :
    window.location.pathname === '/login'  ? 'select'  : 'select';

  const [mode,          setMode]          = useState<AuthMode>(initialMode);
  const [selectedRole,  setSelectedRole]  = useState<'buyer' | 'seller'>('buyer');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [form,          setForm]          = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (+263...)';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doRedirect = (role: 'buyer' | 'seller') => {
    if (redirect === 'checkout') { navigate('/checkout'); return; }
    if (role === 'seller') { navigate('/seller-onboarding'); return; }
    navigate('/shop');
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(selectedRole, selectedRole === 'seller' ? 'Tatenda Moyo (Seller)' : 'Tatenda Moyo', form.phone);
    toast.success('Welcome back!', { description: `Logged in as ${selectedRole}` });
    setLoading(false);
    doRedirect(selectedRole);
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    login(selectedRole, form.name, form.phone, form.email);
    toast.success('Account created!', { description: `Welcome to Msika, ${form.name}!` });
    setLoading(false);
    doRedirect(selectedRole);
  };

  // ── Role-select screen (entry for /login) ─────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-[#009739] rounded-xl flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Welcome to Msika</h2>
            <p className="text-sm text-gray-500">How would you like to continue?</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { role: 'buyer' as const, Icon: ShoppingBag, title: "I'm a Buyer", sub: 'Shop products from local sellers' },
              { role: 'seller' as const, Icon: Store, title: "I'm a Seller", sub: 'Manage my store & receive orders' },
            ].map(({ role, Icon, title, sub }) => (
              <button
                key={role}
                onClick={() => { setSelectedRole(role); setMode('login'); }}
                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#009739] hover:bg-green-50 transition-all group cursor-pointer bg-transparent text-left"
              >
                <div className="w-11 h-11 bg-gray-50 group-hover:bg-white rounded-lg flex items-center justify-center mr-3 shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#009739]" />
                </div>
                <div>
                  <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{title}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mb-4">
            Don't have an account?{' '}
            <button
              onClick={() => { setMode('signup'); setErrors({}); }}
              className="text-[#009739] bg-transparent border-none cursor-pointer p-0"
              style={{ fontWeight: 600 }}
            >
              Sign up free
            </button>
          </p>
          <p className="text-center text-[11px] text-gray-400">
            By continuing, you agree to Msika's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form (with inline role picker) ─────────────────────────────────
  if (mode === 'signup') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="mx-auto w-12 h-12 bg-[#009739] rounded-xl flex items-center justify-center mb-4">
              {selectedRole === 'seller' ? <Store className="w-6 h-6 text-white" /> : <ShoppingBag className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Create your account</h2>
            <p className="text-sm text-gray-500">Join thousands of Zimbabweans on Msika</p>
          </div>

          {/* Inline role selector */}
          <div className="mb-6">
            <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>I want to join as a…</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as 'buyer' | 'seller')}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#009739] cursor-pointer pr-10 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <option value="buyer">🛍️ Buyer — Shop &amp; discover products</option>
                <option value="seller">🏪 Seller — List &amp; sell my products</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-5">
            {/* Full name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Full name *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Tatenda Moyo"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                />
              </div>
              <FieldError msg={errors.name} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Phone number *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                />
              </div>
              <FieldError msg={errors.phone} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>
                Email <span className="text-gray-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200 focus-within:border-[#009739] transition-colors">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="tatenda@example.com"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Password *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                />
                <button onClick={() => setShowPassword(!showPassword)} type="button" className="p-0 bg-transparent border-none cursor-pointer shrink-0">
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Confirm password *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()}
                />
              </div>
              <FieldError msg={errors.confirmPassword} />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors border-none cursor-pointer mb-4 flex items-center justify-center gap-2"
            style={{ fontWeight: 700 }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
            ) : (
              `Create ${selectedRole === 'seller' ? 'Seller' : 'Buyer'} Account`
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => { setMode('select'); setErrors({}); }}
              className="text-[#009739] bg-transparent border-none cursor-pointer p-0"
              style={{ fontWeight: 600 }}
            >
              Log in
            </button>
          </p>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            By signing up, you agree to Msika's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // ── Login form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

        {/* Header — matches signup */}
        <div className="text-center mb-7">
          <div className="mx-auto w-12 h-12 bg-[#009739] rounded-xl flex items-center justify-center mb-4">
            {selectedRole === 'buyer' ? <ShoppingBag className="w-6 h-6 text-white" /> : <Store className="w-6 h-6 text-white" />}
          </div>
          <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Welcome back</h2>
          <p className="text-sm text-gray-500">Log in to your Msika account</p>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Phone number *</label>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+263 77 123 4567"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                disabled={loading}
              />
            </div>
            <FieldError msg={errors.phone} />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Password *</label>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Enter password"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={() => setShowPassword(!showPassword)} type="button" className="p-0 bg-transparent border-none cursor-pointer shrink-0">
                {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>
        </div>

        <div className="text-right mb-4">
          <button
            onClick={() => toast.info('Password reset', { description: 'An OTP will be sent to your phone number.' })}
            className="text-xs text-[#009739] bg-transparent border-none cursor-pointer p-0"
            style={{ fontWeight: 600 }}
          >
            Forgot password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors border-none cursor-pointer mb-4 flex items-center justify-center gap-2"
          style={{ fontWeight: 700 }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Logging in…</>
          ) : 'Log In'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={() => { setMode('signup'); setErrors({}); }}
            className="text-[#009739] bg-transparent border-none cursor-pointer p-0"
            style={{ fontWeight: 600 }}
          >
            Sign up free
          </button>
        </p>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          By continuing, you agree to Msika's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};