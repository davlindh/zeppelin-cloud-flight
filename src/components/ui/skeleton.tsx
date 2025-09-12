import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'default', 
  ...props 
}) => {
  const variantClasses = {
    default: 'h-4 w-full',
    card: 'h-48 w-full',
    text: 'h-4 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-20'
  };

  return (
    <div
      className={cn(
        'skeleton',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

// Skeleton compositions for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton variant="card" />
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const SkeletonProfile: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-4', className)}>
    <Skeleton variant="avatar" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export { Skeleton, SkeletonCard, SkeletonProfile };