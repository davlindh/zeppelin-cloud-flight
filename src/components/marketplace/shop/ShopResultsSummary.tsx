
import React from 'react';

interface ShopResultsSummaryProps {
  productsCount: number;
  sortBy: string;
}

export const ShopResultsSummary: React.FC<ShopResultsSummaryProps> = ({
  productsCount,
  sortBy,
}) => {
  if (productsCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {productsCount} {productsCount === 1 ? 'product' : 'products'}
        </span>
        {sortBy === 'trending' && (
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            🔥 Trending
          </span>
        )}
        {sortBy === 'best-deals' && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            💎 Best deals
          </span>
        )}
        {sortBy === 'popularity' && (
          <span className="flex items-center gap-1 text-purple-600 font-medium">
            ⭐ Popular
          </span>
        )}
        {sortBy === 'stock-velocity' && (
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            ⚡ Fast moving
          </span>
        )}
      </div>
    </div>
  );
};
