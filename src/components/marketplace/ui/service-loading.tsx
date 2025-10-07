
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ServiceLoadingProps {
  variant?: 'default' | 'compact' | 'gallery' | 'details';
  count?: number;
}

export const ServiceLoading: React.FC<ServiceLoadingProps> = ({
  variant = 'default',
  count = 1
}) => {
  if (variant === 'gallery') {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'details') {
    return (
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full max-w-sm mx-auto border-0 shadow-lg h-full flex flex-col">
          <CardHeader className={`${isCompact ? "pb-2" : "pb-3"} flex-shrink-0`}>
            <div className={`rounded-lg mb-4 overflow-hidden ${
              isCompact ? 'aspect-[4/3]' : 'aspect-video'
            }`}>
              <Skeleton className="w-full h-full" />
            </div>
            
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <Skeleton className={`mb-2 ${isCompact ? 'h-5 w-3/4' : 'h-6 w-3/4'}`} />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          
          <CardContent className="flex-grow flex flex-col justify-end">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </>
  );
};
