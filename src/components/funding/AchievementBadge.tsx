import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star, Zap, Heart, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlocked: boolean;
    earnedAt?: string;
    progress?: number;
    maxProgress?: number;
  };
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  className
}) => {
  const getIcon = (iconName: string) => {
    const iconMap = {
      trophy: Trophy,
      medal: Medal,
      award: Award,
      star: Star,
      zap: Zap,
      heart: Heart,
      users: Users,
      target: Target
    };
    return iconMap[iconName as keyof typeof iconMap] || Star;
  };

  const Icon = getIcon(achievement.icon);

  const progressPercent = achievement.progress && achievement.maxProgress
    ? (achievement.progress / achievement.maxProgress) * 100
    : achievement.unlocked ? 100 : 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-2 p-3 h-auto',
        achievement.unlocked
          ? `${achievement.color} border-2`
          : 'text-muted-foreground border-dashed opacity-60',
        className
      )}
    >
      <Icon className={cn(
        'h-4 w-4',
        achievement.unlocked ? 'text-current' : 'text-muted-foreground'
      )} />

      <div className="flex flex-col text-left min-w-0 flex-1">
        <span className="font-semibold text-sm truncate">
          {achievement.title}
        </span>
        <span className="text-xs opacity-80 truncate">
          {achievement.description}
        </span>

        {!achievement.unlocked && achievement.progress !== undefined && (
          <div className="mt-1 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{achievement.progress} / {achievement.maxProgress}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {achievement.unlocked && (
        <div className="flex items-center gap-1 text-xs opacity-80">
          <Star className="h-3 w-3" />
          Earned
        </div>
      )}
    </Badge>
  );
};
