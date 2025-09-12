import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MediaGridSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const MediaGridSkeleton: React.FC<MediaGridSkeletonProps> = ({
  count = 6,
  viewMode = 'grid',
  className
}) => {
  const containerClass = cn(
    viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
      : "space-y-3",
    className
  );

  if (viewMode === 'list') {
    return (
      <div className={containerClass}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border overflow-hidden bg-card">
          {/* Preview skeleton */}
          <Skeleton className="w-full aspect-video" />
          
          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex gap-1">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};