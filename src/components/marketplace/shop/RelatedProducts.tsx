
import React from 'react';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { useProducts } from '@/hooks/marketplace/useProducts';
import type { Product } from '@/types/unified';

interface RelatedProductsProps {
  currentProduct: Product;
  limit?: number;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  limit = 4
}) => {
  const { data: allProducts = [] } = useProducts({
    category: currentProduct.categoryName,
    inStockOnly: true
  });

  // Filter out the current product and get related products
  const relatedProducts = allProducts
    .filter(product => product.id !== currentProduct.id)
    .slice(0, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Related Products</h2>
        <p className="text-slate-600">You might also like these products</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="enhanced"
            showQuickActions={false}
            showAnalytics={false}
          />
        ))}
      </div>
    </div>
  );
};
