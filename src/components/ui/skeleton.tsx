import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'default',
  animation = 'shimmer',
  ...props 
}) => {
  const variantClasses = {
    default: 'h-4 w-full rounded-md',
    card: 'h-48 w-full rounded-lg',
    text: 'h-4 w-3/4 rounded-md',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-20 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:1000px_100%]',
    none: 'bg-muted'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  );
};

// Skeleton compositions for common use cases
const SkeletonCardLegacy: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton variant="card" />
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const SkeletonProfileLegacy: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-4', className)}>
    <Skeleton variant="avatar" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export { Skeleton, SkeletonCardLegacy, SkeletonProfileLegacy };
export type { SkeletonProps };