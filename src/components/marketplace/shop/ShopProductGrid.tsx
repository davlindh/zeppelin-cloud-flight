
import React from 'react';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { ProductSkeleton } from '@/components/marketplace/ui/product-skeleton';
import { ResponsiveGrid } from '@/components/marketplace/ui/advanced-layout';

import type { Product } from '@/types/unified';

interface ShopProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  handleQuickView: (productId: string) => void;
  handleAddToComparison: (product: Product) => void;
  isInComparison: (productId: string) => boolean;
  onBrandClick?: (brand: string) => void;
  density?: 'compact' | 'comfortable' | 'spacious';
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  products,
  isLoading,
  isError,
  handleQuickView,
  handleAddToComparison,
  isInComparison,
  onBrandClick,
  density = 'comfortable'
}) => {
  if (isLoading) {
    return (
      <ResponsiveGrid density={density} variant="normal">
        {Array.from({ length: 9 }).map((_, index) => (
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
    <ResponsiveGrid density="compact" variant="normal">
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
  );
};
