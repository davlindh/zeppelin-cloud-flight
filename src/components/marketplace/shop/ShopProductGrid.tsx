
import React from 'react';
import { EnhancedProductCard } from '@/components/ui/enhanced-product-card';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { ResponsiveGrid } from '@/components/ui/advanced-layout';

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
      <div className="text-center py-12">
        <p className="text-slate-700 text-lg mb-2">No products found matching your criteria.</p>
        <p className="text-slate-600">Try adjusting your search or browse all categories.</p>
      </div>
    );
  }

  return (
    <ResponsiveGrid density={density} variant="normal">
      {products.map((product) => (
        <EnhancedProductCard
          key={product.id}
          product={product}
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
