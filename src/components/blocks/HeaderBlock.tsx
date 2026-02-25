import React from 'react';

interface HeaderBlockProps {
  logo: React.ReactNode;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  ctaButton?: {
    text: string;
    onClick: () => void;
  };
  onMenuToggle?: () => void;
  className?: string;
}

export const HeaderBlock: React.FC<HeaderBlockProps> = ({
  logo,
  navigation,
  ctaButton,
  onMenuToggle,
  className = '',
}) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {logo}
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {ctaButton && (
              <button
                onClick={ctaButton.onClick}
                className="hidden sm:block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {ctaButton.text}
              </button>
            )}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="md:hidden p-2 text-foreground"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
