import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Store, Eye,
  ChevronRight, ChevronLeft, Loader2,
  Phone, MapPin, Lock, AlertCircle, Upload,
  X, Check, ShieldCheck, Star,
  Building2, MessageCircle, Info, ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/mockData';
import { toast } from 'sonner';
import { uploadSellerDoc, uploadSellerImage } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { PhoneInput, joinPhone, splitPhone } from '../components/PhoneInput';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

interface AccountData {
  name: string;
  phone: string;
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
  acceptLabel?: string;   // overrides the default "JPG, PNG or PDF" copy shown in the drop zone
}

// ─── Step metadata ─────────────────────────────────────────────────────────
const STEPS: { n: Step; label: string; sublabel: string; icon: React.ElementType }[] = [
  { n: 1, label: 'Account',  sublabel: 'Tell us about you',   icon: User },
  { n: 2, label: 'Business', sublabel: 'About your business', icon: Store },
  { n: 3, label: 'Branding', sublabel: 'Your store look (optional)', icon: Upload },
  { n: 4, label: 'Review',   sublabel: 'Confirm & submit',    icon: Eye },
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
  const [phoneCode, setPhoneCode] = useState(() => splitPhone(data.phone)[0]);
  const [phoneNumber, setPhoneNumber] = useState(() => splitPhone(data.phone)[1]);
  const set = (k: keyof AccountData, v: string) => {
    setData({ ...data, [k]: v });
    setErrors({ ...errors, [k]: '' });
  };

  return (
    <div className="space-y-4">
      {user?.email && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <Check className="w-3.5 h-3.5 text-[#009739] shrink-0" />
          <p className="text-xs text-gray-500">Signed in as <span className="text-gray-900" style={{ fontWeight: 600 }}>{user.email}</span></p>
        </div>
      )}
      <InputField label="Full name" value={data.name} onChange={v => set('name', v)} placeholder="Tatenda Moyo" icon={User} error={errors.name} required />
      <div>
        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Phone number <span className="text-red-500">*</span></label>
        <PhoneInput
          code={phoneCode}
          onCodeChange={c => { setPhoneCode(c); set('phone', joinPhone(c, phoneNumber)); }}
          number={phoneNumber}
          onNumberChange={n => { setPhoneNumber(n); set('phone', joinPhone(phoneCode, n)); }}
          error={!!errors.phone}
          inputClassName="rounded-xl py-3"
          selectClassName="rounded-xl py-3"
        />
        {errors.phone && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" />{errors.phone}</p>}
        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />We&apos;ll use this for order updates and EcoCash payouts</p>
      </div>
      <button
        onClick={onNext}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer disabled:opacity-60 mt-2"
        style={{ fontWeight: 700 }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Saving…' : <>Continue <ChevronRight className="w-4 h-4" /></>}
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
  const [ecoCode, setEcoCode] = useState(() => splitPhone(data.ecocashPhone)[0]);
  const [ecoNumber, setEcoNumber] = useState(() => splitPhone(data.ecocashPhone)[1]);
  const [waCode, setWaCode] = useState(() => splitPhone(data.whatsapp)[0]);
  const [waNumber, setWaNumber] = useState(() => splitPhone(data.whatsapp)[1]);
  const set = (k: keyof BusinessData, v: string) => {
    setData({ ...data, [k]: v });
    setErrors({ ...errors, [k]: '' });
  };
  const catOptions = categories.map(c => c.name);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>EcoCash number <span className="text-red-500">*</span></label>
          <PhoneInput
            code={ecoCode}
            onCodeChange={c => { setEcoCode(c); set('ecocashPhone', joinPhone(c, ecoNumber)); }}
            number={ecoNumber}
            onNumberChange={n => { setEcoNumber(n); set('ecocashPhone', joinPhone(ecoCode, n)); }}
            error={!!errors.ecocashPhone}
            inputClassName="rounded-xl py-3"
            selectClassName="rounded-xl py-3"
          />
          {errors.ecocashPhone && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" />{errors.ecocashPhone}</p>}
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />Where you&apos;ll receive payments</p>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>WhatsApp number <span className="text-red-500">*</span></label>
          <PhoneInput
            code={waCode}
            onCodeChange={c => { setWaCode(c); set('whatsapp', joinPhone(c, waNumber)); }}
            number={waNumber}
            onNumberChange={n => { setWaNumber(n); set('whatsapp', joinPhone(waCode, n)); }}
            error={!!errors.whatsapp}
            inputClassName="rounded-xl py-3"
            selectClassName="rounded-xl py-3"
          />
          {errors.whatsapp && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3 shrink-0" />{errors.whatsapp}</p>}
        </div>
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

// ─── Reusable drag/drop upload box (docs, logo, banner) ───────────────────────
export function UploadBox({
  doc, userId, onUploaded, onRemove, onUpload,
}: {
  doc: DocFile;
  userId?: string;
  onUploaded: (id: string, filename: string | null, url: string | null, uploading?: boolean) => void;
  onRemove: (id: string) => void;
  // When provided, this is used instead of the default document-upload path — lets the
  // same drop zone drive any upload target (e.g. logo/banner via uploadSellerImage).
  onUpload?: (file: File) => Promise<{ url: string | null; error: string | null }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

  const processFile = async (file: File) => {
    // validate
    if (!ALLOWED.includes(file.type)) {
      toast.error(`Invalid file type. Accepts ${doc.acceptLabel || 'JPG, PNG or PDF'}.`)
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('File too large. Max size is 5MB.')
      return
    }

    // mark uploading true and show filename immediately
    onUploaded(doc.id, file.name, null, true);

    if (onUpload) {
      try {
        const { url, error } = await onUpload(file);
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
    } else if (isSupabaseConfigured && userId) {
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
            <p className="text-xs text-gray-400 mt-0.5">{doc.acceptLabel || 'JPG, PNG or PDF'} · Max 5MB</p>
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

// ─── Step 3: Branding (optional) ───────────────────────────────────────────────
function StepBranding({
  userId, logoUrl, bannerUrl, onLogoChange, onBannerChange, onNext, onBack,
}: {
  userId?: string;
  logoUrl: string | null; bannerUrl: string | null;
  onLogoChange: (url: string | null) => void; onBannerChange: (url: string | null) => void;
  onNext: () => void; onBack: () => void;
}) {
  const [logoDoc, setLogoDoc] = useState<DocFile>({
    id: 'logo', label: 'Store logo', required: false,
    filename: logoUrl ? 'logo.jpg' : null, url: logoUrl, uploading: false,
    hint: 'Square image works best', acceptLabel: 'JPG, PNG, WEBP or GIF',
  });
  const [bannerDoc, setBannerDoc] = useState<DocFile>({
    id: 'banner', label: 'Store banner', required: false,
    filename: bannerUrl ? 'banner.jpg' : null, url: bannerUrl, uploading: false,
    hint: 'Wide image for your store page header', acceptLabel: 'JPG, PNG, WEBP or GIF',
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Store branding</p>
        <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(0,151,57,0.08)', color: '#009739', fontWeight: 700 }}>
          Optional
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Add a logo and cover photo now, or skip this and add them anytime from Settings.
      </p>

      <div className="space-y-5">
        <UploadBox
          doc={logoDoc}
          userId={userId}
          onUpload={file => uploadSellerImage(userId!, 'logo', file)}
          onUploaded={(_id, filename, url, uploading = false) => {
            setLogoDoc(d => ({ ...d, filename, url, uploading }));
            if (!uploading) onLogoChange(url);
          }}
          onRemove={() => { setLogoDoc(d => ({ ...d, filename: null, url: null, uploading: false })); onLogoChange(null); }}
        />
        <UploadBox
          doc={bannerDoc}
          userId={userId}
          onUpload={file => uploadSellerImage(userId!, 'banner', file)}
          onUploaded={(_id, filename, url, uploading = false) => {
            setBannerDoc(d => ({ ...d, filename, url, uploading }));
            if (!uploading) onBannerChange(url);
          }}
          onRemove={() => { setBannerDoc(d => ({ ...d, filename: null, url: null, uploading: false })); onBannerChange(null); }}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm transition-colors border-none cursor-pointer"
          style={{ fontWeight: 700 }}
        >
          {logoUrl || bannerUrl ? <>Continue <ChevronRight className="w-4 h-4" /></> : 'Skip for now'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Submit ──────────────────────────────────────────────────
function StepReview({
  accountData, businessData, logoUrl, bannerUrl, user,
  onSubmit, onBack, loading,
}: {
  accountData: AccountData; businessData: BusinessData;
  logoUrl: string | null; bannerUrl: string | null;
  user: any;
  onSubmit: () => void; onBack: () => void; loading: boolean;
}) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  const allAgreed = agreedTerms && agreedAge;

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
              ...(user?.email ? [['Email', user.email]] : []),
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

        {/* Branding */}
        {(logoUrl || bannerUrl) ? (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <Upload className="w-3.5 h-3.5 text-[#009739]" />
              </div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Branding</p>
            </div>
            <div className="flex gap-3">
              {logoUrl && <img src={logoUrl} alt="Store logo" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />}
              {bannerUrl && <img src={bannerUrl} alt="Store banner" className="flex-1 h-14 rounded-xl object-cover border border-gray-200" />}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">No branding added — you can add a logo and cover photo anytime from Settings.</p>
        )}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SellerOnboarding() {
  const navigate = useNavigate();
  const { user, onboardingStatus, submitSellerApplication, updateProfile } = useStore();

  // Onboarding always starts from an authenticated session — sign up (email + password,
  // with OTP verification) happens on /signup first. Bounce anyone who lands here directly
  // without an account, rather than re-collecting credentials in this wizard.
  useEffect(() => {
    if (!user) navigate('/signup?role=seller', { replace: true });
  }, [user, navigate]);

  const [step, setStep] = useState<Step>(() => {
    if (onboardingStatus === 'approved' || onboardingStatus === 'pending') return 4;
    return 1;
  });
  const [maxReached, setMaxReached] = useState<Step>(step);

  const [accountData, setAccountData] = useState<AccountData>({
    name: user?.name || '', phone: user?.phone || '',
  });
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '', businessType: '', category: '', description: '',
    ecocashPhone: user?.phone || '', whatsapp: user?.phone || '',
    city: '', address: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const goTo = (s: Step) => {
    setStep(s);
    setMaxReached(prev => (s > prev ? s : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateAccount = () => {
    const e: Record<string, string> = {};
    if (!accountData.name.trim()) e.name = 'Full name is required';
    if (!accountData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s]{7,}$/.test(accountData.phone)) e.phone = 'Enter a valid phone number (+263…)';
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

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleStep1Next = async () => {
    if (!validateAccount()) return;
    setLoading(true);
    await updateProfile({ name: accountData.name, phone: accountData.phone });
    setLoading(false);
    goTo(2);
  };

  const handleStep2Next = async () => {
    if (!validateBusiness()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    goTo(3);
  };

  const handleStep3Next = () => goTo(4);

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
      documents: [],
      logoUrl: logoUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
    });
    setLoading(false);
    toast.success('Application submitted!', { description: 'Our team will review it shortly.' });
    navigate('/seller-dashboard');
  };

  // Redirecting to /signup — render nothing rather than flash Step 1's form.
  if (!user) return null;

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

        <div className="mb-8">
          <ProgressStepper current={step} maxReached={maxReached} />
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card header */}
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

          {/* Step content */}
          <div className="p-6">
            {step === 1 && (
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
            {step === 2 && (
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
            {step === 3 && (
              <StepBranding
                userId={user?.id}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                onLogoChange={setLogoUrl}
                onBannerChange={setBannerUrl}
                onNext={handleStep3Next}
                onBack={() => goTo(2)}
              />
            )}
            {step === 4 && (
              <StepReview
                accountData={accountData}
                businessData={businessData}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
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