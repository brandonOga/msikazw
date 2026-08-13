import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  User, Store, ShoppingBag, ChevronRight, ChevronLeft, Loader2,
  Mail, Lock, MapPin, AlertCircle, Upload, X, Check, MailCheck, RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/mockData';
import { toast } from 'sonner';
import { uploadSellerImage } from '../../lib/storage';
import { resendConfirmationEmail } from '../../lib/db/auth';
import { PhoneInput, joinPhone } from '../components/PhoneInput';
import { MsikaLogo } from '../components/MsikaLogo';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'buyer' | 'seller';
type Step = 'splash' | 'role' | 'form' | 'branding' | 'review' | 'otp' | 'success' | 'pending';

interface BuyerFormData {
  name: string; email: string; password: string; confirmPassword: string;
  phone: string; location: string;
}
interface SellerFormData {
  name: string; email: string; password: string; confirmPassword: string;
  businessName: string; businessType: string; category: string; description: string;
  ecocashPhone: string; whatsapp: string; address: string;
  bankName: string; bankAccount: string;
}

const BUSINESS_TYPES = ['Individual Seller', 'Small Business', 'Partnership', 'Registered Company'];
const ZIM_CITIES = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Chitungwiza', 'Other'];

// Buyer flow: role → form → otp. Seller flow: role → form → branding → review → otp.
const BUYER_DOTS: Record<Step, number> = { splash: -1, role: 0, form: 1, branding: -1, review: -1, otp: 2, success: -1, pending: -1 };
const SELLER_DOTS: Record<Step, number> = { splash: -1, role: 0, form: 1, branding: 2, review: 3, otp: 4, success: -1, pending: -1 };

// ─── Shared field atoms ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> {msg}</p>;
}

