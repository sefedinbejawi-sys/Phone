import React from 'react';

interface HamtineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const HamtineLogo: React.FC<HamtineLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 select-none group`}>
        {/* Ambient Ring Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-red-600/40 via-amber-500/20 to-red-600/40 blur-sm opacity-70 group-hover:opacity-100 transition duration-500" />
        {/* SVG Logo */}
        <img
          src="/hamtine-logo.svg"
          alt="شعار حمتين تيليكوم 4 - Hamtine Telecom 4"
          className="relative w-full h-full object-contain rounded-full shadow-[0_4px_20px_rgba(225,29,72,0.35)] border border-red-500/30"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-red-400 transition">
              حمتين تيليكوم
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[10px] tracking-wide shadow-sm">
              فرع 4
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
            Hamtine Telecom 4 • El Oued
          </span>
        </div>
      )}
    </div>
  );
};
