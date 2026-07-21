import React from 'react';
import logoFullColor from '../../assets/logo/msika-logo-full-color.svg';
import logoReverse from '../../assets/logo/msika-logo-reverse.svg';

interface MsikaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'dark' | 'light';
}

const HEIGHTS = { sm: 16, md: 20, lg: 26 };

export const MsikaLogo: React.FC<MsikaLogoProps> = ({ size = 'md', color = 'dark' }) => {
  const height = HEIGHTS[size];

  return (
    <span
      aria-label="msika"
      style={{ display: 'inline-flex', alignItems: 'center', userSelect: 'none' }}
    >
      <img
        src={color === 'dark' ? logoFullColor : logoReverse}
        alt=""
        aria-hidden="true"
        style={{ height, width: 'auto', display: 'block' }}
      />
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        msika
      </span>
    </span>
  );
};