function InputField({
  label, value, onChange, placeholder, type = 'text', icon: Icon, error, required, disabled, full,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
  icon?: React.ElementType; error?: string; required?: boolean; disabled?: boolean; full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-3 border transition-all ${
        error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus-within:border-[#009739] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#009739]/10'
      }`}>
        {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 disabled:text-gray-400"
        />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function PasswordField({
  label, value, onChange, placeholder, error,
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string; error?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>{label} *</label>
      <div className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-3 border transition-all ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="password" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900" />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, error, required, placeholder, full,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
  error?: string; required?: boolean; placeholder?: string; full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition-all appearance-none bg-gray-50 cursor-pointer ${
          error ? 'border-red-400' : 'border-gray-200 focus:border-[#009739] focus:ring-2 focus:ring-[#009739]/10'
        } ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <option value="">{placeholder || 'Select…'}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <FieldError msg={error} />
    </div>
  );
}

// ─── Section label (groups fields for quick scanning) ──────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-gray-400 mb-3 pb-2 border-b border-gray-100" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
    </p>
  );
}

// ─── Back button + progress dots ────────────────────────────────────────────
function StepHeader({ onBack, activeDot, totalDots }: { onBack: () => void; activeDot: number; totalDots: number }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
        <ChevronLeft className="w-4 h-4 text-gray-900" />
      </button>
      <div className="flex gap-1.5">
        {Array.from({ length: totalDots }, (_, i) => (
          <div key={i} className="h-1 rounded-full" style={{ width: 28, background: i <= activeDot ? '#009739' : '#e5e7eb' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Logo/banner upload box ─────────────────────────────────────────────────
function BrandingUploadBox({
  label, hint, url, uploading, onUpload,
}: {
  label: string; hint: string; url: string | null; uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>{label}</label>
      {url ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#009739] bg-green-50">
          <div className="w-8 h-8 rounded-lg bg-[#009739] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <p className="flex-1 text-sm text-[#009739] truncate" style={{ fontWeight: 600 }}>Added — tap to remove</p>
          <button onClick={() => onUpload(null as unknown as File)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : uploading ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
          <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
          <p className="text-sm text-gray-600">Uploading…</p>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all"
          style={{ borderColor: dragging ? '#009739' : '#e5e7eb', background: dragging ? 'rgba(0,151,57,0.04)' : '#fafafa' }}
        >
          <Upload className="w-5 h-5 text-gray-400" />
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (file) onUpload(file);
      }} />
    </div>
  );
}

// ─── Shell ──────────────────────────────────────────────────────────────────
function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-white p-8 rounded-xl border border-gray-200 shadow-sm`}>
        {children}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, onboardingStatus, signUpWithEmail, verifyEmailOtp, updateProfile, submitSellerApplication } = useStore();

  const alreadyAuthed = !!user;
  const [role, setRole] = useState<Role>(searchParams.get('role') === 'seller' ? 'seller' : 'buyer');
  const [step, setStep] = useState<Step>(() => {
    if (alreadyAuthed) {
      if (onboardingStatus === 'pending' || onboardingStatus === 'approved') return 'pending';
      return 'form'; // existing buyer upgrading to seller — straight to the business form
    }
    return searchParams.get('role') ? 'form' : 'splash';
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [buyerForm, setBuyerForm] = useState<BuyerFormData>({
    name: '', email: '', password: '', confirmPassword: '', phone: '', location: '',
  });
  const [sellerForm, setSellerForm] = useState<SellerFormData>({
    name: user?.name || '', email: '', password: '', confirmPassword: '',
    businessName: '', businessType: '', category: '', description: '',
    ecocashPhone: user?.phone || '', whatsapp: user?.phone || '', address: '',
    bankName: '', bankAccount: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resending, setResending] = useState(false);
  const pendingEmail = role === 'seller' ? sellerForm.email : buyerForm.email;

  const [bPhoneCode, setBPhoneCode] = useState('+263');
  const [bPhoneNumber, setBPhoneNumber] = useState('');
  const [ecoCode, setEcoCode] = useState('+263');
  const [ecoNumber, setEcoNumber] = useState('');
  const [waCode, setWaCode] = useState('+263');
  const [waNumber, setWaNumber] = useState('');

  const goTo = (s: Step) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const dots = role === 'seller' ? SELLER_DOTS : BUYER_DOTS;
  const totalDots = role === 'seller' ? 5 : 3;

  // ── Validation ────────────────────────────────────────────────────────────
  const validateBuyerForm = () => {
    const e: Record<string, string> = {};
    if (!buyerForm.name.trim()) e.name = 'Full name is required';
    if (!buyerForm.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email.trim())) e.email = 'Enter a valid email address';
    if (!buyerForm.password) e.password = 'Password is required';
    else if (buyerForm.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (buyerForm.password !== buyerForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!bPhoneNumber.trim()) e.phone = 'Phone number is required';
    if (!buyerForm.location) e.location = 'Select your city';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSellerForm = () => {
    const e: Record<string, string> = {};
    if (!alreadyAuthed) {
      if (!sellerForm.name.trim()) e.name = 'Full name is required';
      if (!sellerForm.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerForm.email.trim())) e.email = 'Enter a valid email address';
      if (!sellerForm.password) e.password = 'Password is required';
      else if (sellerForm.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (sellerForm.password !== sellerForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (!sellerForm.businessName.trim()) e.businessName = 'Store name is required';
    if (!sellerForm.businessType) e.businessType = 'Select a business type';
    if (!sellerForm.category) e.category = 'Select a category';
    if (!sellerForm.description.trim()) e.description = 'Description is required';
    else if (sellerForm.description.trim().length < 20) e.description = 'Please write at least 20 characters';
    if (!ecoNumber.trim()) e.ecocashPhone = 'Mobile money number is required';
    if (!waNumber.trim()) e.whatsapp = 'WhatsApp number is required';
    if (!sellerForm.address.trim()) e.address = 'Business address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleFormNext = () => {
    if (role === 'buyer') {
      if (!validateBuyerForm()) return;
      setBuyerForm(f => ({ ...f, phone: joinPhone(bPhoneCode, bPhoneNumber) }));
      handleCredentialsSubmit('buyer');
      return;
    }
    if (!validateSellerForm()) return;
    setSellerForm(f => ({ ...f, ecocashPhone: joinPhone(ecoCode, ecoNumber), whatsapp: joinPhone(waCode, waNumber) }));
    goTo('branding');
  };

  // Buyers have nothing left to collect after the single form — sign up now.
  // Sellers still have branding/review, so account creation happens at the
  // end of review instead (see handleReviewSubmit).
  const handleCredentialsSubmit = async (r: Role) => {
    setLoading(true);
    const data = r === 'buyer' ? buyerForm : sellerForm;
    const phone = r === 'buyer' ? joinPhone(bPhoneCode, bPhoneNumber) : joinPhone(ecoCode, ecoNumber);
    const { error, needsEmailConfirmation } = await signUpWithEmail({
      email: data.email, password: data.password, name: data.name, phone, role: r,
    });
    setLoading(false);
    if (error) { toast.error('Sign up failed', { description: error }); return; }
    if (needsEmailConfirmation) { goTo('otp'); return; }
    // Email confirmation disabled in this Supabase project — skip straight through.
    if (r === 'buyer') { await updateProfile({ location: buyerForm.location }); goTo('success'); }
  };

  const handleReviewSubmit = async () => {
    if (!agreedTerms || !agreedAge) return;
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUpWithEmail({
      email: sellerForm.email, password: sellerForm.password, name: sellerForm.name,
      phone: joinPhone(ecoCode, ecoNumber), role: 'seller',
    });
    setLoading(false);
    if (error) { toast.error('Sign up failed', { description: error }); return; }
    if (needsEmailConfirmation) { goTo('otp'); return; }
    await submitApplication();
  };

  // Already-authenticated buyer upgrading to seller — no signup step at all.
  const handleUpgradeSubmit = async () => {
    if (!agreedTerms || !agreedAge) return;
    await submitApplication();
  };

  const submitApplication = async () => {
    setLoading(true);
    const result = await submitSellerApplication({
      businessName: sellerForm.businessName,
      businessType: sellerForm.businessType,
      category: sellerForm.category,
      phone: sellerForm.ecocashPhone,
      whatsapp: sellerForm.whatsapp,
      city: '',
      address: sellerForm.address,
      description: sellerForm.description,
      documents: [],
      logoUrl: logoUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
      bankName: sellerForm.bankName || undefined,
      bankAccount: sellerForm.bankAccount || undefined,
    });
    setLoading(false);
    if (!result.success) { toast.error(result.error || 'Failed to submit seller application.'); return; }
    goTo('success');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code from your email'); return; }
    setLoading(true);
    setOtpError('');
    const { error } = await verifyEmailOtp(pendingEmail, otp);
    setLoading(false);
    if (error) { setOtpError('Invalid or expired code. Try resending.'); return; }
    if (role === 'buyer') {
      await updateProfile({ location: buyerForm.location });
      goTo('success');
    } else {
      await submitApplication();
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setOtp('');
    setOtpError('');
    const { error } = await resendConfirmationEmail(pendingEmail);
    setResending(false);
    if (error) { toast.error('Could not resend code', { description: error }); return; }
    toast.success('Code resent!', { description: `Check your inbox at ${pendingEmail}` });
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) { setLogoUrl(null); return; }
    if (alreadyAuthed && user) {
      setLogoUploading(true);
      const { url, error } = await uploadSellerImage(user.id, 'logo', file);
      setLogoUploading(false);
      if (error || !url) { toast.error(error ?? 'Failed to upload logo'); return; }
      setLogoUrl(url);
    } else {
      // Not authenticated yet (account is created later, at review) — hold the
      // file locally as a preview only; it gets uploaded once signup succeeds.
      setLogoUrl(URL.createObjectURL(file));
    }
  };
  const handleBannerUpload = async (file: File | null) => {
    if (!file) { setBannerUrl(null); return; }
    if (alreadyAuthed && user) {
      setBannerUploading(true);
      const { url, error } = await uploadSellerImage(user.id, 'banner', file);
      setBannerUploading(false);
      if (error || !url) { toast.error(error ?? 'Failed to upload cover photo'); return; }
      setBannerUrl(url);
    } else {
      setBannerUrl(URL.createObjectURL(file));
    }
  };

  const backFromForm = () => goTo('role');
  const backFromOtp = () => goTo(role === 'seller' ? 'review' : 'form');

  // ── Already pending/approved ────────────────────────────────────────────
  if (step === 'pending') {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4" style={{ border: '3px solid #009739' }}>
            <Store className="w-7 h-7 text-[#009739]" />
          </div>
          <h2 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 800 }}>
            {onboardingStatus === 'approved' ? "You're already a seller!" : 'Application already submitted'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {onboardingStatus === 'approved'
              ? 'Your store is live on Msika.'
              : 'Your seller application is under review. We\'ll notify you once it\'s approved.'}
          </p>
          <button
            onClick={() => navigate(onboardingStatus === 'approved' ? '/seller-dashboard' : '/profile')}
            className="w-full py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 700 }}
          >
            {onboardingStatus === 'approved' ? 'Go to my dashboard' : 'Back to profile'}
          </button>
        </div>
      </Shell>
    );
  }

  // ── Splash ───────────────────────────────────────────────────────────────
  if (step === 'splash') {
    return (
      <Shell wide>
        <div className="text-center py-10">
          <div className="flex justify-center mb-5">
            <MsikaLogo size="xl" />
          </div>
          <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">Buy and sell with people in your community.</p>
          <button onClick={() => goTo('role')} className="mt-8 px-11 py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors" style={{ fontWeight: 700 }}>
            Get started
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-[#009739]" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </Shell>
    );
  }

  // ── Role select ──────────────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <Shell wide>
        <StepHeader onBack={() => goTo('splash')} activeDot={dots.role} totalDots={totalDots} />
        <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Join Msika</h2>
        <p className="text-sm text-gray-500 mb-7">How would you like to get started?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setRole('buyer'); goTo('form'); }}
            className="text-left bg-white border border-gray-200 hover:border-[#009739] rounded-2xl p-6 flex flex-col gap-3.5 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,151,57,0.1)' }}>
              <ShoppingBag className="w-5 h-5 text-[#009739]" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1rem' }}>I'm a Buyer</p>
              <p className="text-gray-500 text-sm mt-1">Browse and buy from local sellers</p>
            </div>
          </button>
          <button
            onClick={() => { setRole('seller'); goTo('form'); }}
            className="text-left bg-white border border-gray-200 hover:border-[#009739] rounded-2xl p-6 flex flex-col gap-3.5 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,151,57,0.1)' }}>
              <Store className="w-5 h-5 text-[#009739]" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1rem' }}>I'm a Seller</p>
              <p className="text-gray-500 text-sm mt-1">List products and reach buyers nearby</p>
            </div>
          </button>
        </div>
      </Shell>
    );
  }

  // ── Form step ────────────────────────────────────────────────────────────
  if (step === 'form') {
    if (role === 'buyer') {
      return (
        <Shell>
          <StepHeader onBack={backFromForm} activeDot={dots.form} totalDots={totalDots} />
          <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Tell us about you</h2>
          <p className="text-sm text-gray-500 mb-7">Just the basics to get you browsing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
            <InputField full label="Full name" value={buyerForm.name} onChange={v => setBuyerForm(f => ({ ...f, name: v }))} placeholder="Tendai Moyo" icon={User} error={errors.name} required />
            <InputField full label="Email address" value={buyerForm.email} onChange={v => setBuyerForm(f => ({ ...f, email: v }))} placeholder="tendai@email.com" type="email" icon={Mail} error={errors.email} required />
            <PasswordField label="Password" value={buyerForm.password} onChange={v => setBuyerForm(f => ({ ...f, password: v }))} placeholder="Min. 6 characters" error={errors.password} />
            <InputField label="Confirm password" value={buyerForm.confirmPassword} onChange={v => setBuyerForm(f => ({ ...f, confirmPassword: v }))} placeholder="Repeat password" type="password" icon={Lock} error={errors.confirmPassword} required />
            <div className="min-w-0">
              <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Phone number *</label>
              <PhoneInput code={bPhoneCode} onCodeChange={setBPhoneCode} number={bPhoneNumber} onNumberChange={setBPhoneNumber} error={!!errors.phone} inputClassName="rounded-xl py-3" selectClassName="rounded-xl py-3" />
              <FieldError msg={errors.phone} />
            </div>
            <SelectField label="Location" value={buyerForm.location} onChange={v => setBuyerForm(f => ({ ...f, location: v }))} options={ZIM_CITIES} error={errors.location} required placeholder="Select your city" />
          </div>
          <button onClick={handleFormNext} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-9 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 transition-colors" style={{ fontWeight: 700 }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
          </button>
        </Shell>
      );
    }

    // Seller form
    return (
      <Shell wide>
        <StepHeader onBack={backFromForm} activeDot={dots.form} totalDots={totalDots} />
        <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Set up your store</h2>
        <p className="text-sm text-gray-500">We verify every seller to keep Msika trustworthy.</p>
        <p className="text-xs text-[#009739] mt-1 mb-7" style={{ fontWeight: 700 }}>Free store setup · Payout in 24h</p>

        <div className="flex flex-col gap-7 mb-7">

          {!alreadyAuthed && (
            <div>
              <SectionLabel>Your account</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Owner's full name" value={sellerForm.name} onChange={v => setSellerForm(f => ({ ...f, name: v }))} placeholder="Tendai Moyo" icon={User} error={errors.name} required />
                <InputField label="Email address" value={sellerForm.email} onChange={v => setSellerForm(f => ({ ...f, email: v }))} placeholder="tendai@email.com" type="email" icon={Mail} error={errors.email} required />
                <PasswordField label="Password" value={sellerForm.password} onChange={v => setSellerForm(f => ({ ...f, password: v }))} placeholder="Min. 6 characters" error={errors.password} />
                <InputField label="Confirm password" value={sellerForm.confirmPassword} onChange={v => setSellerForm(f => ({ ...f, confirmPassword: v }))} placeholder="Repeat password" type="password" icon={Lock} error={errors.confirmPassword} required />
              </div>
            </div>
          )}

          <div>
            <SectionLabel>Store details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Store name" value={sellerForm.businessName} onChange={v => setSellerForm(f => ({ ...f, businessName: v }))} placeholder="Mai Tendai's Fresh Produce" icon={Store} error={errors.businessName} required />
              <SelectField label="Business type" value={sellerForm.businessType} onChange={v => setSellerForm(f => ({ ...f, businessType: v }))} options={BUSINESS_TYPES} error={errors.businessType} required placeholder="Select business type" />
              <SelectField full label="Category" value={sellerForm.category} onChange={v => setSellerForm(f => ({ ...f, category: v }))} options={categories.map(c => c.name)} error={errors.category} required placeholder="Select a category" />
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Business description *</label>
                <textarea value={sellerForm.description} onChange={e => setSellerForm(f => ({ ...f, description: e.target.value }))} placeholder="What do you sell, and what makes your store stand out?" rows={3} maxLength={300}
                  className={`w-full px-3 py-3 rounded-xl border text-sm outline-none resize-none bg-gray-50 transition-all placeholder-gray-400 ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#009739] focus:ring-2 focus:ring-[#009739]/10'}`} />
                <div className="flex items-center justify-between mt-0.5">
                  <FieldError msg={errors.description} />
                  <span className="text-[11px] text-gray-400 ml-auto">{sellerForm.description.length}/300</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Contact & location</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>WhatsApp number *</label>
                <PhoneInput code={waCode} onCodeChange={setWaCode} number={waNumber} onNumberChange={setWaNumber} error={!!errors.whatsapp} inputClassName="rounded-xl py-3" selectClassName="rounded-xl py-3" />
                <FieldError msg={errors.whatsapp} />
              </div>
              <InputField label="Business address" value={sellerForm.address} onChange={v => setSellerForm(f => ({ ...f, address: v }))} placeholder="12 Samora Machel Ave, Harare" icon={MapPin} error={errors.address} required />
            </div>
          </div>

          <div>
            <SectionLabel>Payout details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 min-w-0">
                <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Mobile money number *</label>
                <PhoneInput code={ecoCode} onCodeChange={setEcoCode} number={ecoNumber} onNumberChange={setEcoNumber} error={!!errors.ecocashPhone} inputClassName="rounded-xl py-3" selectClassName="rounded-xl py-3" />
                <FieldError msg={errors.ecocashPhone} />
              </div>
              <InputField label="Bank name" value={sellerForm.bankName} onChange={v => setSellerForm(f => ({ ...f, bankName: v }))} placeholder="Optional" />
              <InputField label="Account no." value={sellerForm.bankAccount} onChange={v => setSellerForm(f => ({ ...f, bankAccount: v }))} placeholder="Optional" />
            </div>
          </div>

        </div>
        <button onClick={handleFormNext} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-9 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 transition-colors" style={{ fontWeight: 700 }}>
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </Shell>
    );
  }

  // ── Branding (optional) ─────────────────────────────────────────────────
  if (step === 'branding') {
    return (
      <Shell>
        <StepHeader onBack={() => goTo('form')} activeDot={dots.branding} totalDots={totalDots} />
        <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Store branding</h2>
        <p className="text-sm text-gray-500 mb-7">Optional — add a logo and banner now, or skip and add them later from settings.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BrandingUploadBox label="Store logo" hint="Tap to add a square logo" url={logoUrl} uploading={logoUploading} onUpload={handleLogoUpload} />
          <BrandingUploadBox label="Store banner" hint="Tap to add a wide cover photo" url={bannerUrl} uploading={bannerUploading} onUpload={handleBannerUpload} />
        </div>
        <button onClick={() => goTo('review')} className="mt-7 flex items-center justify-center gap-2 py-3 px-9 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors" style={{ fontWeight: 700 }}>
          {logoUrl || bannerUrl ? <>Continue <ChevronRight className="w-4 h-4" /></> : 'Skip for now'}
        </button>
      </Shell>
    );
  }

  // ── Review ───────────────────────────────────────────────────────────────
  if (step === 'review') {
    const allAgreed = agreedTerms && agreedAge;
    return (
      <Shell>
        <StepHeader onBack={() => goTo('branding')} activeDot={dots.review} totalDots={totalDots} />
        <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>Review & submit</h2>
        <p className="text-sm text-gray-500 mb-6">Confirm your details before we verify your account.</p>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
          {[
            ['Store', sellerForm.businessName],
            ['Owner', sellerForm.name],
            ['Type', sellerForm.businessType],
            ['Category', sellerForm.category],
            ['Address', sellerForm.address],
            ['Mobile money', joinPhone(ecoCode, ecoNumber)],
            ['Branding', (logoUrl || bannerUrl) ? [logoUrl && 'Logo', bannerUrl && 'Banner'].filter(Boolean).join(' + ') : 'Not added'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-xs py-1.5">
              <span className="text-gray-400">{k}</span>
              <span className="text-gray-900 truncate ml-4" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          {[
            { id: 'terms', checked: agreedTerms, set: setAgreedTerms, text: 'I agree to the Msika Seller Terms of Service and Privacy Policy.', link: true },
            { id: 'age', checked: agreedAge, set: setAgreedAge, text: "I confirm I'm at least 18 and the information given is accurate." },
          ].map(({ id, checked, set, text, link }) => (
            <label key={id} className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => set(!checked)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer"
                style={{ borderColor: checked ? '#009739' : '#d1d5db', background: checked ? '#009739' : '#fff' }}>
                {checked && <Check className="w-3 h-3 text-white" />}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 500 }}>
                {text}
                {link && <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#009739] ml-1 underline text-xs">View Terms</Link>}
              </p>
            </label>
          ))}
        </div>

        <button
          onClick={alreadyAuthed ? handleUpgradeSubmit : handleReviewSubmit}
          disabled={!allAgreed || loading}
          className="flex items-center justify-center gap-2 py-3 px-9 text-white rounded-xl text-sm border-none cursor-pointer disabled:cursor-not-allowed transition-colors"
          style={{ background: allAgreed && !loading ? '#009739' : '#9ca3af', fontWeight: 700 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Submitting…' : alreadyAuthed ? 'Submit Application' : 'Continue to verification'}
        </button>
      </Shell>
    );
  }

  // ── OTP ──────────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <Shell>
        <div className="text-center">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={backFromOtp} aria-label="Back" className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4 text-gray-900" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalDots }, (_, i) => (
                <div key={i} className="h-1 rounded-full" style={{ width: 28, background: i <= dots.otp ? '#009739' : '#e5e7eb' }} />
              ))}
            </div>
          </div>
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5 mt-6" style={{ border: '3px solid #009739' }}>
            <MailCheck className="w-8 h-8 text-[#009739]" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 900 }}>Verify your email</h2>
          <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
          <p className="text-sm text-[#009739] mb-6" style={{ fontWeight: 700 }}>{pendingEmail}</p>

          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: 6 }, (_, i) => (
              <input
                key={i} id={`onb-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={otp[i] || ''}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  const next = otp.split('');
                  next[i] = val.slice(-1);
                  const joined = next.join('').slice(0, 6);
                  setOtp(joined);
                  setOtpError('');
                  if (val && i < 5) (document.getElementById(`onb-otp-${i + 1}`) as HTMLInputElement)?.focus();
                }}
                onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) (document.getElementById(`onb-otp-${i - 1}`) as HTMLInputElement)?.focus(); }}
                onPaste={e => {
                  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  setOtp(pasted);
                  setOtpError('');
                  (document.getElementById(`onb-otp-${Math.min(pasted.length, 5)}`) as HTMLInputElement)?.focus();
                  e.preventDefault();
                }}
                className="w-11 h-12 text-center text-xl border-2 rounded-xl outline-none transition-all"
                style={{ fontWeight: 800, borderColor: otpError ? '#CE1126' : otp[i] ? '#009739' : '#e5e7eb', background: otp[i] ? 'rgba(0,151,57,0.04)' : '#fafafa' }}
              />
            ))}
          </div>
          {otpError && <p className="text-xs text-red-500 mb-4">{otpError}</p>}
          <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="w-full flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm border-none cursor-pointer mb-3 transition-colors" style={{ fontWeight: 700 }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>
          <button onClick={handleResendEmail} disabled={resending} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-white disabled:opacity-60 mb-3" style={{ fontWeight: 600 }}>
            {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {resending ? 'Sending…' : 'Resend code'}
          </button>
          <p className="text-xs text-gray-400">Didn't get it? Check your spam folder.</p>
        </div>
      </Shell>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  const buyerFirstName = buyerForm.name.split(' ')[0] || 'there';
  return (
    <Shell>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#009739] flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 900 }}>
          {role === 'seller' ? "You're verified!" : `Welcome, ${buyerFirstName}!`}
        </h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          {role === 'seller'
            ? 'Your store is under review. Once approved, you can start listing products for buyers across Zimbabwe.'
            : 'Your account is ready. Start browsing listings from sellers in your community.'}
        </p>
        <button
          onClick={() => navigate(role === 'seller' ? '/seller-dashboard?tab=profile' : '/shop')}
          className="w-full py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
          style={{ fontWeight: 700 }}
        >
          {role === 'seller' ? 'Go to my dashboard' : 'Start browsing'}
        </button>
      </div>
    </Shell>
  );
}
