import React from 'react';
import { getInitials } from '../../lib/initials';

// Store logo — falls back to an initials avatar when the seller hasn't
// uploaded one (logo_url is empty), instead of a broken/empty <img>.
export function SellerLogo({
  name, src, className, style,
}: {
  name: string; src?: string; className?: string; style?: React.CSSProperties;
}) {
  if (src) {
    return <img src={src} alt={name} className={className} style={style} loading="lazy" />;
  }
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#009739', color: '#fff', fontWeight: 800,
      }}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
