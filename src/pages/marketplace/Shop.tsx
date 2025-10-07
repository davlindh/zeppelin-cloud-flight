import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { OptimizedUnifiedSearchBar } from '@/components/shop/OptimizedUnifiedSearchBar';
import { SearchErrorBoundary } from '@/components/shop/SearchErrorBoundary';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { MobileFilterBar } from '@/components/shop/MobileFilterBar';
import { ShopContent as ShopContentComponent } from '@/components/shop/ShopContent';
import { BrandShowcase } from '@/components/shop/BrandShowcase';
import { FeaturedProducts } from '@/components/shop/FeaturedProducts';
import { RecentlyViewedProducts } from '@/components/shop/RecentlyViewedProducts';
import { QuickViewModal } from '@/components/shop/QuickViewModal';
import { ProductComparison } from '@/components/shop/ProductComparison';
import { BackToTop } from '@/components/ui/back-to-top';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useProductComparison } from '@/hooks/useProductComparison';
import { ShopProvider } from '@/contexts/ShopContext';
import { Eye, BarChart3, Truck, Shield, Zap, X } from 'lucide-react';

// Inner component that uses the shop context
const ShopPage = () => {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Product comparison
  const {
    comparisonProducts,
    removeFromComparison,
    clearComparison
  } = useProductComparison();

  // Get products to determine available brands
  const { data: products = [] } = useProducts();
  
  // Get available brands for filtering
  const availableBrands = React.useMemo(() => {
    const brands = products
      .map(product => product.brand)
      .filter((brand, index, self) => brand && self.indexOf(brand) === index)
      .sort();
    
    console.log('Shop.tsx availableBrands calculation:', {
      totalProducts: products.length,
      productsWithBrands: products.filter(p => p.brand).length,
      brands: brands,
      sampleProducts: products.slice(0, 3).map(p => ({ title: p.title, brand: p.brand }))
    });
    
    return brands;
  }, [products]);


  return (
    <div className="min-h-screen brand-gradient-bg">
      <Header />
      
      <div className="section-container section-spacing content-spacing"
        style={{ backgroundImage: 'radial-gradient(circle at top right, hsl(var(--brand-primary)/0.03) 0%, transparent 50%)' }}
      >
        {/* Unified Search & Browse Interface */}
        <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 mb-8 brand-gradient-bg border border-border/20">
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">
                Discover Premium Products
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Search thousands of products or browse by category
              </p>
            </div>

            {/* Primary Search Interface */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="shadow-2xl border-2 border-primary/30 bg-white/98 backdrop-blur-sm rounded-xl p-3">
                <SearchErrorBoundary>
                  <OptimizedUnifiedSearchBar />
                </SearchErrorBoundary>
              </div>
            </div>

            {/* Shopping Benefits */}
            <div className="flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-green-700">
                <Truck className="h-4 w-4" />
                <span className="font-medium">Free Shipping $50+</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700">
                <Zap className="h-4 w-4" />
                <span className="font-medium">24h Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-700">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Price Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Showcase */}
        <div className="mb-8">
          <BrandShowcase />
        </div>

        {/* Recently Viewed & Featured Products */}
        <div className="mb-8">
          <RecentlyViewedProducts />
        </div>

        <div className="mb-8">
          <FeaturedProducts />
        </div>

        {/* Product Comparison Panel */}
        {comparisonProducts.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Product Comparison</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {comparisonProducts.length} items
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setShowComparison(!showComparison)}
                      variant={showComparison ? "default" : "outline"}
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showComparison ? 'Hide' : 'View'}
                    </Button>
                    <Button
                      onClick={clearComparison}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Comparison View */}
        {showComparison && comparisonProducts.length > 0 && (
          <div className="mb-8">
            <ProductComparison
              products={comparisonProducts}
              onRemoveProduct={removeFromComparison}
              onClearAll={clearComparison}
            />
          </div>
        )}

        {/* Mobile Filter Bar */}
        <MobileFilterBar availableBrands={availableBrands} />

        {/* Main Shop Content - Only show when not in comparison mode */}
        {!showComparison && (
          <>
            {/* Desktop Shop Filters - Always visible for category navigation and sorting */}
            <ShopFilters 
              availableBrands={availableBrands}
            />

            {/* Shop Content */}
            <ShopContentComponent availableBrands={availableBrands} />
          </>
        )}
      </div>

      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />


      {/* Back to Top */}
      <BackToTop />

      <Footer />
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
