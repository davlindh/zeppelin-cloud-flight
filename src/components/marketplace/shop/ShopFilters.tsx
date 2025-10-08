import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useShop } from '@/contexts/marketplace/ShopContext';
import { useDynamicCategoryNames } from '@/hooks/marketplace/useDynamicCategories';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShopFiltersProps {
  availableBrands?: string[];
  onRemoveFilter?: (filterType: string, value?: string) => void;
  onClearAllFilters?: () => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  onRemoveFilter,
  onClearAllFilters
}) => {
  const { state, dispatch, hasActiveFilters } = useShop();
  const { data: categories = [] } = useDynamicCategoryNames();
  const isMobile = useIsMobile();

  // Hide on mobile - MobileFilterBar handles mobile filtering
  if (isMobile) {
    return null;
  }

  const handleCategoryClick = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const handleSortChange = (sortBy: string) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    dispatch({ type: 'REMOVE_FILTER', payload: { type: filterType, value } });
    onRemoveFilter?.(filterType, value);
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL_FILTERS' });
    onClearAllFilters?.();
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'trending', label: '🔥 Trending Now' },
    { value: 'best-deals', label: '💎 Best Deals' },
    { value: 'popularity', label: '⭐ Most Popular' },
    { value: 'stock-velocity', label: '⚡ Fast Moving' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="mb-8 p-6 rounded-xl bg-card border border-border shadow-sm animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="w-full lg:w-auto">
          <h4 className="text-sm font-semibold text-foreground mb-3">Filter by Category</h4>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((category) => (
              <Button
                key={category}
                variant={state.selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className={`
                  capitalize transition-all duration-200 
                  ${state.selectedCategory === category 
                    ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg' 
                    : 'hover:bg-primary/5 hover:border-primary/30 hover:text-primary'
                  }
                `}
              >
                {category === 'all' ? 'All Categories' : category}
                {state.selectedCategory === category && category !== 'all' && (
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFilter('category');
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full lg:w-auto">
          <h4 className="text-sm font-semibold text-foreground mb-3">Sort Products</h4>
          <select
            value={state.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full lg:w-auto px-4 py-2.5 border border-border rounded-lg 
              focus:ring-2 focus:ring-primary focus:border-primary 
              bg-background text-foreground shadow-sm cursor-pointer 
              min-w-[200px] transition-all duration-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            
            {state.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{state.searchTerm}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFilter('search')}
                />
              </Badge>
            )}
            
            {state.filters.brands.map((brand) => (
              <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                Brand: {brand}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFilter('brands', brand)}
                />
              </Badge>
            ))}
            
            {state.filters.inStockOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                In Stock Only
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFilter('inStockOnly')}
                />
              </Badge>
            )}
            
            {state.filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {state.filters.rating}+ stars
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFilter('rating')}
                />
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/5 ml-2"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
