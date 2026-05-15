import React from 'react';

interface MsikaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'dark' | 'light';
}

export const MsikaLogo: React.FC<MsikaLogoProps> = ({ size = 'md', color = 'dark' }) => {
  const sizes = {
    sm: { h: 16 },
    md: { h: 20 },
    lg: { h: 26 },
  };
  const s = sizes[size];
  const textColor = color === 'dark' ? '#111' : '#fff';

  return (
    <span
      aria-label="msika"
      style={{
        fontSize: s.h,
        fontWeight: 700,
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: '0.08em',
        textTransform: 'lowercase' as const,
        lineHeight: 1,
        color: textColor,
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <span style={{ color: '#009739' }}>m</span>sika
    </span>
  );
};