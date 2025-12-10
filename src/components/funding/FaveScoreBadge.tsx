import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Award, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FaveScoreBadgeProps {
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  showHistory?: boolean;
  recentPoints?: number;
  nextLevelPoints?: number;
  enableTooltip?: boolean;
}

export const FaveScoreBadge: React.FC<FaveScoreBadgeProps> = ({
  score,
  level = 'seed',
  size = 'md',
  showLabel = true,
  className,
  showHistory = false,
  recentPoints = 0,
  nextLevelPoints,
  enableTooltip = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const getLevelColor = (lvl?: string) => {
    switch (lvl) {
      case 'seed':
        return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      case 'sprout':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'bloom':
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
      case 'tree':
        return 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200';
      case 'forest':
        return 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200';
      default:
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
    }
  };

  const getLevelIcon = (lvl?: string) => {
    switch (lvl) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'bloom': return '🌸';
      case 'tree': return '🌳';
      case 'forest': return '🌲';
      default: return '⭐';
    }
  };

  const getLevelThresholds = (lvl?: string) => {
    switch (lvl) {
      case 'seed': return { current: 0, next: 50, threshold: 50 };
      case 'sprout': return { current: 50, next: 150, threshold: 150 };
      case 'bloom': return { current: 150, next: 300, threshold: 300 };
      case 'tree': return { current: 300, next: 500, threshold: 500 };
      case 'forest': return { current: 500, next: 1000, threshold: 1000 };
      default: return { current: 0, next: 1000, threshold: 1000 };
    }
  };

  const levelInfo = getLevelThresholds(level);
  const progressPercent = nextLevelPoints ?
    Math.min((score / nextLevelPoints) * 100, 100) :
    Math.min((score / levelInfo.threshold) * 100, 100);

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border-2 transition-all duration-200 cursor-pointer hover:scale-105',
        sizeClasses[size],
        getLevelColor(level),
        recentPoints > 0 && 'animate-pulse',
        className
      )}
    >
      <Sparkles className={iconSizes[size]} />
      {showLabel && <span className="font-normal">Fave</span>}
      <span>{score.toLocaleString()}</span>
      {recentPoints > 0 && (
        <span className="text-green-600 dark:text-green-400 font-bold text-xs">
          +{recentPoints}
        </span>
      )}
    </Badge>
  );

  const tooltipContent = (
    <div className="space-y-2 p-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getLevelIcon(level)}</span>
        <div>
          <p className="font-semibold text-sm">{level?.charAt(0).toUpperCase() + level?.slice(1)} Level</p>
          <p className="text-xs text-muted-foreground">{score.toLocaleString()} total points</p>
        </div>
      </div>

      {nextLevelPoints && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress to next level</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {recentPoints > 0 && (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <TrendingUp className="h-3 w-3" />
          +{recentPoints} points recently earned
        </div>
      )}

      <div className="pt-2 border-t space-y-1">
        <p className="text-xs font-medium">How to earn points:</p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>• 1 point per 10 SEK donated</div>
          <div>• 25 points for event attendance</div>
          <div>• Bonus for collaborations & projects</div>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm p-0">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
