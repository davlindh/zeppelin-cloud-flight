
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActiveFilterChipsProps {
  filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
    rating: number;
  };
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll
}) => {
  const activeFilters = [];

  // Price range filter
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
    activeFilters.push({
      type: 'priceRange',
      label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
      value: 'priceRange'
    });
  }

  // Brand filters
  filters.brands.forEach(brand => {
    activeFilters.push({
      type: 'brands',
      label: brand,
      value: brand
    });
  });

  // Stock filter
  if (filters.inStockOnly) {
    activeFilters.push({
      type: 'inStockOnly',
      label: 'In Stock Only',
      value: 'inStockOnly'
    });
  }

  // Rating filter
  if (filters.rating > 0) {
    activeFilters.push({
      type: 'rating',
      label: `${filters.rating}+ Stars`,
      value: 'rating'
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-blue-900 mr-2">Active Filters:</span>
      
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value}-${index}`}
          variant="outline"
          className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 ml-2"
      >
        Clear All
      </Button>
    </div>
  );
};
