import React from 'react';
import { cn } from '@/lib/utils';

// Badge Component with Context7 Best Practices
// Features: Variants, sizes, accessibility, animations

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
  animation?: boolean;
  pulse?: boolean;
  title?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  clickable = false,
  onClick,
  removable = false,
  onRemove,
  icon,
  dot = false,
  dotColor,
  animation = false,
  pulse = false,
  title,
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'bg-blue-500 text-white hover:bg-blue-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs rounded-sm',
    md: 'px-2.5 py-0.5 text-sm rounded-md',
    lg: 'px-3 py-1 text-base rounded-lg',
  };

  const clickableClasses = clickable || onClick ? 'cursor-pointer' : '';
  const animationClasses = animation ? 'animate-in fade-in zoom-in-95 duration-200' : '';
  const pulseClasses = pulse ? 'animate-pulse' : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        clickableClasses,
        animationClasses,
        pulseClasses,
        className
      )}
      onClick={handleClick}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      title={title}
      onKeyDown={(e) => {
        if ((clickable || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn(
            'inline-block w-2 h-2 rounded-full mr-1.5',
            dotColor || 'bg-current opacity-75'
          )}
        />
      )}

      {/* Icon */}
      {icon && (
        <span className="mr-1 flex-shrink-0">
          {icon}
        </span>
      )}

      {/* Content */}
      <span className="truncate">
        {children}
      </span>

      {/* Remove button */}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 flex-shrink-0 hover:bg-black/20 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Badge variants for common use cases
const BadgeSuccess: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="success" />
);

const BadgeWarning: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="warning" />
);

const BadgeInfo: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="info" />
);

const BadgeDestructive: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="destructive" />
);

// Badge group component for multiple badges
interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className,
  spacing = 'md',
  wrap = true,
}) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center',
        spacingClasses[spacing],
        wrap ? 'flex-wrap' : 'flex-nowrap',
        className
      )}
    >
      {children}
    </div>
  );
};

// Export all components
export { Badge, BadgeSuccess, BadgeWarning, BadgeInfo, BadgeDestructive, BadgeGroup };

// Export types
export type { BadgeProps, BadgeGroupProps };
