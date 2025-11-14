import { LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { TrendIndicator } from './TrendIndicator';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  progressValue?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export const MetricDisplay = ({
  label,
  value,
  icon: Icon,
  trend,
  progressValue,
  variant = 'default',
}: MetricDisplayProps) => {
  const variantStyles = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{value}</span>
      </div>
      {progressValue !== undefined && (
        <Progress value={progressValue} className="h-2" />
      )}
      {trend !== undefined && <TrendIndicator value={trend} />}
    </div>
  );
};
