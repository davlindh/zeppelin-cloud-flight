import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  progress: number;
  pullDistance: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isPulling,
  isRefreshing,
  progress,
  pullDistance
}) => {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
    >
      <div className={cn(
        "bg-white/95 backdrop-blur-sm shadow-lg rounded-b-2xl px-6 py-3",
        "flex items-center gap-3 border border-border/20",
        "transition-opacity duration-200",
        isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
      )}>
        <RefreshCw 
          className={cn(
            "h-5 w-5 text-primary",
            isRefreshing && "animate-spin"
          )} 
          style={{
            transform: !isRefreshing ? `rotate(${progress * 3.6}deg)` : undefined
          }}
        />
        <span className="text-sm font-medium text-foreground">
          {isRefreshing ? 'Refreshing...' : progress >= 100 ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
};
