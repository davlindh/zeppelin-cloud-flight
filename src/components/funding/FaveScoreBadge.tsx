import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaveScoreBadgeProps {
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const FaveScoreBadge: React.FC<FaveScoreBadgeProps> = ({
  score,
  level,
  size = 'md',
  showLabel = true,
  className,
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
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'sprout':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'bloom':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'tree':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'forest':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border-2',
        sizeClasses[size],
        getLevelColor(level),
        className
      )}
    >
      <Sparkles className={iconSizes[size]} />
      {showLabel && <span className="font-normal">Fave</span>}
      <span>{score.toLocaleString()}</span>
    </Badge>
  );
};
