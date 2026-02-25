import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`bg-card border border-border rounded-lg shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || description) && (
        <div className="p-6 border-b border-border">
          {title && <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-secondary/50 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
};
