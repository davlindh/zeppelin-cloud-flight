import React from 'react';
import { useShop } from '@/contexts/marketplace/ShopContext';
import { useInfiniteProducts } from '@/hooks/marketplace/useProducts';
import { useProductComparison } from '@/hooks/marketplace/useProductComparison';
import { sortProductsByAnalytics } from '@/utils/marketplace/productUtils';
import { ShopProductGrid } from './ShopProductGrid';
import { CategoryBrowser } from './CategoryBrowser';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ShopResultsSummary } from './ShopResultsSummary';
import { SearchResultContext } from './SearchResultContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ShopContentProps {
  availableBrands: string[];
}

export const ShopContent: React.FC<ShopContentProps> = ({ availableBrands }) => {
  const { state, dispatch, hasActiveFilters } = useShop();
  const {
    addToComparison,
    isInComparison
  } = useProductComparison();

  // Intelligent category suggestion based on search
  const getCategorySuggestion = (searchTerm: string): string | undefined => {
    const term = searchTerm.toLowerCase();
    const categoryMappings: Record<string, string> = {
      'phone': 'Electronics',
      'laptop': 'Electronics', 
      'computer': 'Electronics',
      'headphone': 'Electronics',
      'electronics': 'Electronics',
      'shirt': 'Fashion',
      'dress': 'Fashion',
      'clothing': 'Fashion',
      'fashion': 'Fashion',
      'furniture': 'Home',
      'kitchen': 'Home',
      'home': 'Home',
      'decor': 'Home'
    };
    
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (term.includes(keyword)) {
        return category;
      }
    }
    return undefined;
  };

  // Fetch products based on current state with infinite scroll
  const { 
    data: infiniteData,
    isLoading: productsLoading, 
    isError: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProducts({
    category: state.selectedCategory !== 'all' ? state.selectedCategory : undefined,
    search: state.searchTerm || undefined,
    minPrice: state.filters.priceRange[0] > 0 ? state.filters.priceRange[0] : undefined,
    maxPrice: state.filters.priceRange[1] < 10000 ? state.filters.priceRange[1] : undefined,
    inStockOnly: state.filters.inStockOnly
  });

  // Flatten all pages into single array
  const products = React.useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.products) || [];
  }, [infiniteData]);

  // Apply additional filters and sorting
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply brand filter
    if (state.filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && state.filters.brands.includes(product.brand)
      );
    }

    // Apply rating filter
    if (state.filters.rating > 0) {
      filtered = filtered.filter(product => 
        product.rating >= state.filters.rating
      );
    }

    // Apply sorting
    if (['trending', 'best-deals', 'popularity', 'stock-velocity'].includes(state.sortBy)) {
      return sortProductsByAnalytics(filtered, state.sortBy);
    }

    return filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime();
      }
    });
  }, [products, state.filters, state.sortBy]);

  const handleQuickView = (productId: string) => {
    console.log('Quick view:', productId);
  };

  const handleBrandFilter = (brand: string) => {
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: { brands: [brand] }
    });
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    dispatch({ 
      type: 'REMOVE_FILTER', 
      payload: { type: filterType, value } 
    });
  };

  const handleClearAllFilters = () => {
    dispatch({ type: 'CLEAR_ALL_FILTERS' });
  };

  const handleCategorySelect = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const handleSortChange = (sortBy: string) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'trending', label: 'Trending Now' },
    { value: 'best-deals', label: 'Best Deals' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Browse mode: show compact categories (only when not showing all products)
  if (state.view === 'browse' && state.selectedCategory !== 'all') {
    return (
      <div className="mb-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-sm">
            Discover our curated product collections
          </p>
        </div>
        <CategoryBrowser />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Search Result Context */}
      {state.searchTerm && (
        <SearchResultContext
          searchTerm={state.searchTerm}
          productsCount={filteredAndSortedProducts.length}
          suggestedCategory={getCategorySuggestion(state.searchTerm)}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Header with Sort and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {state.selectedCategory !== 'all' ? state.selectedCategory : 'All Products'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedProducts.length} products found
          </p>
        </div>
        
        <Select value={state.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mb-4">
          <ActiveFilterChips
            filters={state.filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        </div>
      )}
      
      <ShopProductGrid
        products={filteredAndSortedProducts}
        isLoading={productsLoading}
        isError={productsError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        scrollMode="loadmore"
        enableVirtualization={true}
        handleQuickView={handleQuickView}
        handleAddToComparison={addToComparison}
        isInComparison={isInComparison}
        onBrandClick={handleBrandFilter}
      />
    </div>
  );
};
