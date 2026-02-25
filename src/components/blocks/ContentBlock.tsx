import React from 'react';

interface ContentBlockProps {
  title?: string;
  subtitle?: string;
  content: string | React.ReactNode;
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
  className?: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  title,
  subtitle,
  content,
  image,
  imageAlt,
  reverse = false,
  className = '',
}) => {
  return (
    <section className={`py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 sm:gap-10 lg:gap-12 xl:gap-16`}>
          <div className="flex-1 w-full lg:w-auto">
            {subtitle && (
              <p className="text-xs sm:text-sm lg:text-base font-medium text-primary mb-3 sm:mb-4 lg:mb-6 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
                {title}
              </h2>
            )}
            <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl text-muted-foreground max-w-none">
              {content}
            </div>
          </div>
          {image && (
            <div className="flex-1 w-full lg:w-auto">
              <img
                src={image}
                alt={imageAlt || ''}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
