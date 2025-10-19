import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MediaGridSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const MediaGridSkeleton: React.FC<MediaGridSkeletonProps> = ({
  count = 6,
  viewMode = 'grid',
  className,
}) => {
  const containerClass = cn(
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'space-y-3',
    className
  );

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="aspect-video w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
