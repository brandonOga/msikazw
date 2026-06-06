import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Handles the email confirmation redirect from Supabase.
 * Supabase redirects to this page with token_hash + type in the URL after
 * the user clicks the confirmation link in their email.
 */
export function AuthConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type      = params.get('type') as 'email' | 'signup' | null;

    if (!tokenHash || !type) {
      // No token — might be a direct visit; just redirect to login
      navigate('/login', { replace: true });
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: type === 'signup' ? 'signup' : 'email' })
      .then(({ error }) => {
        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          // Brief delay so the user sees the success state, then redirect
          setTimeout(() => navigate('/shop', { replace: true }), 2000);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-[#009739] mb-4" />
          <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Confirming your email…</h2>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5" style={{ border: '3px solid #009739' }}>
            <CheckCircle2 className="w-8 h-8 text-[#009739]" />
          </div>
          <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Email confirmed!</h2>
          <p className="text-sm text-gray-500">You're all set. Redirecting you to the shop…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>Confirmation failed</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">{message || 'The link may have expired. Please try signing up again.'}</p>
          <button
            onClick={() => navigate('/signup', { replace: true })}
            className="px-6 py-2.5 bg-[#009739] text-white rounded-xl text-sm border-none cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Back to sign up
          </button>
        </>
      )}
    </div>
  );
}
