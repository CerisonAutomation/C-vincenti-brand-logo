import React from 'react';
import { Skeleton } from './Skeleton';

interface PricingSkeletonProps {
  className?: string;
  plans?: number;
}

export const PricingSkeleton: React.FC<PricingSkeletonProps> = ({
  className = '',
  plans = 3,
}) => {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {Array.from({ length: plans }).map((_, i) => (
        <div key={i} className="bg-card p-8 rounded-lg shadow-sm border">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-8 w-20 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};
