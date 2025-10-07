
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'pending';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  className
}) => {
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    pending: Clock
  };

  const colors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    pending: 'text-blue-600'
  };

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const Icon = icons[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn(sizes[size], colors[status])} />
      {message && (
        <span className={cn('text-sm', colors[status])}>
          {message}
        </span>
      )}
    </div>
  );
};
