import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const EnhancedAuctionSkeleton = () => (
  <Card className="card-base card-constrained loading-breathing shadow-depth-2">
    <CardHeader className="pb-3">
      <div className="h-48 w-full rounded-lg mb-4 loading-shimmer" />
      <div className="h-6 w-3/4 loading-shimmer rounded" />
      <div className="h-4 w-1/2 loading-shimmer rounded mt-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-20 loading-shimmer rounded" />
        <div className="h-5 w-16 loading-shimmer rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-24 loading-shimmer rounded" />
        <div className="h-8 w-20 loading-shimmer rounded" />
      </div>
      <div className="h-10 w-full loading-shimmer rounded-lg" />
    </CardContent>
  </Card>
);

export const EnhancedProductSkeleton = () => (
  <Card className="card-base card-constrained loading-breathing shadow-depth-2">
    <CardHeader className="pb-3">
      <div className="relative">
        <div className="h-48 w-full rounded-lg mb-4 loading-shimmer" />
        <div className="absolute top-2 right-2">
          <div className="h-8 w-16 loading-shimmer rounded-full" />
        </div>
      </div>
      <div className="h-6 w-3/4 loading-shimmer rounded" />
      <div className="flex items-center gap-2 mt-2">
        <div className="h-4 w-16 loading-shimmer rounded" />
        <div className="h-4 w-12 loading-shimmer rounded" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-7 w-20 loading-shimmer rounded" />
        <div className="h-5 w-16 loading-shimmer rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 loading-shimmer rounded-lg" />
        <div className="h-9 w-12 loading-shimmer rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

export const EnhancedServiceSkeleton = () => (
  <Card className="card-base card-constrained animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4 bg-slate-200" />
          <Skeleton className="h-4 w-1/2 bg-slate-200" />
        </div>
      </div>
      <Skeleton className="h-6 w-4/5 bg-slate-200" />
      <Skeleton className="h-4 w-2/3 bg-slate-200 mt-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24 bg-slate-200" />
        <Skeleton className="h-5 w-16 bg-slate-200" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 bg-slate-200 rounded-full" />
        <Skeleton className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full bg-slate-200 rounded-lg" />
    </CardContent>
  </Card>
);

export const LoadingGrid = ({ type = 'product', count = 3 }: { type?: 'auction' | 'product' | 'service', count?: number }) => {
  const SkeletonComponent = {
    auction: EnhancedAuctionSkeleton,
    product: EnhancedProductSkeleton,
    service: EnhancedServiceSkeleton
  }[type];

  return (
    <div className="grid-responsive">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
          <SkeletonComponent />
        </div>
      ))}
    </div>
  );
};

export const InlineLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-slate-600 font-medium">{message}</span>
    </div>
  </div>
);

export const PulseLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
  );
};

export const ProgressiveImageLoader = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 loading-shimmer" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`image-blur-up ${isLoaded ? 'loaded' : ''} ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
      
      {isError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center loading-fade-in">
          <div className="text-slate-400 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};
