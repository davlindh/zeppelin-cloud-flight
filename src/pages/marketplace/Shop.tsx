import React, { useState } from 'react';
import { OptimizedUnifiedSearchBar } from '@/components/marketplace/shop/OptimizedUnifiedSearchBar';
import { SearchErrorBoundary } from '@/components/marketplace/shop/SearchErrorBoundary';
import { MobileFilterBar } from '@/components/marketplace/shop/MobileFilterBar';
import { ShopContent as ShopContentComponent } from '@/components/marketplace/shop/ShopContent';
import { FeaturedProducts } from '@/components/marketplace/shop/FeaturedProducts';
import { RecentlyViewedProducts } from '@/components/marketplace/shop/RecentlyViewedProducts';
import { QuickViewModal } from '@/components/marketplace/shop/QuickViewModal';
import { ProductComparison } from '@/components/marketplace/shop/ProductComparison';
import { BackToTop } from '@/components/marketplace/ui/back-to-top';
import { PullToRefreshIndicator } from '@/components/ui/pull-to-refresh';
import { AdvancedFilters } from '@/components/marketplace/shop/AdvancedFilters';
import { useShop, ShopProvider } from '@/contexts/marketplace/ShopContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { useProductComparison } from '@/hooks/marketplace/useProductComparison';
import { Eye, BarChart3, Truck, Shield, Zap, X } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';

// Inner component that uses the shop context
const ShopPage = () => {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const isMobile = useIsMobile();
  const { state, dispatch } = useShop();

  // Product comparison
  const {
    comparisonProducts,
    removeFromComparison,
    clearComparison
  } = useProductComparison();

  // Get products to determine available brands
  const { data: products = [], refetch: refetchProducts } = useProducts();
  
  // Pull to refresh
  const { isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: async () => {
      await refetchProducts();
    },
    enabled: isMobile
  });
  
  // Get available brands for filtering
  const availableBrands = React.useMemo(() => {
    const brands = products
      .map(product => product.brand)
      .filter((brand, index, self) => brand && self.indexOf(brand) === index)
      .sort();
    return brands;
  }, [products]);

  const handleFiltersChange = (newFilters: Partial<{ priceRange: [number, number]; brands: string[]; inStockOnly: boolean; rating: number; }>) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  return (
    <div className="min-h-screen bg-background">
      <PullToRefreshIndicator 
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        progress={progress}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Compact Search Header */}
        <div className="relative rounded-xl p-4 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                Discover Premium Products
              </h1>
              <p className="text-muted-foreground text-sm">
                Search products or browse by category
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-3">
              <div className="shadow-sm border border-border/50 bg-background rounded-lg p-2">
                <SearchErrorBoundary>
                  <OptimizedUnifiedSearchBar />
                </SearchErrorBoundary>
              </div>
            </div>

            {/* Shopping Benefits */}
            <div className="flex justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-primary" />
                <span>Free Shipping $50+</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                <span>24h Delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                <span>Price Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products - Compact */}
        <div className="mb-6">
          <FeaturedProducts />
        </div>

        {/* Recently Viewed - Mobile only */}
        <div className="lg:hidden mb-6">
          <RecentlyViewedProducts variant="horizontal" maxItems={4} />
        </div>

        {/* Product Comparison Panel */}
        {comparisonProducts.length > 0 && (
          <div className="mb-6">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Compare Products</span>
                  <Badge variant="secondary" className="text-xs">
                    {comparisonProducts.length} items
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowComparison(!showComparison)}
                    variant={showComparison ? "default" : "outline"}
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showComparison ? 'Hide' : 'View'}
                  </Button>
                  <Button
                    onClick={clearComparison}
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Comparison View */}
        {showComparison && comparisonProducts.length > 0 && (
          <div className="mb-6">
            <ProductComparison
              products={comparisonProducts}
              onRemoveProduct={removeFromComparison}
              onClearAll={clearComparison}
            />
          </div>
        )}

        {/* Main Shop Content */}
        {!showComparison && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="text-sm font-semibold mb-4 text-foreground">Filters</h3>
                  <AdvancedFilters
                    filters={state.filters}
                    onFiltersChange={handleFiltersChange}
                    availableBrands={availableBrands}
                  />
                </div>
              </div>
            </aside>

            {/* Main Product Grid */}
            <div className="lg:col-span-3">
              {/* Mobile Filter Bar */}
              <div className="lg:hidden mb-4">
                <MobileFilterBar availableBrands={availableBrands} />
              </div>

              {/* Shop Content */}
              <ShopContentComponent availableBrands={availableBrands} />
            </div>
          </div>
        )}
      </div>

      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      <BackToTop />
    </div>
  );
};

// Main Shop component wrapped with provider
const Shop = () => {
  return (
    <ShopProvider>
      <ShopPage />
    </ShopProvider>
  );
};

export default Shop;
