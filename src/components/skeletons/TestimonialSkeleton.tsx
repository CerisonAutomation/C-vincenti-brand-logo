import React from 'react';
import { Skeleton } from './Skeleton';

interface TestimonialSkeletonProps {
  className?: string;
  items?: number;
}

export const TestimonialSkeleton: React.FC<TestimonialSkeletonProps> = ({
  className = '',
  items = 3,
}) => {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-card p-6 rounded-lg shadow-sm">
          <Skeleton className="h-16 w-full mb-4" />
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
