import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyCardSkeletonProps {
  index: number;
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ index: _index }) => {
  return (
    <div className="group animate-pulse">
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100">
        {/* Image skeleton */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
          <Skeleton className="w-full h-full" />

          {/* Top badges skeleton */}
          <div className="absolute top-4 left-4 space-y-2">
            <Skeleton className="w-20 h-7 rounded-full" />
          </div>

          {/* Rating skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="w-16 h-7 rounded-full" />
          </div>

          {/* Favorite button skeleton */}
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="p-6">
          {/* Location skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>

          {/* Title skeleton */}
          <Skeleton className="w-full h-6 mb-3" />
          <Skeleton className="w-3/4 h-6 mb-4" />

          {/* Property features skeleton */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-8 h-4" />
              <Skeleton className="w-6 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-8 h-4" />
              <Skeleton className="w-6 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-8 h-4" />
              <Skeleton className="w-6 h-4" />
            </div>
          </div>

          {/* Amenities tags skeleton */}
          <div className="flex gap-2 mb-4">
            <Skeleton className="w-16 h-7 rounded-full" />
            <Skeleton className="w-20 h-7 rounded-full" />
            <Skeleton className="w-14 h-7 rounded-full" />
          </div>

          {/* Price and CTA skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <Skeleton className="w-20 h-7 mb-1" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-24 h-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Virtual scrolling skeleton loader
interface VirtualSkeletonLoaderProps {
  count?: number;
}

export const VirtualSkeletonLoader: React.FC<VirtualSkeletonLoaderProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={`skeleton-${i}`} index={i} />
      ))}
    </div>
  );
};
