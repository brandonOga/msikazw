import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MsikaLogo } from '../components/MsikaLogo';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export const AuthPage = () => {
  const { loginWithEmail } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [loading,      setLoading]      = useState(false);
  const [form,         setForm]         = useState({ email: '', password: '' });
  const [errors,       setErrors]       = useState<Record<string, string>>({});

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

  const doRedirectByRole = (role: string) => {
    if (role === 'admin') {
      toast.error('Access denied', { description: 'Please use the admin login page.' });
      return;
    }
    if (redirect === 'checkout') { navigate('/checkout'); return; }
    if (role === 'seller') { navigate('/seller-dashboard'); return; }
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center mb-7">
          <Link to="/" className="inline-block mb-4 no-underline">
            <MsikaLogo size="lg" />
          </Link>
          <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Welcome back</h2>
          <p className="text-sm text-gray-500">Log in to your Msika account.</p>
        </div>

        <div className="space-y-4 mb-5">
          {/* Email */}
          <div>
            <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Email address</label>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="tendai@email.com"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-baseline justify-between">
              <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Password</label>
              <a href="/forgot-password" className="text-xs text-[#009739] hover:underline" style={{ fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Enter your password"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <FieldError msg={errors.password} />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors border-none cursor-pointer mb-4 flex items-center justify-center gap-2"
          style={{ fontWeight: 700 }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Log in'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#009739]" style={{ fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
