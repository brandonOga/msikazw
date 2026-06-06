import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export const AdminLogin = () => {
  const { loginWithEmail, user, authLoading } = useStore();
  const navigate = useNavigate();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState<{ email?: string; password?: string }>({});

  // If already logged in as admin, redirect straight away
  if (!authLoading && user?.role === 'admin') {
    navigate('/admin-dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await loginWithEmail(email, password, 'buyer'); // role resolved from DB
    setLoading(false);

    if (error) {
      toast.error('Login failed', { description: 'Invalid email or password.' });
      setErrors({ password: 'Invalid email or password' });
      return;
    }

    // Check role after login
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem('msika_user') || 'null');
      if (stored?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        toast.error('Access denied', { description: 'This account does not have admin privileges.' });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / badge */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,151,57,0.15)', border: '1.5px solid rgba(0,151,57,0.4)' }}>
            <Shield className="w-7 h-7 text-[#009739]" />
          </div>
          <h1 className="text-white mb-1" style={{ fontWeight: 900, fontSize: '1.5rem' }}>Admin Portal</h1>
          <p className="text-gray-500 text-sm">Msika Marketplace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Email */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5" style={{ fontWeight: 600 }}>Email address</label>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${errors.email ? 'border-red-500 bg-red-950/20' : 'border-white/10 bg-white/5 focus-within:border-[#009739]'}`}>
              <Mail className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                placeholder="admin@msika.com"
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-600"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5" style={{ fontWeight: 600 }}>Password</label>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${errors.password ? 'border-red-500 bg-red-950/20' : 'border-white/10 bg-white/5 focus-within:border-[#009739]'}`}>
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Enter your password"
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-600"
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                className="p-0 bg-transparent border-none cursor-pointer shrink-0"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4 text-gray-500" />
                  : <Eye className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            style={{ background: '#009739', color: '#fff', fontWeight: 700 }}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              : 'Sign In to Admin'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Authorised personnel only · Msika Marketplace
        </p>
      </div>
    </div>
  );
};
