import React from 'react';
import { Skeleton } from './Skeleton';

interface HeroSkeletonProps {
  className?: string;
  showSubtitle?: boolean;
  showButtons?: boolean;
}

export const HeroSkeleton: React.FC<HeroSkeletonProps> = ({
  className = '',
  showSubtitle = true,
  showButtons = true,
}) => {
  return (
    <section className={`relative py-20 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        {showSubtitle && (
          <Skeleton className="h-4 w-32 mx-auto mb-4" />
        )}
        <Skeleton className="h-12 lg:h-16 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
        {showButtons && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        )}
      </div>
    </section>
  );
};
