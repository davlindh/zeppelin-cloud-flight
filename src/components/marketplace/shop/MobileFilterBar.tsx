import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileFilterSheet } from '@/components/marketplace/ui/mobile-filter-sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { useShop } from '@/contexts/marketplace/ShopContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDynamicCategoryNames } from '@/hooks/marketplace/useDynamicCategories';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range';
}

interface MobileFilterBarProps {
  availableBrands: string[];
}

export const MobileFilterBar: React.FC<MobileFilterBarProps> = ({ availableBrands }) => {
  const { state, dispatch, hasActiveFilters } = useShop();
  const isMobile = useIsMobile();
  const { data: categories = [] } = useDynamicCategoryNames();

  if (!isMobile) {
    return null;
  }

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    if (groupId === 'category') {
      dispatch({ type: 'SET_CATEGORY', payload: optionId });
    } else if (groupId === 'sort') {
      dispatch({ type: 'SET_SORT_BY', payload: optionId });
    } else if (groupId === 'brands') {
      if (checked) {
        dispatch({ type: 'SET_FILTERS', payload: { ...state.filters, brands: [...state.filters.brands, optionId] } });
      } else {
        dispatch({ type: 'REMOVE_FILTER', payload: { type: 'brands', value: optionId } });
      }
    }
  };

  const handleClearFilters = () => {
    dispatch({ type: 'CLEAR_ALL_FILTERS' });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (state.selectedCategory !== 'all') count++;
    if (state.searchTerm) count++;
    count += state.filters.brands.length;
    if (state.filters.inStockOnly) count++;
    if (state.filters.rating > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Create filter groups for the mobile sheet
  const filterGroups: FilterGroup[] = [
    {
      id: 'category',
      title: 'Category',
      type: 'radio',
      options: categories.map(cat => ({
        id: cat,
        label: cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1),
        value: cat
      }))
    },
    {
      id: 'brands',
      title: 'Brands',
      type: 'checkbox',
      options: availableBrands.map(brand => ({
        id: brand,
        label: brand,
        value: brand
      }))
    },
    {
      id: 'sort',
      title: 'Sort By',
      type: 'radio',
      options: [
        { id: 'newest', label: 'Newest First', value: 'newest' },
        { id: 'trending', label: '🔥 Trending Now', value: 'trending' },
        { id: 'best-deals', label: '💎 Best Deals', value: 'best-deals' },
        { id: 'popularity', label: '⭐ Most Popular', value: 'popularity' },
        { id: 'price-low', label: 'Price: Low to High', value: 'price-low' },
        { id: 'price-high', label: 'Price: High to Low', value: 'price-high' },
        { id: 'rating', label: 'Highest Rated', value: 'rating' }
      ]
    }
  ];

  const selectedFilters = {
    category: state.selectedCategory !== 'all' ? [state.selectedCategory] : [],
    brands: state.filters.brands,
    sort: [state.sortBy]
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Filter Button with Mobile Sheet */}
        <MobileFilterSheet
          filters={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Sort Button */}
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </Button>

        {/* Active Filters Count */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-destructive hover:text-destructive p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {state.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              "{state.searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => dispatch({ type: 'SET_SEARCH_TERM', payload: '' })}
              />
            </Badge>
          )}
          
          {state.selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {state.selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => dispatch({ type: 'SET_CATEGORY', payload: 'all' })}
              />
            </Badge>
          )}
          
          {state.filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {brand}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => dispatch({ type: 'REMOVE_FILTER', payload: { type: 'brands', value: brand } })}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
