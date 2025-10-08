import React from 'react';
import { EnhancedProductCard } from '@/components/marketplace/ui/enhanced-product-card';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { sortProductsByAnalytics } from '@/utils/marketplace/productUtils';
import type { Product } from '@/types/unified';

interface ProductRecommendationsProps {
  currentProduct: Product;
  title?: string;
  maxItems?: number;
  onProductClick?: (productId: string) => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProduct,
  title = "You might also like",
  maxItems = 4,
  onProductClick
}) => {
  const { data: allProducts = [] } = useProducts();
  
  const recommendations = React.useMemo(() => {
    if (allProducts.length === 0) return [];
    
    // Filter out current product
    const filteredProducts = allProducts.filter(p => p.id !== currentProduct.id);
    
    // Get products from same category first
    const sameCategory = filteredProducts.filter(p => p.categoryId === currentProduct.categoryId);
    
    // Get products with similar price range (±30%)
    const minPrice = currentProduct.price * 0.7;
    const maxPrice = currentProduct.price * 1.3;
    const similarPrice = filteredProducts.filter(p => 
      p.price >= minPrice && p.price <= maxPrice && p.categoryId !== currentProduct.categoryId
    );
    
    // Get trending products as fallback
    const trending = sortProductsByAnalytics(filteredProducts, 'trending');
    
    // Combine recommendations with priority: same category > similar price > trending
    const combined = [
      ...sameCategory.slice(0, Math.ceil(maxItems * 0.6)),
      ...similarPrice.slice(0, Math.ceil(maxItems * 0.3)),
      ...trending.slice(0, maxItems)
    ];
    
    // Remove duplicates and limit to maxItems
    const unique = combined.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    return unique.slice(0, maxItems);
  }, [allProducts, currentProduct, maxItems]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Based on category and price
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} onClick={() => onProductClick?.(product.id)}>
            <EnhancedProductCard
              product={product}
              showAnalytics={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};