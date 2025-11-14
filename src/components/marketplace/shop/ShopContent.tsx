import React from 'react';
import { useShop } from '@/contexts/marketplace/ShopContext';
import { useInfiniteProducts } from '@/hooks/marketplace/useProducts';
import { useProductComparison } from '@/hooks/marketplace/useProductComparison';
import { sortProductsByAnalytics } from '@/utils/marketplace/productUtils';
import { ShopProductGrid } from './ShopProductGrid';
import { CategoryBrowser } from './CategoryBrowser';
import { AdvancedFilters } from './AdvancedFilters';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ShopResultsSummary } from './ShopResultsSummary';
import { SearchResultContext } from './SearchResultContext';

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
    const categoryMappings = {
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

  // Debug logging for data pipeline
  React.useEffect(() => {
    console.log('ShopContent Debug:', {
      selectedCategory: state.selectedCategory,
      searchTerm: state.searchTerm,
      filters: state.filters,
      rawProductsCount: products.length,
      productsLoading,
      productsError,
      products: products.slice(0, 3) // Log first 3 products for inspection
    });
  }, [state.selectedCategory, state.searchTerm, state.filters, products, productsLoading, productsError]);

  // Apply additional filters and sorting
  const filteredAndSortedProducts = React.useMemo(() => {
    console.log('Starting filteredAndSortedProducts with:', {
      initialProductsCount: products.length,
      filters: state.filters,
      sortBy: state.sortBy
    });

    let filtered = [...products];

    // Apply brand filter
    if (state.filters.brands.length > 0) {
      const beforeBrandFilter = filtered.length;
      filtered = filtered.filter(product => {
        const hasValidBrand = product.brand && state.filters.brands.includes(product.brand);
        if (!hasValidBrand && beforeBrandFilter <= 5) {
          console.log('Product filtered out by brand:', {
            productTitle: product.title,
            productBrand: product.brand,
            requiredBrands: state.filters.brands
          });
        }
        return hasValidBrand;
      });
      console.log(`Brand filter: ${beforeBrandFilter} -> ${filtered.length} products`);
    }

    // Apply rating filter
    if (state.filters.rating > 0) {
      const beforeRatingFilter = filtered.length;
      filtered = filtered.filter(product => 
        product.rating >= state.filters.rating
      );
      console.log(`Rating filter: ${beforeRatingFilter} -> ${filtered.length} products`);
    }

    console.log('Final filtered products:', {
      count: filtered.length,
      products: filtered.slice(0, 3).map(p => ({ id: p.id, title: p.title, brand: p.brand, price: p.price }))
    });

    // Apply sorting
    return ['trending', 'best-deals', 'popularity', 'stock-velocity'].includes(state.sortBy) ? sortProductsByAnalytics(filtered, state.sortBy) : filtered.sort((a, b) => {
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
    // This will be handled by parent component
    console.log('Quick view:', productId);
  };

  const handleBrandFilter = (brand: string) => {
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: { brands: [brand] }
    });
  };

  const handleFiltersChange = (newFilters: Partial<{ priceRange: [number, number]; brands: string[]; inStockOnly: boolean; rating: number; }>) => {
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: newFilters 
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
    console.log('ShopContent: handleCategorySelect with:', category);
    dispatch({ 
      type: 'SET_CATEGORY', 
      payload: category 
    });
  };

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

  // Search/Filtered mode: show products with simplified filters
  return (
    <div className="animate-fade-in">
      <div className="flex gap-6">
        {/* Compact Filters Sidebar - Only show if we have products */}
        {filteredAndSortedProducts.length > 0 && (
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="w-64">
              <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-foreground">Filters</h3>
                <AdvancedFilters
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  availableBrands={availableBrands}
                />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Search Result Context */}
          {state.searchTerm && (
            <SearchResultContext
              searchTerm={state.searchTerm}
              productsCount={filteredAndSortedProducts.length}
              suggestedCategory={getCategorySuggestion(state.searchTerm)}
              onCategorySelect={handleCategorySelect}
            />
          )}
          
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mb-3">
              <ActiveFilterChips
                filters={state.filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            </div>
          )}
          
          {/* Results Summary */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="mb-3">
              <ShopResultsSummary
                productsCount={filteredAndSortedProducts.length}
                sortBy={state.sortBy}
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
      </div>
    </div>
  );
};
