import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

/**
 * Card Skeleton - for card-based content
 */
export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4 p-4 border rounded-lg bg-card', className)}>
      <Skeleton variant="card" className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
};

/**
 * List Item Skeleton - for list-based content
 */
export const SkeletonListItem = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center space-x-4 p-4', className)}>
      <Skeleton variant="avatar" className="h-12 w-12 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

/**
 * List Skeleton - multiple list items
 */
export const SkeletonList = ({ 
  items = 3, 
  className 
}: { 
  items?: number; 
  className?: string;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
};

/**
 * Image Skeleton - for image placeholders
 */
export const SkeletonImage = ({ 
  aspectRatio = 'video',
  className 
}: { 
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
  className?: string;
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  };

  return (
    <Skeleton 
      className={cn(
        'w-full',
        aspectClasses[aspectRatio],
        className
      )} 
    />
  );
};

/**
 * Text Skeleton - for text content
 */
export const SkeletonText = ({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
};

/**
 * Table Skeleton - for table content
 */
export const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Product Card Skeleton - for marketplace product cards
 */
export const SkeletonProductCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-3 p-4 border rounded-lg bg-card', className)}>
      <Skeleton className="h-56 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
};

/**
 * Profile Skeleton - for user profile cards
 */
export const SkeletonProfile = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4 p-6 border rounded-lg bg-card', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" className="h-16 w-16" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex space-x-2">
        <Skeleton variant="button" className="h-9 flex-1" />
        <Skeleton variant="button" className="h-9 flex-1" />
      </div>
    </div>
  );
};
