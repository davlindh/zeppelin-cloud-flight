import React from 'react';
import { Heart, Eye, Share2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickActionsOverlayProps {
  isWatching: boolean;
  isSharing?: boolean;
  isInComparison?: boolean;
  onToggleWatch: (e: React.MouseEvent) => void;
  onQuickView?: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onToggleComparison?: (e: React.MouseEvent) => void;
  className?: string;
  variant?: "default" | "compact"; // ADDED
}

// Provide sensible defaults to variant
export const QuickActionsOverlay: React.FC<QuickActionsOverlayProps> = ({
  isWatching,
  isSharing = false,
  isInComparison = false,
  onToggleWatch,
  onQuickView,
  onShare,
  onToggleComparison,
  className,
  variant = "default"
}) => {
  return (
    <TooltipProvider>
      <div className={cn(
        variant === "compact"
          ? "absolute right-2 top-2 z-10 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4",
        className
      )}>
        <div className={cn(
          "flex",
          variant === "compact" ? "flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-1 py-2 shadow-md" : "flex-row items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg"
        )}>
          {/* Save/Watch Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isWatching ? "default" : "outline"}
                className={cn(
                  "h-10 w-10 p-0 rounded-full transition-all duration-200",
                  isWatching 
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                    : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                )}
                onClick={onToggleWatch}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isWatching && "fill-current"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isWatching ? "Remove from saved" : "Save item"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Quick View Action */}
          {onQuickView && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                  onClick={onQuickView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick view</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Compare Action */}
          {onToggleComparison && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isInComparison ? "default" : "outline"}
                  className={cn(
                    "h-10 w-10 p-0 rounded-full transition-all duration-200",
                    isInComparison 
                      ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500" 
                      : "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                  )}
                  onClick={onToggleComparison}
                >
                  <BarChart3 className={cn(
                    "h-4 w-4",
                    isInComparison && "fill-current"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isInComparison ? "Remove from comparison" : "Add to comparison"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Share Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200"
                onClick={onShare}
                disabled={isSharing}
              >
                <Share2 className={cn(
                  "h-4 w-4",
                  isSharing && "animate-pulse"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share item</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
