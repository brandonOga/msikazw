import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Store, FileText, Eye, Clock, CheckCircle2,
  ChevronRight, ChevronLeft, ArrowRight, Loader2,
  Phone, Mail, MapPin, Lock, AlertCircle, Upload,
  X, Check, ShieldCheck, Zap, Package, Star,
  Building2, Hash, MessageCircle, Info, ExternalLink,
  PartyPopper,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/mockData';
import { toast } from 'sonner';
import { uploadSellerDoc } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { resendConfirmationEmail } from '../../lib/db/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface AccountData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface BusinessData {
  businessName: string;
  businessType: string;
  category: string;
  description: string;
  ecocashPhone: string;
  whatsapp: string;
  city: string;
  address: string;
}

interface DocFile {
  id: string;
  label: string;
  required: boolean;
  filename: string | null;
  url: string | null;     // Supabase Storage URL after upload
  uploading: boolean;
  hint: string;
}

// ─── Step metadata (4 steps only — OTP is a sub-step of Account) ─────────────
const STEPS: { n: Step; label: string; sublabel: string; icon: React.ElementType }[] = [
  { n: 1, label: 'Account',       sublabel: 'Create your account',      icon: User },
  { n: 2, label: 'Business',      sublabel: 'About your business',       icon: Store },
  { n: 3, label: 'Documents',     sublabel: 'Verify your identity',      icon: FileText },
  { n: 4, label: 'Review',        sublabel: 'Confirm & submit',          icon: Eye },
  { n: 5, label: 'Submitted',     sublabel: 'Under review',              icon: Clock },
  { n: 6, label: 'Approved',      sublabel: "You're live!",              icon: CheckCircle2 },
];

const BUSINESS_TYPES = [
  'Individual Seller',
  'Small Business',
  'Partnership',
  'Registered Company',
];

const ZIM_CITIES = [
  'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru',
  'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Norton',
  'Marondera', 'Ruwa', 'Chegutu', 'Zvishavane', 'Bindura',
];

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  );
}

