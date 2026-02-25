import React from 'react';
import { Skeleton } from './Skeleton';

interface ContentSkeletonProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  className = '',
  showImage = true,
  lines = 4,
}) => {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          {showImage && (
            <div className="flex-1">
              <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
