import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { useStore } from '../context/StoreContext';
import {
  Store, ShoppingBag, Eye, EyeOff,
  User, Phone, Mail, Lock, Loader2, MailCheck, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { resendConfirmationEmail } from '../../lib/db/auth';

type AuthMode = 'select' | 'login' | 'signup' | 'verify-otp';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export const AuthPage = () => {
  const { loginWithEmail, signUpWithEmail, verifyEmailOtp } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [mode, setMode] = useState<AuthMode>(
    location.pathname === '/signup' ? 'signup' : 'select'
  );

  // Sync mode when user navigates between /login and /signup
  useEffect(() => {
    if (location.pathname === '/signup') setMode('signup');
    else if (location.pathname === '/login') setMode('select');
  }, [location.pathname]);
  const [selectedRole,  setSelectedRole]  = useState<'buyer' | 'seller'>('buyer');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [resending,     setResending]     = useState(false);
  const [otp,           setOtp]           = useState('');
  const [otpError,      setOtpError]      = useState('');
  const [form,          setForm]          = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.phone.trim() && !/^\+?[\d\s]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (+263...)';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doRedirectByRole = (role: string) => {
    if (redirect === 'checkout') { navigate('/checkout'); return; }
    if (role === 'admin')  { navigate('/admin-dashboard'); return; }
    if (role === 'seller') { navigate('/seller-dashboard'); return; }
    navigate('/shop');
  };

  const doRedirect = (role: 'buyer' | 'seller') => {
    if (redirect === 'checkout') { navigate('/checkout'); return; }
    if (role === 'seller') { navigate('/seller-onboarding'); return; }
    navigate('/shop');
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    const { error } = await loginWithEmail(form.email, form.password, 'buyer'); // role ignored — real role comes from DB
    setLoading(false);
    if (error) {
      toast.error('Login failed', { description: error });
      setErrors({ email: ' ', password: 'Invalid email or password' });
      return;
    }
    toast.success('Welcome back!');
    // Redirect based on actual role from DB (set by onAuthStateChange)
    // Small delay to let context update with the real role
    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem('msika_user') || 'null');
      doRedirectByRole(storedUser?.role || 'buyer');
    }, 300);
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUpWithEmail({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone || undefined,
      role: selectedRole,
    });
    setLoading(false);
    if (error) {
      toast.error('Sign up failed', { description: error });
      return;
    }
    if (needsEmailConfirmation) {
      setMode('verify-otp');
      return;
    }
    toast.success('Account created!', { description: `Welcome to Msika, ${form.name}!` });
    doRedirect(selectedRole);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code from your email'); return; }
    setLoading(true);
    setOtpError('');
    const { error } = await verifyEmailOtp(form.email, otp);
    setLoading(false);
    if (error) { setOtpError('Invalid or expired code. Try resending.'); return; }
    toast.success('Email verified!', { description: `Welcome to Msika, ${form.name}!` });
    doRedirect(selectedRole);
  };

  const handleResendEmail = async () => {
    setResending(true);
    setOtp('');
    setOtpError('');
    await resendConfirmationEmail(form.email);
    setResending(false);
    toast.success('Code resent!', { description: `Check your inbox at ${form.email}` });
  };

  // ── OTP verification screen ───────────────────────────────────────────────
  if (mode === 'verify-otp') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5" style={{ border: '3px solid #009739' }}>
            <MailCheck className="w-8 h-8 text-[#009739]" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 900 }}>Verify your email</h2>
          <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
          <p className="text-sm text-[#009739] mb-6" style={{ fontWeight: 700 }}>{form.email}</p>

          {/* OTP boxes */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: 6 }, (_, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i] || ''}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  const next = otp.split('');
                  next[i] = val.slice(-1);
                  const joined = next.join('').slice(0, 6);
                  setOtp(joined);
                  setOtpError('');
                  if (val && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !otp[i] && i > 0)
                    (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus();
                }}
                onPaste={e => {
                  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  setOtp(pasted);
                  setOtpError('');
                  const nextFocus = Math.min(pasted.length, 5);
                  (document.getElementById(`otp-${nextFocus}`) as HTMLInputElement)?.focus();
                  e.preventDefault();
                }}
                className="w-11 h-12 text-center text-xl border-2 rounded-xl outline-none transition-all"
                style={{
                  fontWeight: 800,
                  borderColor: otpError ? '#CE1126' : otp[i] ? '#009739' : '#e5e7eb',
                  background: otp[i] ? 'rgba(0,151,57,0.04)' : '#fafafa',
                }}
              />
            ))}
          </div>

          {otpError && <p className="text-xs text-red-500 mb-4">{otpError}</p>}

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm border-none cursor-pointer mb-3 transition-colors"
            style={{ fontWeight: 700 }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-white disabled:opacity-60 mb-3"
            style={{ fontWeight: 600 }}
          >
            {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {resending ? 'Sending…' : 'Resend code'}
          </button>

          <p className="text-xs text-gray-400">Didn't get it? Check your spam folder.</p>
        </div>
      </div>
    );
  }

  // ── Login screen — email + password, no role selection ───────────────────
  if (mode === 'select' || mode === 'login') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center mb-7">
            <div className="mx-auto w-12 h-12 bg-[#009739] rounded-xl flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your Msika account</p>
          </div>

          <div className="space-y-4 mb-5">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Email address *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Password *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button onClick={() => setShowPassword(!showPassword)} type="button" className="p-0 bg-transparent border-none cursor-pointer shrink-0">
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
              <div className="text-right mt-1">
                <a href="/forgot-password" className="text-xs text-[#009739] hover:underline" style={{ fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors border-none cursor-pointer mb-4 flex items-center justify-center gap-2"
            style={{ fontWeight: 700 }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-500 mb-2">
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

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Email address *</label>
              <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="tatenda@example.com"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  disabled={loading}
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>
                Phone number <span className="text-gray-400">(optional)</span>
              </label>
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

  // Fallback (should not reach here)
  return null;
};