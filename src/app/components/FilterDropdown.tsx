import { ChevronDown } from 'lucide-react';

export function FilterDropdown({
  value, onChange, options, label, minWidth = '140px',
}: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; label: string; minWidth?: string;
}) {
  const isActive = value !== options[0].value;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none transition-colors"
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          border: isActive ? '1.5px solid #009739' : '1px solid #e5e7eb',
          background: isActive ? '#f0faf4' : '#fff',
          color: isActive ? '#009739' : '#374151',
          minWidth,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: isActive ? '#009739' : '#9ca3af' }} />
    </div>
  );
}
