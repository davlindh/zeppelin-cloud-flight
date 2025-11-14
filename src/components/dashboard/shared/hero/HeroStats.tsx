import { QuickStat } from '@/types/dashboard';
import { TrendIndicator } from '../stats/TrendIndicator';

interface HeroStatsProps {
  stats: QuickStat[];
}

export const HeroStats = ({ stats }: HeroStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const variantStyles = {
          default: 'bg-primary/10 text-primary',
          success: 'bg-green-500/10 text-green-600 dark:text-green-400',
          warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
          destructive: 'bg-red-500/10 text-red-600 dark:text-red-400',
        };
        
        return (
          <div 
            key={index} 
            className="bg-card border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className={`p-2 rounded-full ${variantStyles[stat.variant || 'default']}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.trend !== undefined && (
                <TrendIndicator value={stat.trend} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
