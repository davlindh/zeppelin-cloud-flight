import React from 'react';
import { cn } from '@/lib/utils';

interface AdvancedContainerProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  centerContent?: boolean;
  applyGoldenRatio?: boolean;
}

export const AdvancedContainer: React.FC<AdvancedContainerProps> = ({
  children,
  size = 'xl',
  className = '',
  centerContent = true,
  applyGoldenRatio = false
}) => {
  const getSizeClasses = () => {
    const baseClasses = centerContent ? 'mx-auto' : '';
    const paddingClasses = applyGoldenRatio 
      ? 'px-[var(--space-lg)] py-[var(--space-xl)]' 
      : 'px-4 sm:px-6 lg:px-8';

    switch (size) {
      case 'xs':
        return `max-w-[var(--container-xs)] ${baseClasses} ${paddingClasses}`;
      case 'sm':
        return `max-w-[var(--container-sm)] ${baseClasses} ${paddingClasses}`;
      case 'md':
        return `max-w-[var(--container-md)] ${baseClasses} ${paddingClasses}`;
      case 'lg':
        return `max-w-[var(--container-lg)] ${baseClasses} ${paddingClasses}`;
      case 'xl':
        return `max-w-[var(--container-xl)] ${baseClasses} ${paddingClasses}`;
      case '2xl':
        return `max-w-[var(--container-2xl)] ${baseClasses} ${paddingClasses}`;
      case 'full':
        return `w-full ${paddingClasses}`;
      default:
        return `max-w-[var(--container-xl)] ${baseClasses} ${paddingClasses}`;
    }
  };

  return (
    <div className={cn(getSizeClasses(), className)}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  variant?: 'tight' | 'normal' | 'loose' | 'extra-loose';
  density?: 'compact' | 'comfortable' | 'spacious';
  className?: string;
  minItemWidth?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  variant = 'normal',
  density = 'comfortable',
  className = '',
  minItemWidth
}) => {
  const getGridClasses = () => {
    let baseClass = '';
    
    // Apply density first
    if (density === 'compact') {
      baseClass = 'grid-compact';
    } else if (density === 'spacious') {
      baseClass = 'grid-spacious';
    } else {
      baseClass = 'grid-comfortable';
    }

    // Override with variant if specified
    if (variant === 'tight') {
      baseClass = 'grid-tight';
    } else if (variant === 'loose') {
      baseClass = 'grid-loose';
    } else if (variant === 'extra-loose') {
      baseClass = 'grid-extra-loose';
    } else if (variant === 'normal' && density === 'comfortable') {
      baseClass = 'grid-normal';
    }

    return baseClass;
  };

  const customGridStyle = minItemWidth ? {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`
  } : {};

  return (
    <div 
      className={cn(getGridClasses(), className)}
      style={customGridStyle}
    >
      {children}
    </div>
  );
};

interface GoldenSectionProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  majorContent: React.ReactNode;
  minorContent: React.ReactNode;
  className?: string;
}

export const GoldenSection: React.FC<GoldenSectionProps> = ({
  children: _children,
  orientation = 'horizontal',
  majorContent,
  minorContent,
  className = ''
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div className={cn(
      isHorizontal ? 'flex gap-[var(--space-lg)]' : 'flex flex-col gap-[var(--space-lg)]',
      className
    )}>
      {/* Major section (61.8% - Golden ratio) */}
      <div className={isHorizontal ? 'flex-[1.618]' : 'flex-[1.618]'}>
        {majorContent}
      </div>
      
      {/* Minor section (38.2% - Golden ratio complement) */}
      <div className={isHorizontal ? 'flex-1' : 'flex-1'}>
        {minorContent}
      </div>
    </div>
  );
};

interface FluidSpacingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  direction?: 'vertical' | 'horizontal' | 'both';
  className?: string;
}

export const FluidSpacing: React.FC<FluidSpacingProps> = ({
  children,
  size = 'md',
  direction = 'vertical',
  className = ''
}) => {
  const getSpacingClasses = () => {
    const spacingVar = `var(--space-${size})`;
    
    switch (direction) {
      case 'horizontal':
        return `space-x-[${spacingVar}]`;
      case 'both':
        return `gap-[${spacingVar}]`;
      default: // vertical
        return `space-y-[${spacingVar}]`;
    }
  };

  return (
    <div className={cn(
      direction === 'both' ? 'flex flex-col' : '',
      getSpacingClasses(),
      className
    )}>
      {children}
    </div>
  );
};