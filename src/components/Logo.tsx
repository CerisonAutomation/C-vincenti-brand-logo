import React from 'react';

interface LogoProps {
  className?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  subText = 'PROPERTY MANAGEMENT', 
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: { main: 'text-[22px] sm:text-[26px]', sub: 'text-[5.5px] sm:text-[6.5px] mt-0.5' },
    md: { main: 'text-[32px] sm:text-[38px]', sub: 'text-[7px] sm:text-[8px] mt-1' },
    lg: { main: 'text-[48px] sm:text-[58px]', sub: 'text-[9px] sm:text-[10px] mt-1.5' }
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
      className={`flex flex-col items-start cursor-pointer group transition-all duration-500 select-none ${className}`}
      role="button"
      aria-label="Christiano Vincenti Home"
    >
      <span
        className={`text-foreground leading-none group-hover:text-primary transition-colors duration-500 ${sizeClasses[size].main}`}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          letterSpacing: '0.01em',
        }}
      >
        Christiano Vincenti
      </span>
      <span
        className={`text-primary/60 ${sizeClasses[size].sub}`}
        style={{
          fontFamily: "'Raleway', sans-serif",
          fontWeight: 300,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
        }}
      >
        {subText}
      </span>
    </div>
  );
};
