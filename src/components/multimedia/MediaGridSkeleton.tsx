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
          <div 
            key={index} 
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card shadow-sm animate-pulse"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="rounded-xl border border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow animate-pulse"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Preview skeleton with gradient */}
          <div className="relative">
            <Skeleton className="w-full aspect-video" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          
          {/* Content skeleton */}
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};