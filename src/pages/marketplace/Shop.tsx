import React, { useState } from 'react';
import { OptimizedUnifiedSearchBar } from '@/components/marketplace/shop/OptimizedUnifiedSearchBar';
import { SearchErrorBoundary } from '@/components/marketplace/shop/SearchErrorBoundary';
import { ShopFilters } from '@/components/marketplace/shop/ShopFilters';
import { MobileFilterBar } from '@/components/marketplace/shop/MobileFilterBar';
import { ShopContent as ShopContentComponent } from '@/components/marketplace/shop/ShopContent';
import { BrandShowcase } from '@/components/marketplace/shop/BrandShowcase';
import { FeaturedProducts } from '@/components/marketplace/shop/FeaturedProducts';
import { RecentlyViewedProducts } from '@/components/marketplace/shop/RecentlyViewedProducts';
import { StickyRecentlyViewed } from '@/components/marketplace/shop/StickyRecentlyViewed';
import { QuickViewModal } from '@/components/marketplace/shop/QuickViewModal';
import { ProductComparison } from '@/components/marketplace/shop/ProductComparison';
import { BackToTop } from '@/components/marketplace/ui/back-to-top';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { useProductComparison } from '@/hooks/marketplace/useProductComparison';
import { ShopProvider, useShop } from '@/contexts/marketplace/ShopContext';
import { Eye, BarChart3, Truck, Shield, Zap, X, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Inner component that uses the shop context
const ShopPage = () => {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Product comparison
  const {
    comparisonProducts,
    removeFromComparison,
    clearComparison
  } = useProductComparison();

  // Fetch events for filter
  const { data: events = [] } = useQuery({
    queryKey: ['events-for-shop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('status', 'published')
        .order('starts_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

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
      <div className="section-container section-spacing content-spacing"
        style={{ backgroundImage: 'radial-gradient(circle at top right, hsl(var(--brand-primary)/0.03) 0%, transparent 50%)' }}
      >
        {/* Unified Search & Browse Interface */}
        <div className="relative overflow-hidden rounded-xl p-3 sm:p-4 mb-6 brand-gradient-bg border border-border/20">
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-1">
                Discover Premium Products
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Search products or browse by category
              </p>
            </div>

            {/* Primary Search Interface */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="shadow-xl border border-primary/20 bg-white/98 backdrop-blur-sm rounded-lg p-2">
                <SearchErrorBoundary>
                  <OptimizedUnifiedSearchBar />
                </SearchErrorBoundary>
              </div>
            </div>

            {/* Shopping Benefits */}
            <div className="flex justify-center gap-3 sm:gap-6 text-xs">
              <div className="flex items-center gap-1 text-green-700">
                <Truck className="h-3 w-3" />
                <span className="font-medium">Free Shipping $50+</span>
              </div>
              <div className="flex items-center gap-1 text-blue-700">
                <Zap className="h-3 w-3" />
                <span className="font-medium">24h Delivery</span>
              </div>
              <div className="flex items-center gap-1 text-purple-700">
                <Shield className="h-3 w-3" />
                <span className="font-medium">Price Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Discovery Section */}
        <div className="mb-4 space-y-3">
          {/* Brand Showcase - Compact horizontal scroll */}
          {availableBrands.length >= 3 && (
            <div className="overflow-x-auto scrollbar-thin">
              <BrandShowcase />
            </div>
          )}

          {/* Featured Products - Full width, more prominent */}
          <FeaturedProducts />

          {/* Recently Viewed - Mobile/Tablet only (horizontal) */}
          <div className="lg:hidden">
            <RecentlyViewedProducts variant="horizontal" maxItems={6} />
          </div>
        </div>

        {/* Main Shopping Area - Visual Separator */}
        <div className="border-t-2 border-primary/10 pt-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedEventId ? 'Event Products' : 'Shop All Products'}
            </h2>
            <div className="flex items-center gap-3">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-[240px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEventId && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedEventId('')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
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


        {/* Main Shop Content - Only show when not in comparison mode */}
        {!showComparison && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Desktop Filters Sidebar - Left (Hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-20">
                <ShopFilters 
                  availableBrands={availableBrands}
                />
              </div>
            </div>

            {/* Main Product Grid - Center */}
            <div className="lg:col-span-7">
              {/* Mobile Filter Bar */}
              <div className="lg:hidden mb-4">
                <MobileFilterBar availableBrands={availableBrands} />
              </div>

              {/* Shop Content */}
              <ShopContentComponent 
                availableBrands={availableBrands}
                eventFilter={selectedEventId || undefined}
              />
            </div>

            {/* Recently Viewed Sidebar - Right (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-3">
              <StickyRecentlyViewed maxVisible={6} />
            </div>
          </div>
        )}
      </div>

      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />


      {/* Back to Top */}
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
