
import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOptions: { value: string; label: string }[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchPlaceholder?: string;
  // Mobile filter props
  mobileFilters?: {
    filters: {
      priceRange: [number, number];
      brands: string[];
      inStockOnly: boolean;
      rating: number;
    };
    onFiltersChange: (filters: { priceRange: [number, number]; brands: string[]; inStockOnly: boolean; rating: number; }) => void;
    availableBrands: string[];
  };
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  sortOptions,
  sortBy,
  onSortChange,
  searchPlaceholder = "Search...",
  mobileFilters
}) => {
  const isMobile = useIsMobile();

  const clearSearch = () => {
    onSearchChange('');
  };

  const getActiveFilterCount = () => {
    if (!mobileFilters) return 0;
    const { filters } = mobileFilters;
    return (
      (filters.brands.length > 0 ? 1 : 0) +
      (filters.inStockOnly ? 1 : 0) +
      (filters.rating > 0 ? 1 : 0) +
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0)
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar with enhanced UX */}
      <div className="flex-1 relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 bg-white shadow-sm"
          aria-label="Search auctions"
          aria-describedby="search-help"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Category Filters with enhanced styling */}
        <div className="flex flex-wrap gap-2 flex-1" role="group" aria-label="Filter by category">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={cn(
                "capitalize touch-target transition-all duration-200",
                "hover:scale-105 focus:ring-2 focus:ring-primary/20",
                selectedCategory === category 
                  ? 'btn-primary shadow-lg' 
                  : 'btn-secondary hover:border-primary/50 hover:text-primary'
              )}
              aria-pressed={selectedCategory === category}
              aria-label={`Filter by ${category === 'all' ? 'all categories' : category} category`}
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          {isMobile && mobileFilters && (
            <MobileFilterSheet
              filters={[
                {
                  id: 'brands',
                  title: 'Brands',
                  type: 'checkbox',
                  options: mobileFilters.availableBrands.map(brand => ({
                    id: brand,
                    label: brand,
                    value: brand
                  }))
                },
                {
                  id: 'stock',
                  title: 'Availability',
                  type: 'checkbox',
                  options: [{
                    id: 'inStock',
                    label: 'In Stock Only',
                    value: 'inStock'
                  }]
                },
                {
                  id: 'rating',
                  title: 'Rating',
                  type: 'radio',
                  options: [4, 3, 2, 1].map(rating => ({
                    id: rating.toString(),
                    label: `${rating}+ Stars`,
                    value: rating.toString()
                  }))
                }
              ]}
              selectedFilters={{
                brands: mobileFilters.filters.brands,
                stock: mobileFilters.filters.inStockOnly ? ['inStock'] : [],
                rating: mobileFilters.filters.rating > 0 ? [mobileFilters.filters.rating.toString()] : []
              }}
              onFilterChange={(groupId, optionId, checked) => {
                const currentFilters = mobileFilters.filters;
                const newFilters = { ...currentFilters };

                if (groupId === 'brands') {
                  newFilters.brands = checked 
                    ? [...currentFilters.brands, optionId]
                    : currentFilters.brands.filter(b => b !== optionId);
                } else if (groupId === 'stock') {
                  newFilters.inStockOnly = checked;
                } else if (groupId === 'rating') {
                  newFilters.rating = checked ? parseInt(optionId) : 0;
                }

                mobileFilters.onFiltersChange(newFilters);
              }}
              onClearFilters={() => {
                mobileFilters.onFiltersChange({
                  priceRange: [0, 10000] as [number, number],
                  brands: [],
                  inStockOnly: false,
                  rating: 0
                });
              }}
              activeFilterCount={getActiveFilterCount()}
            />
          )}

          {/* Sort Dropdown with enhanced styling */}
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">Sort auctions by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 bg-white shadow-sm cursor-pointer appearance-none min-w-[200px]"
              aria-label="Sort auctions"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden help text for screen readers */}
      <div id="search-help" className="sr-only">
        Use the search bar to find auctions by title, category, or condition. Use the category buttons to filter by specific categories, and the dropdown to sort results.
      </div>
    </div>
  );
};