function InputField({
  label, value, onChange, placeholder, type = 'text',
  icon: Icon, error, hint, required, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; icon?: React.ElementType;
  error?: string; hint?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-3 border transition-all ${
        error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus-within:border-[#009739] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#009739]/10'
      }`}>
        {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 disabled:text-gray-400"
        />
        {!error && value && <Check className="w-4 h-4 text-[#009739] shrink-0" />}
      </div>
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, error, required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; error?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
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

// ─── Progress Stepper ──────────────────────────────────────────────────────────
function ProgressStepper({ current, maxReached }: { current: Step; maxReached: Step }) {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const done = s.n < current;
          const active = s.n === current;
          const locked = s.n > maxReached;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1.5 min-w-0" style={{ flex: 1 }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative"
                  style={{
                    background: done ? '#009739' : active ? '#fff' : '#f3f4f6',
                    border: active ? '2.5px solid #009739' : done ? '2.5px solid #009739' : '2px solid #e5e7eb',
                    boxShadow: active ? '0 0 0 4px rgba(0,151,57,0.12)' : 'none',
                  }}
                >
                  {done
                    ? <Check className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                    : <Icon className="w-4 h-4" style={{ color: active ? '#009739' : locked ? '#d1d5db' : '#6b7280' }} />
                  }
                  {active && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#009739] border-2 border-white animate-pulse" />
                  )}
                </div>
                <div className="text-center px-1">
                  <p className="text-xs leading-tight" style={{ fontWeight: active ? 700 : done ? 600 : 400, color: active ? '#009739' : done ? '#374151' : '#9ca3af' }}>
                    {s.label}
                  </p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 mx-1 mb-5" style={{ background: s.n < current ? '#009739' : '#e5e7eb', transition: 'background 0.4s' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
            Step {current} of {STEPS.length}: {STEPS[current - 1].label}
          </p>
          <p className="text-xs text-gray-400" style={{ fontWeight: 500 }}>
            {STEPS[current - 1].sublabel}
          </p>
        </div>
        <div className="flex gap-1">
          {STEPS.map(s => (
            <div
              key={s.n}
              className="h-1.5 rounded-full flex-1 transition-all duration-400"
              style={{ background: s.n <= current ? '#009739' : '#e5e7eb' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Account ─────────────────────────────────────────────────────────
function StepAccount({
  user, data, setData, errors, setErrors, onNext, loading,
}: {
  user: any; data: AccountData; setData: (d: AccountData) => void;
  errors: Record<string, string>; setErrors: (e: Record<string, string>) => void;
  onNext: () => void; loading: boolean;
}) {
  const [showPw, setShowPw] = useState(false);
  const set = (k: keyof AccountData, v: string) => {
    setData({ ...data, [k]: v });
    setErrors({ ...errors, [k]: '' });
  };

  if (user) {
    return (
      <div>
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: 'rgba(0,151,57,0.07)', border: '1px solid rgba(0,151,57,0.2)' }}>
          <div className="w-11 h-11 rounded-full bg-[#009739] flex items-center justify-center text-white shrink-0" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-gray-900" style={{ fontWeight: 700 }}>{user.name}</p>
            <p className="text-xs text-gray-500">{user.phone}{user.email ? ` · ${user.email}` : ''}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,151,57,0.12)' }}>
            <Check className="w-3 h-3 text-[#009739]" />
            <span className="text-xs text-[#009739]" style={{ fontWeight: 700 }}>Verified</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Great news — you're already logged in. Your existing account will be upgraded to a seller account upon approval.
        </p>
        <div className="space-y-3 mb-6">
          {[
            { icon: Check, text: 'Your existing orders and wishlist will be preserved' },
            { icon: Check, text: 'You can continue buying while your seller account is reviewed' },
            { icon: Check, text: 'Seller Dashboard will be unlocked after approval' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-[#009739]" />
              </div>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onNext}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-60"
          style={{ fontWeight: 700 }}
        >
          Continue with this account <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InputField label="Full name" value={data.name} onChange={v => set('name', v)} placeholder="Tatenda Moyo" icon={User} error={errors.name} required />
      <InputField label="Phone number" value={data.phone} onChange={v => set('phone', v)} placeholder="+263 77 123 4567" icon={Phone} error={errors.phone} required hint="This will be your login phone & EcoCash number" />
      <InputField label="Email address" value={data.email} onChange={v => set('email', v)} placeholder="tatenda@example.com" type="email" icon={Mail} hint="Optional — for order confirmations" />
      <div className="relative">
        <InputField label="Password" value={data.password} onChange={v => set('password', v)} placeholder="Min. 6 characters" type={showPw ? 'text' : 'password'} icon={Lock} error={errors.password} required />
        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-gray-400 border-none bg-transparent cursor-pointer">
          <Eye className="w-4 h-4" />
        </button>
      </div>
      <InputField label="Confirm password" value={data.confirmPassword} onChange={v => set('confirmPassword', v)} placeholder="Repeat password" type={showPw ? 'text' : 'password'} icon={Lock} error={errors.confirmPassword} required />
      <button
        onClick={onNext}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-60 mt-2"
        style={{ fontWeight: 700 }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Creating account…' : <>Create account <ChevronRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

// ─── Step 2: Business Info ────────────────────────────────────────────────────
function StepBusiness({
  data, setData, errors, setErrors, onNext, onBack, loading,
}: {
  data: BusinessData; setData: (d: BusinessData) => void;
  errors: Record<string, string>; setErrors: (e: Record<string, string>) => void;
  onNext: () => void; onBack: () => void; loading: boolean;
}) {
  const set = (k: keyof BusinessData, v: string) => {
    setData({ ...data, [k]: v });
    setErrors({ ...errors, [k]: '' });
  };
  const catOptions = categories.map(c => `${c.emoji} ${c.name}`);

  return (
    <div className="space-y-4">
      <InputField label="Business / Store name" value={data.businessName} onChange={v => set('businessName', v)} placeholder="e.g. TechHaven ZW" icon={Store} error={errors.businessName} required hint="This is the name buyers will see on your store" />

      <SelectField label="Business type" value={data.businessType} onChange={v => set('businessType', v)} options={BUSINESS_TYPES} error={errors.businessType} required placeholder="Select business type…" />

      <SelectField label="Primary category" value={data.category} onChange={v => set('category', v)} options={catOptions} error={errors.category} required placeholder="What do you sell?" />

      <div>
        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
          Business description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={e => { set('description', e.target.value); }}
          placeholder="Tell buyers what you sell, your story, and what makes you stand out…"
          rows={3}
          className={`w-full px-3 py-3 rounded-xl border text-sm outline-none resize-none bg-gray-50 transition-all placeholder-gray-400 ${
            errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#009739] focus:ring-2 focus:ring-[#009739]/10'
          }`}
        />
        <div className="flex items-center justify-between mt-0.5">
          <FieldError msg={errors.description} />
          <span className="text-[11px] text-gray-400 ml-auto">{data.description.length}/300</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField label="EcoCash number" value={data.ecocashPhone} onChange={v => set('ecocashPhone', v)} placeholder="+263 77 123 4567" icon={Phone} error={errors.ecocashPhone} required hint="Where you'll receive payments" />
        <InputField label="WhatsApp number" value={data.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+263 77 123 4567" icon={MessageCircle} error={errors.whatsapp} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="City / Town" value={data.city} onChange={v => set('city', v)} options={ZIM_CITIES} error={errors.city} required placeholder="Select city…" />
        <InputField label="Business address" value={data.address} onChange={v => set('address', v)} placeholder="22 Main St, CBD" icon={MapPin} error={errors.address} required />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-60"
          style={{ fontWeight: 700 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Saving…' : <>Continue <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Documents ────────────────────────────────────────────────────────
export function UploadBox({
  doc, userId, onUploaded, onRemove,
}: {
  doc: DocFile;
  userId?: string;
  onUploaded: (id: string, filename: string | null, url: string | null, uploading?: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

  const processFile = async (file: File) => {
    // validate
    if (!ALLOWED.includes(file.type)) {
      toast.error('Invalid file type. Accepts JPG, PNG or PDF.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('File too large. Max size is 5MB.')
      return
    }

    // mark uploading true and show filename immediately
    onUploaded(doc.id, file.name, null, true);

    if (isSupabaseConfigured && userId) {
      try {
        const { url, error } = await uploadSellerDoc(userId, doc.id, file);
        if (error) {
          onUploaded(doc.id, null, null, false);
          toast.error(`Upload failed: ${error}`);
          return;
        }
        onUploaded(doc.id, file.name, url, false);
      } catch (err: any) {
        onUploaded(doc.id, null, null, false);
        toast.error(`Upload error: ${err?.message || String(err)}`);
      }
    } else {
      // Not configured — leave filename visible but mark not uploading
      onUploaded(doc.id, file.name, null, false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [doc.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{doc.label}</p>
        <span
          className="px-2 py-0.5 rounded-full text-[10px]"
          style={{
            background: doc.required ? 'rgba(206,17,38,0.08)' : 'rgba(0,151,57,0.08)',
            color: doc.required ? '#CE1126' : '#009739',
            fontWeight: 700,
          }}
        >
          {doc.required ? 'Required' : 'Optional'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{doc.hint}</p>

      {doc.filename ? (
        doc.uploading ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{doc.filename}</p>
              <p className="text-[11px] text-gray-600" style={{ fontWeight: 500 }}>Uploading…</p>
            </div>
            <button
              disabled
              className="p-1 rounded-lg text-gray-300 border-none bg-transparent cursor-default"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#009739] bg-green-50">
            <div className="w-8 h-8 rounded-lg bg-[#009739] flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{doc.filename}</p>
              <p className="text-[11px] text-[#009739]" style={{ fontWeight: 500 }}>Uploaded successfully</p>
            </div>
            <button
              onClick={() => onRemove(doc.id)}
              className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2.5 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all"
          style={{
            borderColor: dragging ? '#009739' : '#e5e7eb',
            background: dragging ? 'rgba(0,151,57,0.04)' : '#fafafa',
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
              {dragging ? 'Drop here' : 'Click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or PDF · Max 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

function StepDocuments({
  docs, setDocs, errors, onNext, onBack, loading, userId,
}: {
  docs: DocFile[];
  setDocs: React.Dispatch<React.SetStateAction<DocFile[]>>;
  errors: Record<string, string>;
  onNext: () => void; onBack: () => void; loading: boolean;
  userId?: string;
}) {
  const handleUploaded = (id: string, filename: string | null, url: string | null, uploading = false) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, filename, url, uploading } : d));
  };
  const handleRemove = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, filename: null, url: null, uploading: false } : d));
  };

  const uploadedCount = docs.filter(d => d.filename).length;
  const requiredUploaded = docs.filter(d => d.required && d.filename).length;
  const requiredTotal = docs.filter(d => d.required).length;

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl mb-6" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.12)' }}>
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>Documents uploaded</p>
            <p className="text-xs text-[#009739]" style={{ fontWeight: 700 }}>{uploadedCount} / {docs.length}</p>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-[#009739] transition-all duration-500" style={{ width: `${(uploadedCount / docs.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {errors.docs && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4 bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600" style={{ fontWeight: 600 }}>{errors.docs}</p>
        </div>
      )}

      <div className="space-y-5">
        {docs.map(doc => (
          <UploadBox key={doc.id} doc={doc} userId={userId} onUploaded={handleUploaded} onRemove={handleRemove} />
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl mt-5 mb-4" style={{ background: 'rgba(255,209,0,0.1)', border: '1px solid rgba(255,209,0,0.3)' }}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#b8960a' }} />
        <p className="text-xs text-gray-600 leading-relaxed">
          All documents are encrypted and reviewed only by our compliance team within 1–3 business days. We never share your documents with third parties.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-60"
          style={{ fontWeight: 700 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Processing…' : <>Review application <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Submit ──────────────────────────────────────────────────
function StepReview({
  accountData, businessData, docs, user,
  onSubmit, onBack, loading,
}: {
  accountData: AccountData; businessData: BusinessData;
  docs: DocFile[]; user: any;
  onSubmit: () => void; onBack: () => void; loading: boolean;
}) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedCommission, setAgreedCommission] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  const allAgreed = agreedTerms && agreedCommission && agreedAge;

  const name = user?.name || accountData.name;

  return (
    <div>
      {/* Review cards */}
      <div className="space-y-4 mb-6">
        {/* Account */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#009739]" />
              </div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Account</p>
            </div>
            <span className="text-xs text-[#009739]" style={{ fontWeight: 600 }}>✓ Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              ['Name', name],
              ['Phone', user?.phone || accountData.phone],
              ...(user?.email || accountData.email ? [['Email', user?.email || accountData.email]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] text-gray-400">{k}</p>
                <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-[#009739]" />
              </div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Business</p>
            </div>
            <span className="text-xs text-[#009739]" style={{ fontWeight: 600 }}>✓ Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              ['Store name', businessData.businessName],
              ['Type', businessData.businessType],
              ['Category', businessData.category],
              ['City', businessData.city],
              ['EcoCash', businessData.ecocashPhone],
              ['WhatsApp', businessData.whatsapp],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] text-gray-400">{k}</p>
                <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>
          {businessData.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[11px] text-gray-400 mb-1">Description</p>
              <p className="text-xs text-gray-600 leading-relaxed">{businessData.description}</p>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-[#009739]" />
              </div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Documents</p>
            </div>
            <span className="text-xs text-[#009739]" style={{ fontWeight: 600 }}>{docs.filter(d => d.filename).length}/{docs.length} uploaded</span>
          </div>
          <div className="space-y-1.5">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${doc.filename ? 'bg-[#009739]' : 'bg-gray-200'}`}>
                  {doc.filename ? <Check className="w-3 h-3 text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                </div>
                <p className="text-xs flex-1" style={{ fontWeight: doc.filename ? 600 : 400, color: doc.filename ? '#374151' : '#9ca3af' }}>
                  {doc.label}
                  {doc.required && !doc.filename && <span className="text-red-400 ml-1">(required)</span>}
                </p>
                {doc.filename && <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{doc.filename}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-3 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 700 }}>Agreements & Acknowledgements</p>
        {[
          {
            id: 'terms',
            checked: agreedTerms,
            set: setAgreedTerms,
            text: 'I agree to the Msika Seller Terms of Service and Privacy Policy.',
            link: true,
          },
          {
            id: 'commission',
            checked: agreedCommission,
            set: setAgreedCommission,
            text: 'I understand Msika charges a 2% platform fee on all completed sales, deducted before payout.',
          },
          {
            id: 'age',
            checked: agreedAge,
            set: setAgreedAge,
            text: 'I confirm I am at least 18 years old and the information provided is accurate and truthful.',
          },
        ].map(({ id, checked, set, text, link }) => (
          <label key={id} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => set(!checked)}
              className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer"
              style={{ borderColor: checked ? '#009739' : '#d1d5db', background: checked ? '#009739' : '#fff' }}
            >
              {checked && <Check className="w-3 h-3 text-white" />}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed" style={{ fontWeight: 500 }}>
              {text}
              {link && <button className="text-[#009739] ml-1 underline bg-transparent border-none cursor-pointer p-0 text-xs" onClick={e => { e.preventDefault(); toast.info('Terms of Service', { description: 'Opening seller terms…' }); }}>View Terms</button>}
            </p>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!allAgreed || loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: allAgreed && !loading ? '#009739' : '#9ca3af', fontWeight: 700 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Submitting application…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Pending ──────────────────────────────────────────────────────────
function StepPending({
  application, onSimulateApproval, approvalLoading,
}: {
  application: any; onSimulateApproval: () => void; approvalLoading: boolean;
}) {
  return (
    <div className="text-center">
      {/* Animated icon */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-[#FFD100] flex items-center justify-center">
          <Clock className="w-9 h-9" style={{ color: '#b8960a' }} />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-[#FFD100] opacity-30 animate-ping" />
      </div>

      <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 900 }}>Application Submitted!</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
        We've received your seller application and it's currently under review by our compliance team.
      </p>

      {/* Reference number */}
      {application && (
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-6" style={{ background: 'rgba(0,151,57,0.07)', border: '1px solid rgba(0,151,57,0.2)' }}>
          <Hash className="w-4 h-4 text-[#009739]" />
          <div className="text-left">
            <p className="text-[11px] text-gray-400">Reference number</p>
            <p className="text-sm text-gray-900 font-mono" style={{ fontWeight: 700 }}>{application.referenceNumber}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="text-left space-y-0 mb-6 max-w-xs mx-auto">
        {[
          { icon: Check,       label: 'Application received',    sublabel: application?.submittedAt || 'Just now',  done: true,   active: false },
          { icon: Eye,         label: 'Document verification',   sublabel: '1–2 business days',                     done: false,  active: true },
          { icon: ShieldCheck, label: 'Background check',        sublabel: 'Up to 1 business day',                  done: false,  active: false },
          { icon: Zap,         label: 'Store activation',        sublabel: 'Instant after approval',                done: false,  active: false },
        ].map(({ icon: Icon, label, sublabel, done, active }, idx) => (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: done ? '#009739' : active ? 'rgba(255,209,0,0.15)' : '#f3f4f6',
                  border: active ? '2px solid #FFD100' : done ? 'none' : '2px solid #e5e7eb',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: done ? '#fff' : active ? '#b8960a' : '#d1d5db' }} />
              </div>
              {idx < 3 && <div className="w-0.5 h-6 my-0.5" style={{ background: done ? '#009739' : '#e5e7eb' }} />}
            </div>
            <div className="pb-1 pt-1.5">
              <p className="text-sm text-gray-900" style={{ fontWeight: active || done ? 700 : 400 }}>{label}</p>
              <p className="text-xs text-gray-400">{sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo approval button */}
      <div className="p-4 rounded-2xl mb-5" style={{ background: 'rgba(255,209,0,0.08)', border: '1px dashed rgba(255,209,0,0.5)' }}>
        <p className="text-xs text-gray-500 mb-3" style={{ fontWeight: 600 }}>
          🎬 Demo mode — simulate the approval process
        </p>
        <button
          onClick={onSimulateApproval}
          disabled={approvalLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border-none cursor-pointer disabled:opacity-60 transition-all"
          style={{ background: '#FFD100', color: '#111', fontWeight: 700 }}
        >
          {approvalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {approvalLoading ? 'Processing approval…' : 'Simulate Approval (Demo)'}
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        You'll receive a notification when your application is reviewed.<br />
        Keep an eye on the bell icon in your navbar.
      </p>
    </div>
  );
}

// ─── Step 6: Approved ─────────────────────────────────────────────────────────
function StepApproved({ businessData, onGoToDashboard }: { businessData: BusinessData; onGoToDashboard: () => void }) {
  return (
    <div className="text-center">
      {/* Celebration icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center" style={{ border: '4px solid #009739' }}>
          <CheckCircle2 className="w-11 h-11 text-[#009739]" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FFD100] border-2 border-white flex items-center justify-center">
          <PartyPopper className="w-4 h-4 text-gray-900" />
        </div>
      </div>

      <h2 className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>You're approved!</h2>
      <p className="text-[#009739] mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>
        Welcome to Msika Sellers, {businessData.businessName || 'Seller'}
      </p>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Your store is now live on Msika Marketplace. Buyers can discover your products and make secure purchases through EcoCash escrow.
      </p>

      {/* What's unlocked */}
      <div className="grid grid-cols-1 gap-3 mb-8 text-left">
        {[
          { icon: Package,    color: '#009739', bg: 'rgba(0,151,57,0.08)',   title: 'Add unlimited products',    sub: 'List everything in your inventory' },
          { icon: ShieldCheck,color: '#009739', bg: 'rgba(0,151,57,0.08)',   title: 'Verified Seller badge',     sub: 'Green checkmark on your store' },
          { icon: Zap,        color: '#b8960a', bg: 'rgba(255,209,0,0.12)', title: 'EcoCash escrow payouts',    sub: 'Funds released within 24hrs of delivery' },
          { icon: Star,       color: '#CE1126', bg: 'rgba(206,17,38,0.08)', title: 'Priority discovery',        sub: 'Featured in search and categories' },
        ].map(({ icon: Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color }} />
            </div>
            <div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
            <Check className="w-4 h-4 text-[#009739] ml-auto shrink-0" />
          </div>
        ))}
      </div>

      <button
        onClick={onGoToDashboard}
        className="w-full flex items-center justify-center gap-2 py-4 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-base transition-colors border-none cursor-pointer"
        style={{ fontWeight: 800 }}
      >
        Go to Seller Dashboard <ArrowRight className="w-5 h-5" />
      </button>
      <p className="text-xs text-gray-400 mt-3">
        Your store is live at msika.co.zw/store/your-store
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SellerOnboarding() {
  const navigate = useNavigate();
  const { user, login, signUpWithEmail, verifyEmailOtp, onboardingStatus, sellerApplication, submitSellerApplication, approveSellerAccount } = useStore();

  const [step, setStep] = useState<Step>(() => {
    if (onboardingStatus === 'approved' || onboardingStatus === 'pending') return 4;
    return 1;
  });
  const [maxReached, setMaxReached] = useState<Step>(step);

  // OTP verification state (shown after step 1 account creation)
  const [showOtp,         setShowOtp]         = useState(false);
  const [pendingEmail,    setPendingEmail]     = useState('');
  const [otpValue,        setOtpValue]         = useState('');
  const [otpError,        setOtpError]         = useState('');
  const [otpLoading,      setOtpLoading]       = useState(false);
  const [otpResending,    setOtpResending]     = useState(false);

  const [accountData, setAccountData] = useState<AccountData>({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    password: '', confirmPassword: '',
  });
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '', businessType: '', category: '', description: '',
    ecocashPhone: user?.phone || '', whatsapp: user?.phone || '',
    city: '', address: '',
  });
  const [docs, setDocs] = useState<DocFile[]>([
    { id: 'national-id', label: 'National ID / Passport',  required: true,  filename: null, url: null, uploading: false, hint: 'Clear photo of the front of your ID' },
    { id: 'selfie',      label: 'Selfie holding your ID',  required: true,  filename: null, url: null, uploading: false, hint: 'Hold your ID next to your face, clearly visible' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const goTo = (s: Step) => {
    setStep(s);
    setMaxReached(prev => (s > prev ? s : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateAccount = () => {
    if (user) return true;
    const e: Record<string, string> = {};
    if (!accountData.name.trim()) e.name = 'Full name is required';
    if (!accountData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s]{7,}$/.test(accountData.phone)) e.phone = 'Enter a valid phone number (+263…)';
    if (!accountData.password) e.password = 'Password is required';
    else if (accountData.password.length < 6) e.password = 'Must be at least 6 characters';
    if (accountData.password !== accountData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 2 validation ─────────────────────────────────────────────────────
  const validateBusiness = () => {
    const e: Record<string, string> = {};
    if (!businessData.businessName.trim()) e.businessName = 'Store name is required';
    if (!businessData.businessType) e.businessType = 'Select a business type';
    if (!businessData.category) e.category = 'Select a category';
    if (!businessData.description.trim()) e.description = 'Description is required';
    else if (businessData.description.trim().length < 20) e.description = 'Please write at least 20 characters';
    if (!businessData.ecocashPhone.trim()) e.ecocashPhone = 'EcoCash number is required';
    if (!businessData.whatsapp.trim()) e.whatsapp = 'WhatsApp number is required';
    if (!businessData.city) e.city = 'Select your city';
    if (!businessData.address.trim()) e.address = 'Business address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 3 validation ─────────────────────────────────────────────────────
  const validateDocs = () => {
    const missingRequired = docs.filter(d => d.required && !d.filename);
    if (missingRequired.length > 0) {
      setErrors({ docs: `Please upload: ${missingRequired.map(d => d.label).join(', ')}` });
      return false;
    }
    setErrors({});
    return true;
  };

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleStep1Next = async () => {
    if (!validateAccount()) return;
    if (!user) {
      setLoading(true);
      if (isSupabaseConfigured && accountData.email) {
        const { error, needsEmailConfirmation } = await signUpWithEmail({
          email: accountData.email, password: accountData.password,
          name: accountData.name, phone: accountData.phone, role: 'buyer',
        });
        setLoading(false);
        if (error) { toast.error('Sign up failed', { description: error }); return; }
        if (needsEmailConfirmation) {
          setPendingEmail(accountData.email);
          setShowOtp(true);
          return;
        }
      } else {
        // Offline fallback — skip OTP
        login('buyer', accountData.name, accountData.phone, accountData.email);
        setLoading(false);
      }
    }
    goTo(2);
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setOtpLoading(true);
    setOtpError('');
    const { error } = await verifyEmailOtp(pendingEmail, otpValue);
    setOtpLoading(false);
    if (error) { setOtpError('Invalid or expired code. Try resending.'); return; }
    toast.success('Email verified!', { description: 'Let\'s set up your store.' });
    setShowOtp(false);
    goTo(2);
  };

  const handleResendOtp = async () => {
    setOtpResending(true);
    setOtpValue('');
    setOtpError('');
    await resendConfirmationEmail(pendingEmail);
    setOtpResending(false);
    toast.success('New code sent!', { description: `Check your inbox at ${pendingEmail}` });
  };

  const handleStep2Next = async () => {
    if (!validateBusiness()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    goTo(3);
  };

  const handleStep3Next = async () => {
    if (!validateDocs()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    goTo(4);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await submitSellerApplication({
      businessName: businessData.businessName,
      businessType: businessData.businessType,
      category: businessData.category,
      phone: businessData.ecocashPhone,
      whatsapp: businessData.whatsapp,
      city: businessData.city,
      address: businessData.address,
      description: businessData.description,
      documents: docs.filter(d => d.filename).map(d => d.url || d.filename!),
    });
    setLoading(false);
    toast.success('Application submitted!', { description: 'Our team will review it shortly.' });
    navigate('/seller-dashboard');
  };

  // Keep for internal use — not shown in UI anymore
  const handleSimulateApproval = async () => {
    setApprovalLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    approveSellerAccount();
    setApprovalLoading(false);
    navigate('/seller-dashboard');
    toast.success('🎉 Application approved!', { description: 'Your seller account is now live.' });
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  const isTerminalStep = false; // no more terminal steps — submit goes to dashboard

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* Back to profile */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 bg-transparent border-none cursor-pointer p-0 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <ChevronLeft className="w-4 h-4" /> Back to profile
        </button>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#009739] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 900 }}>Become a Seller</h1>
              <p className="text-sm text-gray-500">Join 700+ verified sellers on Msika Marketplace</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '2%',    label: 'Platform fee only' },
              { value: '24h',   label: 'Payout after delivery' },
              { value: 'Free',  label: 'Store setup' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <p className="text-base text-[#009739]" style={{ fontWeight: 900 }}>{value}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress stepper — hidden during OTP verification */}
        {!showOtp && (
          <div className="mb-8">
            <ProgressStepper current={step} maxReached={maxReached} />
          </div>
        )}

        {/* Step card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card header */}
          {!showOtp && (
            <div className="px-6 py-5 border-b border-gray-50" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#009739] flex items-center justify-center shrink-0">
                  {React.createElement(STEPS[step - 1].icon, { className: 'w-4 h-4 text-white' })}
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>
                    Step {step}: {STEPS[step - 1].label}
                  </p>
                  <p className="text-xs text-gray-500">{STEPS[step - 1].sublabel}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="p-6">
            {/* OTP verification — shown inline after step 1 */}
            {showOtp && (
              <div className="text-center py-4">
                <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4" style={{ border: '2px solid #009739' }}>
                  <Mail className="w-6 h-6 text-[#009739]" />
                </div>
                <h3 className="text-lg text-gray-900 mb-1" style={{ fontWeight: 800 }}>Verify your email</h3>
                <p className="text-sm text-gray-500 mb-1">Enter the 6-digit code sent to</p>
                <p className="text-sm text-[#009739] mb-6" style={{ fontWeight: 700 }}>{pendingEmail}</p>

                {/* OTP boxes */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <input
                      key={i}
                      id={`sel-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpValue[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const next = otpValue.split('');
                        next[i] = val.slice(-1);
                        const joined = next.join('').slice(0, 6);
                        setOtpValue(joined);
                        setOtpError('');
                        if (val && i < 5) (document.getElementById(`sel-otp-${i + 1}`) as HTMLInputElement)?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otpValue[i] && i > 0)
                          (document.getElementById(`sel-otp-${i - 1}`) as HTMLInputElement)?.focus();
                      }}
                      onPaste={e => {
                        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        setOtpValue(pasted);
                        setOtpError('');
                        const nextFocus = Math.min(pasted.length, 5);
                        (document.getElementById(`sel-otp-${nextFocus}`) as HTMLInputElement)?.focus();
                        e.preventDefault();
                      }}
                      className="w-11 h-12 text-center text-xl border-2 rounded-xl outline-none transition-all"
                      style={{
                        fontWeight: 800,
                        borderColor: otpError ? '#CE1126' : otpValue[i] ? '#009739' : '#e5e7eb',
                        background: otpValue[i] ? 'rgba(0,151,57,0.04)' : '#fafafa',
                      }}
                    />
                  ))}
                </div>

                {otpError && <p className="text-xs text-red-500 mb-3">{otpError}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpValue.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] disabled:opacity-60 text-white rounded-xl text-sm border-none cursor-pointer mb-3 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {otpLoading ? 'Verifying…' : 'Verify & Continue →'}
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={otpResending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#009739] hover:text-[#009739] transition-colors cursor-pointer bg-white disabled:opacity-60"
                  style={{ fontWeight: 600 }}
                >
                  {otpResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {otpResending ? 'Sending…' : 'Resend code'}
                </button>
              </div>
            )}

            {!showOtp && step === 1 && (
              <StepAccount
                user={user}
                data={accountData}
                setData={setAccountData}
                errors={errors}
                setErrors={setErrors}
                onNext={handleStep1Next}
                loading={loading}
              />
            )}
            {!showOtp && step === 2 && (
              <StepBusiness
                data={businessData}
                setData={setBusinessData}
                errors={errors}
                setErrors={setErrors}
                onNext={handleStep2Next}
                onBack={() => goTo(1)}
                loading={loading}
              />
            )}
            {!showOtp && step === 3 && (
              <StepDocuments
                docs={docs}
                setDocs={setDocs}
                errors={errors}
                onNext={handleStep3Next}
                onBack={() => goTo(2)}
                loading={loading}
                userId={user?.id}
              />
            )}
            {!showOtp && step === 4 && (
              <StepReview
                accountData={accountData}
                businessData={businessData}
                docs={docs}
                user={user}
                onSubmit={handleSubmit}
                onBack={() => goTo(3)}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Trust footer */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {[
              { icon: Lock, text: 'Data encrypted' },
              { icon: ShieldCheck, text: 'ZIMRA compliant' },
              { icon: Star, text: '4.8★ rated platform' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-gray-400">
                <Icon className="w-3.5 h-3.5" />
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}