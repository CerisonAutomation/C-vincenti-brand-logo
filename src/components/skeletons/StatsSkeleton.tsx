import React from 'react';
import { Skeleton } from './Skeleton';

interface StatsSkeletonProps {
  className?: string;
  items?: number;
}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({
  className = '',
  items = 4,
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
};
