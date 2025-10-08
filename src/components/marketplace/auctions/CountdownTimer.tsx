
import React from 'react';
import { Clock } from 'lucide-react';
import { useCountdown } from '@/hooks/marketplace/useCountdown';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
  showIcon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  className,
  showIcon = true
}) => {
  const { timeLeft, isEnded, isUrgent, isCritical } = useCountdown(endTime);

  const getTimerClasses = () => {
    if (isEnded) return 'text-slate-500';
    if (isCritical) return 'text-red-600 animate-pulse';
    if (isUrgent) return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div className={cn('flex items-center gap-1', getTimerClasses(), className)}>
      {showIcon && <Clock className="h-4 w-4" />}
      <span className="font-semibold text-sm">
        {timeLeft}
      </span>
    </div>
  );
};
