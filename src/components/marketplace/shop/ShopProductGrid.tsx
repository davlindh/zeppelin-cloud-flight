
import React, { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { ProductSkeleton } from '@/components/marketplace/ui/product-skeleton';

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
  enableVirtualization?: boolean;
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
  scrollMode = 'loadmore',
  enableVirtualization = true
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Calculate columns per row based on density and screen width
  const getColumnsPerRow = useCallback(() => {
    if (typeof window === 'undefined') return 5;
    
    const width = window.innerWidth;
    
    if (density === 'compact') {
      if (width >= 1536) return 6; // 2xl
      if (width >= 1280) return 5; // xl
      if (width >= 1024) return 4; // lg
      if (width >= 768) return 3;  // md
      if (width >= 640) return 2;  // sm
      return 1;
    } else if (density === 'comfortable') {
      if (width >= 1536) return 5;
      if (width >= 1280) return 4;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    } else {
      if (width >= 1536) return 4;
      if (width >= 1280) return 3;
      if (width >= 1024) return 2;
      return 1;
    }
  }, [density]);

  const [columnsPerRow, setColumnsPerRow] = React.useState(getColumnsPerRow);

  // Update columns on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setColumnsPerRow(getColumnsPerRow());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getColumnsPerRow]);

  // Group products into rows for virtualization
  const productRows = useMemo(() => {
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += columnsPerRow) {
      rows.push(products.slice(i, i + columnsPerRow));
    }
    return rows;
  }, [products, columnsPerRow]);

  // Virtual row setup
  const rowVirtualizer = useVirtualizer({
    count: productRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420, // Estimated row height
    overscan: 2,
    enabled: enableVirtualization && products.length > 20,
  });

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

  // Trigger load more when scrolling near end (for virtualized lists)
  React.useEffect(() => {
    if (!enableVirtualization || scrollMode !== 'infinite') return;
    
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];
    
    if (!lastItem) return;
    
    // Load more when we're within 5 rows of the end
    if (
      lastItem.index >= productRows.length - 5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage?.();
    }
  }, [
    enableVirtualization,
    scrollMode,
    rowVirtualizer.getVirtualItems(),
    productRows.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Render skeleton loading state
  if (isLoading && products.length === 0) {
    return (
      <div className={`grid gap-4 md:gap-6 ${
        density === 'compact' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
          : density === 'comfortable'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
          : 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      }`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
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

  // Render virtualized grid (for large lists)
  if (enableVirtualization && products.length > 20) {
    return (
      <>
        <div
          ref={parentRef}
          className="w-full"
          style={{ height: '100%', overflow: 'auto' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = productRows[virtualRow.index];
              
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={`grid gap-4 md:gap-6 ${
                    density === 'compact' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                      : density === 'comfortable'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                      : 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                  }`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.map((product) => (
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
                </div>
              );
            })}
          </div>
        </div>

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

        {/* End of results message */}
        {!hasNextPage && products.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            You've reached the end of the product list
          </div>
        )}
      </>
    );
  }

  // Render standard grid (for smaller lists)
  return (
    <>
      <div className={`grid gap-4 md:gap-6 ${
        density === 'compact' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
          : density === 'comfortable'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
          : 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      }`}>
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
      </div>

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
