import React from 'react';
import { Skeleton } from './Skeleton';

interface FormSkeletonProps {
  className?: string;
  fields?: number;
  showButtons?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  className = '',
  fields = 4,
  showButtons = true,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showButtons && (
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  );
};
