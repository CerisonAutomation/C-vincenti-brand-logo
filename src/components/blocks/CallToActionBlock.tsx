import React from 'react';

interface CallToActionBlockProps {
  title: string;
  description: string;
  buttonText: string;
  buttonOnClick: () => void;
  backgroundColor?: string;
  className?: string;
}

export const CallToActionBlock: React.FC<CallToActionBlockProps> = ({
  title,
  description,
  buttonText,
  buttonOnClick,
  backgroundColor = 'bg-primary',
  className = '',
}) => {
  return (
    <section className={`py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 ${backgroundColor} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed">
            {description}
          </p>
          <button
            onClick={buttonOnClick}
            className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary text-sm sm:text-base lg:text-lg"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};
