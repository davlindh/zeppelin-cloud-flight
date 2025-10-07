import React from 'react';
import { cn } from '@/lib/utils';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridDensity = 'compact' | 'comfortable' | 'spacious';

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  cardSize?: CardSize;
  density?: GridDensity;
  className?: string;
  maxItems?: number;
}

const getGridClasses = (cardSize: CardSize, density: GridDensity) => {
  const densityGaps = {
    compact: 'gap-3',
    comfortable: 'gap-6', 
    spacious: 'gap-8'
  };

  const sizeGrids = {
    xs: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    sm: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    md: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    lg: 'grid-cols-1 md:grid-cols-2',
    xl: 'grid-cols-1 lg:grid-cols-2'
  };

  return `grid ${sizeGrids[cardSize]} ${densityGaps[density]} justify-items-center`;
};

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  cardSize = 'sm',
  density = 'comfortable',
  className,
  maxItems
}) => {
  const gridClasses = getGridClasses(cardSize, density);
  const childrenArray = React.Children.toArray(children);
  const displayedChildren = maxItems ? childrenArray.slice(0, maxItems) : childrenArray;
  
  return (
    <div className={cn(gridClasses, className)}>
      {displayedChildren}
    </div>
  );
};

// Context-aware sizing helper
export const getContextCardSize = (context: 'hero' | 'featured' | 'standard' | 'related' | 'compact'): CardSize => {
  switch (context) {
    case 'hero':
      return 'xl';
    case 'featured':
      return 'lg';
    case 'standard':
      return 'md';
    case 'related':
      return 'sm';
    case 'compact':
      return 'xs';
    default:
      return 'sm';
  }
};

// Responsive breakpoint-aware sizing
export const getResponsiveCardSize = (baseSize: CardSize, isMobile: boolean): CardSize => {
  if (isMobile) {
    // On mobile, reduce card sizes by one step
    switch (baseSize) {
      case 'xl':
        return 'lg';
      case 'lg':
        return 'md';
      case 'md':
        return 'sm';
      case 'sm':
        return 'xs';
      case 'xs':
        return 'xs';
      default:
        return 'sm';
    }
  }
  return baseSize;
};

export default ResponsiveCardGrid;