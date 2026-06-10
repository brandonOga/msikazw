import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { updatePassword } from '../../lib/db/auth';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword]       = useState('');
  const [confirm,  setConfirm]        = useState('');
  const [showPw,   setShowPw]         = useState(false);
  const [loading,  setLoading]        = useState(false);
  const [done,     setDone]           = useState(false);
  const [errors,   setErrors]         = useState<Record<string, string>>({});
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the recovery token as a hash fragment; the SDK picks it up
  // automatically via detectSessionInUrl. We just need to wait for the session.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    setDone(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#009739] mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-[#009739]" />
            </div>
            <h1 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Password updated!</h1>
            <p className="text-sm text-gray-500">Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Set new password</h1>
            <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>New password</label>
                <div className="flex items-center gap-2 px-3 py-2.5 border rounded-xl bg-gray-50 focus-within:border-[#009739] transition-colors"
                  style={{ borderColor: errors.password ? '#CE1126' : '#e5e5e5' }}>
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
                    placeholder="Min. 8 characters"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="p-0 border-none bg-transparent cursor-pointer text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Confirm password</label>
                <div className="flex items-center gap-2 px-3 py-2.5 border rounded-xl bg-gray-50 focus-within:border-[#009739] transition-colors"
                  style={{ borderColor: errors.confirm ? '#CE1126' : '#e5e5e5' }}>
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: '' })); }}
                    placeholder="Repeat password"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  />
                </div>
                {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                style={{ fontWeight: 700 }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
