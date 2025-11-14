import React from 'react';
import type { ServicePortfolioItem } from '@/types/unified';
import { PortfolioItemCard } from './PortfolioItemCard';

interface PortfolioMasonryGridProps {
  items: ServicePortfolioItem[];
  onItemClick: (item: ServicePortfolioItem) => void;
  sessionId?: string;
}

export const PortfolioMasonryGrid: React.FC<PortfolioMasonryGridProps> = ({ 
  items, 
  onItemClick,
  sessionId
}) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="break-inside-avoid"
        >
          <PortfolioItemCard 
            item={item} 
            onViewDetails={onItemClick}
            sessionId={sessionId}
          />
        </div>
      ))}
    </div>
  );
};
