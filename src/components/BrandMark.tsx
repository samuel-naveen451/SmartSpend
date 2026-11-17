import React from 'react';

interface BrandMarkProps {
  compact?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="stroke-current"
        >
          <rect x="3" y="4" width="18" height="16" rx="2.5" strokeWidth="2" />
          <path d="M3 10h18" strokeWidth="2" />
          <path d="M8 15h4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-neutral-950 whitespace-nowrap">
          SmartSpend
        </span>
      )}
    </div>
  );
};
