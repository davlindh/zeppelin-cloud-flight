
import React from 'react';
import { ActiveFilterChips } from '@/components/marketplace/shop/ActiveFilterChips';

interface ShopResultsSummaryProps {
  productsCount: number;
  sortBy: string;
  filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
    rating: number;
  };
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAllFilters: () => void;
}

export const ShopResultsSummary: React.FC<ShopResultsSummaryProps> = ({
  productsCount,
  sortBy,
  filters,
  onRemoveFilter,
  onClearAllFilters,
}) => {
  if (productsCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Results Count and Sort Info */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span className="font-medium text-slate-900">
            {productsCount} {productsCount === 1 ? 'product' : 'products'} found
          </span>
          {sortBy === 'trending' && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              🔥 Trending products
            </span>
          )}
          {sortBy === 'best-deals' && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              💎 Best deals
            </span>
          )}
          {sortBy === 'popularity' && (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              ⭐ Most popular
            </span>
          )}
          {sortBy === 'stock-velocity' && (
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              ⚡ Fast moving
            </span>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAllFilters}
      />
    </div>
  );
};
