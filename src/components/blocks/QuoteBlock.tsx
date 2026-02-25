import React from 'react';

interface QuoteBlockProps {
  quote: string;
  author: string;
  role?: string;
  className?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  quote,
  author,
  role,
  className = '',
}) => {
  return (
    <section className={`py-20 bg-secondary/30 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <blockquote className="text-2xl lg:text-3xl font-serif text-foreground mb-8 max-w-4xl mx-auto">
          "{quote}"
        </blockquote>
        <cite className="text-lg text-muted-foreground">
          — {author}
          {role && <span className="block text-sm">{role}</span>}
        </cite>
      </div>
    </section>
  );
};
