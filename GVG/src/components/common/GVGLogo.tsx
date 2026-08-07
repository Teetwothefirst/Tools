'use client';

import React from 'react';

interface GVGLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
}

export const GVGLogo: React.FC<GVGLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const dimensionClass =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'md'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-16 h-16'
      : 'w-24 h-24';

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center ${dimensionClass} ${className}`}>
        <img
          src="/gvg-logo.svg"
          alt="GVG Official Logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${dimensionClass} shrink-0`}>
        <img
          src="/gvg-logo.svg"
          alt="Grant for Vulnerable Groups (GVG) Logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-black text-lg sm:text-xl tracking-tight text-[#008751] dark:text-emerald-400 leading-none">
            NSIPA GVG
          </span>
          {/* <span className="text-[9px] sm:text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full font-extrabold uppercase">
            Flagship
          </span> */}
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-1">
          Grant for Vulnerable Groups
        </p>
      </div>
    </div>
  );
};
