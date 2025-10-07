
import React from 'react';
import { Heart, Eye, Share2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FloatingActionButtonsProps {
  isWatching: boolean;
  isSharing?: boolean;
  isInComparison?: boolean;
  onToggleWatch: (e: React.MouseEvent) => void;
  onQuickView?: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onToggleComparison?: (e: React.MouseEvent) => void;
  className?: string;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  isWatching,
  isSharing = false,
  isInComparison = false,
  onToggleWatch,
  onQuickView,
  onShare,
  onToggleComparison,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn("absolute inset-0 pointer-events-none", className)}>
        {/* Top Left - Heart/Watch Action */}
        <div className="absolute top-3 left-3 z-10 pointer-events-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isWatching ? "default" : "outline"}
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-spring shadow-depth-2 backdrop-blur-sm",
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                  "interactive-magnetic focus-glow",
                  isWatching 
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500 hover-glow-accent" 
                    : "bg-white/95 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                )}
                onClick={onToggleWatch}
              >
                <Heart className={cn(
                  "h-4 w-4 transition-transform",
                  isWatching && "fill-current scale-110"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isWatching ? "Remove from saved" : "Save item"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Top Right - Comparison Action */}
        {onToggleComparison && (
          <div className="absolute top-3 right-3 z-10 pointer-events-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isInComparison ? "default" : "outline"}
                  className={cn(
                    "h-9 w-9 p-0 rounded-full transition-spring shadow-depth-2 backdrop-blur-sm",
                    "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                    "interactive-magnetic focus-glow",
                    isInComparison 
                      ? "bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-hover))] text-white border-[hsl(var(--brand-primary))] hover-glow-accent" 
                      : "bg-white/95 hover:bg-[hsl(var(--brand-primary)/0.1)] hover:text-[hsl(var(--brand-primary))] hover:border-[hsl(var(--brand-primary)/0.3)]"
                  )}
                  onClick={onToggleComparison}
                >
                  <BarChart3 className={cn(
                    "h-4 w-4 transition-transform",
                    isInComparison && "fill-current scale-110"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isInComparison ? "Remove from comparison" : "Add to comparison"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Secondary Actions - Bottom Right on Hover */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-auto">
          <div className={cn(
            "flex items-center gap-2 transition-all duration-300",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "translate-y-2 group-hover:translate-y-0"
          )}>
            {/* Quick View */}
            {onQuickView && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full bg-white/95 backdrop-blur-sm hover:bg-[hsl(var(--brand-accent)/0.1)] hover:text-[hsl(var(--brand-accent))] hover:border-[hsl(var(--brand-accent)/0.3)] transition-spring shadow-depth-2 interactive-magnetic"
                    onClick={onQuickView}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Quick view</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full bg-white/95 backdrop-blur-sm hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-spring shadow-depth-2 interactive-magnetic"
                  onClick={onShare}
                  disabled={isSharing}
                >
                  <Share2 className={cn(
                    "h-3.5 w-3.5",
                    isSharing && "animate-pulse"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Share item</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
