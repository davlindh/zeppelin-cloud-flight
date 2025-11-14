
import React, { useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { ProductSkeleton } from '@/components/marketplace/ui/product-skeleton';
import { ResponsiveGrid } from '@/components/marketplace/ui/advanced-layout';

import type { Product } from '@/types/unified';

interface ShopProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  handleQuickView: (productId: string) => void;
  handleAddToComparison: (product: Product) => void;
  isInComparison: (productId: string) => boolean;
  onBrandClick?: (brand: string) => void;
  density?: 'compact' | 'comfortable' | 'spacious';
  scrollMode?: 'infinite' | 'loadmore';
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  products,
  isLoading,
  isError,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  handleQuickView,
  handleAddToComparison,
  isInComparison,
  onBrandClick,
  density = 'comfortable',
  scrollMode = 'loadmore'
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Setup intersection observer for infinite scroll
  React.useEffect(() => {
    if (scrollMode !== 'infinite') return;
    
    const element = observerTarget.current;
    const option = { threshold: 0.5 };
    const observer = new IntersectionObserver(handleObserver, option);
    
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, scrollMode]);

  if (isLoading && products.length === 0) {
    return (
      <ResponsiveGrid density={density} variant="tight">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </ResponsiveGrid>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">Failed to load products</p>
        <p className="text-slate-600">Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search terms to find what you're looking for
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveGrid density="compact" variant="tight">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="enhanced"
            showQuickActions={true}
            showAnalytics={true}
            onQuickView={() => handleQuickView(product.id)}
            onToggleComparison={handleAddToComparison}
            isInComparison={isInComparison(product.id)}
            onBrandClick={onBrandClick}
          />
        ))}
      </ResponsiveGrid>

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Load More Button Mode */}
      {scrollMode === 'loadmore' && hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchNextPage?.()}
            size="lg"
            variant="outline"
            className="min-w-[200px]"
          >
            Load More Products
          </Button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {scrollMode === 'infinite' && hasNextPage && (
        <div ref={observerTarget} className="h-10" />
      )}

      {/* End of results message */}
      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          You've reached the end of the product list
        </div>
      )}
    </>
  );
};
