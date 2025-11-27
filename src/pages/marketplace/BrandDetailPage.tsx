import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { BackToTop } from '@/components/marketplace/ui/back-to-top';
import { QuickViewModal } from '@/components/marketplace/shop/QuickViewModal';
import { ProductComparison } from '@/components/marketplace/shop/ProductComparison';
import { ShopProductGrid } from '@/components/marketplace/shop/ShopProductGrid';
import { useProductComparison } from '@/hooks/marketplace/useProductComparison';
import { ShopProvider, useShop } from '@/contexts/marketplace/ShopContext';
import { ArrowLeft, Star, ShoppingBag, Package, DollarSign, Eye } from 'lucide-react';

// Inner component that uses the shop context
const BrandDetailPageInner = () => {
  const { brandName } = useParams<{ brandName: string }>();
  const navigate = useNavigate();
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const { data: products = [], isLoading } = useProducts();

  // Product comparison
  const {
    comparisonProducts,
    removeFromComparison,
    clearComparison
  } = useProductComparison();

  // Filter products by brand
  const brandProducts = useMemo(() => {
    if (!brandName) return [];
    return products.filter(product => product.brand === decodeURIComponent(brandName));
  }, [products, brandName]);

  // Calculate brand statistics
  const brandStats = useMemo(() => {
    if (brandProducts.length === 0) return null;

    const totalProducts = brandProducts.length;
    const totalReviews = brandProducts.reduce((sum, product) => sum + product.reviews, 0);
    const averageRating = totalReviews > 0
      ? brandProducts.reduce((sum, product) => sum + (product.rating * product.reviews), 0) / totalReviews
      : 0;
    const priceRange = brandProducts.reduce(
      (range, product) => ({
        min: Math.min(range.min, product.price),
        max: Math.max(range.max, product.price)
      }),
      { min: Infinity, max: 0 }
    );
    const inStockCount = brandProducts.filter(product => product.inStock).length;
    const categories = [...new Set(brandProducts.map(product => product.categoryName))];

    return {
      totalProducts,
      totalReviews,
      averageRating,
      priceRange,
      inStockCount,
      categories
    };
  }, [brandProducts]);

  if (!brandName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested brand could not be located.</p>
            <Button onClick={() => navigate('/marketplace/shop')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayBrandName = decodeURIComponent(brandName);

  return (
    <div className="min-h-screen brand-gradient-bg">
      <div className="section-container section-spacing content-spacing">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>
                Marketplace
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/marketplace/shop" onClick={(e) => { e.preventDefault(); navigate('/marketplace/shop'); }}>
                Shop
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{displayBrandName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Brand Header */}
        <div className="mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold gradient-text mb-2">
                    {displayBrandName}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Discover all {displayBrandName} products in our marketplace
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/marketplace/shop')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Shop
                </Button>
              </div>
            </CardHeader>

            {isLoading ? (
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              </CardContent>
            ) : brandStats && (
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <Package className="h-5 w-5" />
                      <span className="text-2xl font-bold">{brandStats.totalProducts}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                      <Star className="h-5 w-5" />
                      <span className="text-2xl font-bold">
                        {brandStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-2xl font-bold">
                        {brandStats.priceRange.min === brandStats.priceRange.max
                          ? `$${brandStats.priceRange.min}`
                          : `$${brandStats.priceRange.min} - $${brandStats.priceRange.max}`
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                      <ShoppingBag className="h-5 w-5" />
                      <span className="text-2xl font-bold">{brandStats.inStockCount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">In Stock</p>
                  </div>
                </div>

                {/* Brand Categories */}
                {brandStats.categories.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Available in categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {brandStats.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Product Comparison Panel */}
        {comparisonProducts.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
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
                      Clear All
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

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {displayBrandName} Products
              {brandProducts.length > 0 && (
                <Badge variant="secondary" className="ml-3">
                  {brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'}
                </Badge>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full rounded-lg mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : brandProducts.length > 0 ? (
            <ShopProductGrid
              products={brandProducts}
              isLoading={false}
              isError={false}
              handleQuickView={(id) => setQuickViewProductId(id)}
              handleAddToComparison={() => {}}
              isInComparison={() => false}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  This brand doesn't have any products available at the moment.
                </p>
                <Button onClick={() => navigate('/marketplace/shop')}>
                  Browse All Products
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Explore More Section */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/marketplace/shop')}
          >
            Explore More Products
          </Button>
        </div>
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

// Main BrandDetailPage component wrapped with provider
const BrandDetailPage = () => {
  return (
    <ShopProvider>
      <BrandDetailPageInner />
    </ShopProvider>
  );
};

export default BrandDetailPage;
