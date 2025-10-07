import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedProductCard } from '@/components/ui/enhanced-product-card';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { ResponsiveGrid, AdvancedContainer, FluidSpacing } from '@/components/ui/advanced-layout';
import { DensityProvider, DensityControl } from '@/contexts/DensityContext';
import { Button } from '@/components/ui/button';
import { AsyncErrorBoundary } from '@/components/ui/async-error-boundary';
import { useProducts } from '@/hooks/useProducts';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { sortProductsByAnalytics } from '@/utils/productUtils';

const ShopSection = () => {
  const { handleError } = useErrorHandler();
  const { data: products = [], isLoading, isError, error } = useProducts({
    inStockOnly: true
  });

  // Get trending and popular products for featured display
  const featuredProducts = React.useMemo(() => {
    if (products.length === 0) return [];
    
    console.log('Computing featured products from:', products.length, 'products');
    
    try {
      // Get trending products first, then fill with popular ones
      const trendingProducts = sortProductsByAnalytics(products, 'trending').slice(0, 2);
      const popularProducts = sortProductsByAnalytics(products, 'popularity')
        .filter(p => !trendingProducts.some(tp => tp.id === p.id))
        .slice(0, 1);
      
      const featured = [...trendingProducts, ...popularProducts].slice(0, 3);
      console.log('Featured products:', featured.map(p => ({ id: p.id, title: p.title })));
      
      return featured;
    } catch (error) {
      handleError(error as Error);
      return [];
    }
  }, [products, handleError]);

  const handleBrandFilter = (brand: string) => {
    try {
      // Navigate to shop page with brand filter
      window.location.href = `/shop?brand=${encodeURIComponent(brand)}`;
    } catch (error) {
      handleError(error as Error);
    }
  };

  // Handle query error
  React.useEffect(() => {
    if (isError && error) {
      handleError(error as Error);
    }
  }, [isError, error, handleError]);

  console.log('ShopSection render - products:', products.length, 'featured:', featuredProducts.length, 'loading:', isLoading, 'error:', isError);

  return (
    <DensityProvider defaultDensity="comfortable">
      <AsyncErrorBoundary fallbackVariant="minimal">
        <section id="shop" className="py-16">
          <AdvancedContainer size="xl" applyGoldenRatio>
            <FluidSpacing size="xl" direction="vertical">
              {/* Enhanced Header with Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Premium Shop
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl lg:mx-0 mx-auto">
                    Curated collection of luxury items and premium products from trusted brands worldwide.
                  </p>
                </div>
                
                {/* Content Density Control */}
                <div className="flex justify-center lg:justify-end">
                  <DensityControl />
                </div>
              </div>

              {isLoading ? (
                <ResponsiveGrid density="comfortable" variant="normal">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </ResponsiveGrid>
              ) : isError ? (
                <div className="text-center py-8 mb-8">
                  <p className="text-red-600 mb-4">Failed to load featured products</p>
                  <p className="text-metadata">Please try again later.</p>
                </div>
              ) : (
                <>
                  {/* Featured Products Header */}
                  {featuredProducts.length > 0 && (
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                        <span className="text-blue-600 font-medium">🔥 Featured & Trending</span>
                      </div>
                    </div>
                  )}

                  <AsyncErrorBoundary fallbackVariant="minimal">
                    <ResponsiveGrid 
                      density="comfortable" 
                      variant="normal"
                      className="mb-8"
                    >
                      {featuredProducts.map((product) => (
                        <div key={product.id} className="w-full">
                          <EnhancedProductCard
                            product={product}
                            showAnalytics={true}
                            onBrandClick={handleBrandFilter}
                          />
                        </div>
                      ))}
                    </ResponsiveGrid>
                  </AsyncErrorBoundary>

                  {/* Show message if no products */}
                  {products.length === 0 && (
                    <div className="text-center py-8 mb-8">
                      <p className="text-slate-600 mb-4">No products available at the moment</p>
                      <p className="text-metadata">Please check back later.</p>
                    </div>
                  )}
                </>
              )}

              <div className="text-center">
                <Link to="/shop">
                  <Button variant="outline" size="lg" className="interactive-lift">
                    Browse All Products
                  </Button>
                </Link>
              </div>
            </FluidSpacing>
          </AdvancedContainer>
        </section>
      </AsyncErrorBoundary>
    </DensityProvider>
  );
};

export default ShopSection;
