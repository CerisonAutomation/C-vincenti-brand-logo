import React from 'react';
import { Skeleton } from './Skeleton';

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  showImage = true,
  showAvatar = false,
  lines = 3,
}) => {
  return (
    <div className={`bg-card p-6 rounded-lg shadow-sm ${className}`}>
      {showImage && (
        <Skeleton className="w-full aspect-video mb-4" />
      )}
      {showAvatar && (
        <div className="flex items-center mb-4">
          <Skeleton className="w-12 h-12 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      )}
      {!showAvatar && (
        <Skeleton className="h-6 w-3/4 mb-3" />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
};
