import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  label?: string;
}

export const TrendIndicator = ({ value, label }: TrendIndicatorProps) => {
  const isPositive = value >= 0;
  
  return (
    <div className="flex items-center gap-1 text-xs">
      {isPositive ? (
        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
      ) : (
        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
      )}
      <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
        {Math.abs(value).toFixed(1)}%
      </span>
      {label && <span className="text-muted-foreground ml-1">{label}</span>}
    </div>
  );
};
