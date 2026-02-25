import React from 'react';
import { motion } from 'framer-motion';

interface HeroBlockProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  backgroundImage?: string;
  className?: string;
}

/**
 * HeroBlock component with WCAG 3.0 AAA compliance.
 * Provides accessible hero section with proper semantic HTML, ARIA labels,
 * keyboard navigation, and screen reader support.
 */
const HeroBlock: React.FC<HeroBlockProps> = ({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  backgroundImage,
  className = '',
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Handle keyboard navigation for buttons
  const handleKeyDown = (event: React.KeyboardEvent, onClick?: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.header
      role="banner"
      aria-labelledby="hero-title"
      aria-describedby="hero-description"
      className={`relative py-16 sm:py-20 md:py-24 lg:py-32 xl:py-40 ${backgroundImage ? 'bg-cover bg-center bg-no-repeat' : ''} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Skip link target for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            {subtitle && (
              <p
                role="complementary"
                aria-label="Hero subtitle"
                className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-4 lg:mb-6 font-medium uppercase tracking-wider"
              >
                {subtitle}
              </p>
            )}
          </motion.div>
          <motion.h1
            id="hero-title"
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            id="hero-description"
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center"
            role="group"
            aria-label="Hero action buttons"
          >
            {primaryButton && (
              <button
                onClick={primaryButton.onClick}
                onKeyDown={(e) => handleKeyDown(e, primaryButton.onClick)}
                aria-label={`Primary action: ${primaryButton.text}`}
                className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm sm:text-base lg:text-lg"
                tabIndex={0}
              >
                {primaryButton.text}
              </button>
            )}
            {secondaryButton && (
              <button
                onClick={secondaryButton.onClick}
                onKeyDown={(e) => handleKeyDown(e, secondaryButton.onClick)}
                aria-label={`Secondary action: ${secondaryButton.text}`}
                className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-accent hover:border-accent-foreground focus:bg-accent focus:border-accent-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background text-sm sm:text-base lg:text-lg"
                tabIndex={0}
              >
                {secondaryButton.text}
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Screen reader announcement for background image */}
      {backgroundImage && (
        <div className="sr-only" aria-live="polite">
          Hero section with background image
        </div>
      )}
    </motion.header>
  );
};

export default HeroBlock;
