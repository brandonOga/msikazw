import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

interface DomainGuardProps {
  children: React.ReactNode;
}

export const DomainGuard: React.FC<DomainGuardProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const checkAuthorization = () => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;

    // 1. Local development is always allowed
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local')
    ) {
      setIsAuthorized(true);
      return;
    }

    // 2. Official domains and their subdomains
    const allowedDomains = ['msika.shop', 'kawerifytech.com', 'vercel.app'];
    const isOfficialDomain = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );

    if (isOfficialDomain) {
      setIsAuthorized(true);
      return;
    }

    // 3. Check local storage permission token
    const hasPermission = localStorage.getItem('msika_domain_access_granted') === 'true';
    if (hasPermission) {
      setIsAuthorized(true);
      return;
    }

    // If none of the above match, prompt for passcode
    setIsAuthorized(false);
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Predefined code and environment variable check
    const expectedPasscode = import.meta.env.VITE_ACCESS_PASSCODE || 'kawerifytech2026';

    if (passcode.trim() === expectedPasscode) {
      localStorage.setItem('msika_domain_access_granted', 'true');
      setIsAuthorized(true);
    } else {
      setError('Invalid authorization code. Please check and try again.');
    }
  };

  // Loading state (while checking hostname)
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#009739]"></div>
      </div>
    );
  }

  // Render original app if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Otherwise, render the premium Access Denied page
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#009739]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Main glassmorphism card */}
      <div className="relative w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl text-center z-10 transition-all duration-300">
        
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/40 border border-red-900/30 flex items-center justify-center mb-6 text-red-400 animate-pulse">
          <ShieldAlert size={32} />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          Unauthorized Hostname
        </h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Access to this copy of the application is restricted. It is licensed exclusively for <span className="text-white font-medium">msika.shop</span> and <span className="text-white font-medium">kawerifytech.com</span>.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="passcode" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Authorization Passcode
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound size={18} />
              </span>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter authorization code"
                className="w-full bg-gray-950/85 border border-gray-800 focus:border-[#009739] text-white rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder-gray-600 focus:ring-1 focus:ring-[#009739]"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1 font-medium bg-red-950/20 border border-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#009739] hover:bg-[#007f30] text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#009739]/10"
          >
            <span>Verify Access</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-800/60 text-xs text-gray-500">
          Powered by <span className="text-gray-400">Kawerifytech</span>
        </div>
      </div>
    </div>
  );
};
