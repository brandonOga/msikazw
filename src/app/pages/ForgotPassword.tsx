import React, { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '../../lib/db/auth';

export const ForgotPassword = () => {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await requestPasswordReset(email.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <Link to="/login" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 no-underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-[#009739]" />
            </div>
            <h1 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Check your email</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to continue.
            </p>
            <Link to="/login" className="text-sm text-[#009739] no-underline" style={{ fontWeight: 600 }}>
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Forgot password?</h1>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Email address</label>
                <div className="flex items-center gap-2 px-3 py-2.5 border rounded-xl bg-gray-50 focus-within:border-[#009739] transition-colors"
                  style={{ borderColor: error ? '#CE1126' : '#e5e5e5' }}>
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                style={{ fontWeight: 700 }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
