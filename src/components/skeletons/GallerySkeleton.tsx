import React from 'react';
import { Skeleton } from './Skeleton';

interface GallerySkeletonProps {
  className?: string;
  items?: number;
}

export const GallerySkeleton: React.FC<GallerySkeletonProps> = ({
  className = '',
  items = 6,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="aspect-square overflow-hidden rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};
