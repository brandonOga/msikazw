import React from 'react';

export const AFRICAN_CODES = [
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+243', flag: '🇨🇩', name: 'DR Congo' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
];

/** Split a stored combined value like "+263 77 123 4567" into [code, number]. */
export function splitPhone(value: string): [string, string] {
  if (!value) return ['+263', ''];
  const trimmed = value.trim();
  if (!trimmed.startsWith('+')) return ['+263', trimmed];
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return [trimmed, ''];
  return [trimmed.slice(0, spaceIdx), trimmed.slice(spaceIdx + 1)];
}

/** Combine code + number into a single stored string. */
export function joinPhone(code: string, number: string): string {
  const n = number.trim();
  return n ? `${code} ${n}` : '';
}

interface PhoneInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  number: string;
  onNumberChange: (number: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  /** Extra class on the outer wrapper div */
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
}

export function PhoneInput({
  code, onCodeChange, number, onNumberChange,
  placeholder = '77 123 4567',
  error = false,
  disabled = false,
  className = '',
  inputClassName = '',
  selectClassName = '',
}: PhoneInputProps) {
  return (
    <div className={`flex gap-2 min-w-0 ${className}`}>
      <select
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        disabled={disabled}
        className={`border rounded-lg bg-gray-50 text-gray-900 focus:outline-none transition-colors px-2.5 shrink-0 ${
          error ? 'border-red-400' : 'border-gray-200 focus:border-[#009739]'
        } ${selectClassName}`}
        style={{ minWidth: 108, fontSize: '0.85rem' }}
      >
        {AFRICAN_CODES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={e => onNumberChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex-1 min-w-0 bg-gray-50 border rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors ${
          error ? 'border-red-400' : 'border-gray-200 focus:border-[#009739]'
        } ${inputClassName}`}
      />
    </div>
  );
}
