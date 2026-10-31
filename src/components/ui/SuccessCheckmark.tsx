import * as React from 'react';

export interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const strokeWidths = {
    sm: 3,
    md: 3.5,
    lg: 4,
  };

  return (
    <div
      role="img"
      aria-label="Succès confirmé"
      className={`inline-flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-elevation-2 animate-check-pop ${sizes[size]} ${className}`}
    >
      <svg
        className="w-3/5 h-3/5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidths[size]}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="animate-check-draw"
          d="M 5 13 L 9.5 17.5 L 19 7"
        />
      </svg>
    </div>
  );
};
