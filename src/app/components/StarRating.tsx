import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  size?: number;
  className?: string;
}

/**
 * Renders a single filled star icon for use next to a numeric rating.
 */
export function StarRating({ size = 14, className = '' }: StarRatingProps) {
  return (
    <Star
      className={className}
      style={{ width: size, height: size, color: '#f5a623' }}
      fill="#f5a623"
      strokeWidth={0}
    />
  );
}
