import React from 'react';
import { getInitials } from '../../lib/initials';

// Store cover/banner — falls back to a branded gradient with a large
// initials watermark when the seller hasn't uploaded one (banner_url empty).
export function SellerBanner({
  name, src, className, style,
}: {
  name: string; src?: string; className?: string; style?: React.CSSProperties;
}) {
  if (src) {
    return <img src={src} alt="" aria-hidden="true" className={className} style={style} loading="lazy" />;
  }
  return (
    <div
      className={className}
      style={{
        ...style,
        width: '100%', height: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        background: 'linear-gradient(135deg, #009739 0%, #00542e 100%)',
      }}
      aria-hidden="true"
    >
      <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 900, fontSize: '3.5rem', letterSpacing: '0.05em' }}>
        {getInitials(name)}
      </span>
    </div>
  );
}
