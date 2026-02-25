import React from 'react';
import { BRAND_NAME, BRAND_LABEL } from '@/lib/brand';
import logoWordmark from '@/assets/logo-wordmark.png';

interface LogoProps {
  className?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  variant?: 'default' | 'minimal' | 'elegant';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  subText = BRAND_LABEL,
  size = 'md',
  onClick,
  variant = 'default',
  animated = true,
}) => {
  const sizeClasses = {
    sm: {
      width: 'w-32',
      height: 'h-10'
    },
    md: {
      width: 'w-48',
      height: 'h-14'
    },
    lg: {
      width: 'w-64',
      height: 'h-20'
    }
  };

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={handleLogoClick}
      className={`group flex flex-col items-center cursor-pointer select-none transition-all duration-700 hover:scale-[1.02] ${className}`}
      role="button"
      aria-label={`${BRAND_NAME} Home`}
    >
      {/* Main logo image */}
      <img
        src={logoWordmark}
        alt={`${BRAND_NAME} ${subText}`}
        className={`${sizeClasses[size].width} ${sizeClasses[size].height} object-contain transition-all duration-500 group-hover:brightness-110 ${
          animated ? 'group-hover:transform group-hover:rotate-[-0.5deg]' : ''
        }`}
        loading="eager"
      />

      {/* Optional decorative elements for elegant variant */}
      {variant === 'elegant' && (
        <>
          <div className="relative mt-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-40" />
          </div>
          <div className="w-1 h-1 bg-primary/40 rounded-full opacity-60 mt-1 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      )}

      {/* Hover effect accent line */}
      <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 transition-all duration-700 mt-2" />
    </div>
  );
};
