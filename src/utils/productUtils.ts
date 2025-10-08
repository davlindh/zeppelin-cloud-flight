
import type { Product } from '@/types/unified';

export interface ProductAnalytics {
  stockVelocity: 'high' | 'medium' | 'low';
  popularityScore: number;
  priceDirection: 'up' | 'down' | 'stable';
  dealQuality: 'excellent' | 'good' | 'fair' | 'none';
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  salesTrend: 'trending' | 'steady' | 'declining';
}

export const calculateProductAnalytics = (product: Product): ProductAnalytics => {
  // Calculate stock velocity based on reviews and rating
  const stockVelocity = product.reviews > 100 && product.rating > 4.5 ? 'high' :
                       product.reviews > 50 && product.rating > 4.0 ? 'medium' : 'low';

  // Calculate popularity score (0-100)
  const popularityScore = Math.min(100, (product.rating * 15) + (product.reviews * 0.1));

  // Determine price direction based on original price
  const priceDirection = product.originalPrice && product.originalPrice > product.price ? 'down' :
                        product.originalPrice && product.originalPrice < product.price ? 'up' : 'stable';

  // Calculate deal quality
  const discountPercent = product.originalPrice 
    ? ((product.originalPrice - product.price) / product.originalPrice) * 100 
    : 0;
  
  const dealQuality = discountPercent > 30 ? 'excellent' :
                     discountPercent > 20 ? 'good' :
                     discountPercent > 10 ? 'fair' : 'none';

  // Determine stock status
  const stockStatus = !product.inStock ? 'out-of-stock' :
                     popularityScore > 80 ? 'low-stock' : 'in-stock';

  // Calculate sales trend
  const salesTrend = stockVelocity === 'high' && product.rating > 4.5 ? 'trending' :
                    stockVelocity === 'medium' ? 'steady' : 'declining';

  return {
    stockVelocity,
    popularityScore,
    priceDirection,
    dealQuality,
    stockStatus,
    salesTrend
  };
};

export const getProductStatusBadge = (analytics: ProductAnalytics) => {
  if (analytics.salesTrend === 'trending') {
    return { text: '🔥 Trending', variant: 'destructive' as const, priority: 1 };
  }
  
  if (analytics.dealQuality === 'excellent') {
    return { text: '💎 Best Deal', variant: 'destructive' as const, priority: 2 };
  }
  
  if (analytics.stockVelocity === 'high') {
    return { text: '⚡ Fast Moving', variant: 'default' as const, priority: 3 };
  }
  
  if (analytics.stockStatus === 'low-stock') {
    return { text: '⚠️ Low Stock', variant: 'secondary' as const, priority: 4 };
  }
  
  if (analytics.dealQuality === 'good') {
    return { text: '💰 Good Deal', variant: 'outline' as const, priority: 5 };
  }
  
  return null;
};

export const sortProductsByAnalytics = (products: Product[], sortBy: string): Product[] => {
  const productsWithAnalytics = products.map(product => ({
    ...product,
    analytics: calculateProductAnalytics(product)
  }));

  switch (sortBy) {
    case 'trending':
      return productsWithAnalytics
        .sort((a, b) => {
          if (a.analytics.salesTrend === 'trending' && b.analytics.salesTrend !== 'trending') return -1;
          if (b.analytics.salesTrend === 'trending' && a.analytics.salesTrend !== 'trending') return 1;
          return b.analytics.popularityScore - a.analytics.popularityScore;
        });
    
    case 'best-deals':
      return productsWithAnalytics
        .sort((a, b) => {
          const aDiscount = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
          const bDiscount = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
          return bDiscount - aDiscount;
        });
    
    case 'popularity':
      return productsWithAnalytics
        .sort((a, b) => b.analytics.popularityScore - a.analytics.popularityScore);
    
    case 'stock-velocity':
      return productsWithAnalytics
        .sort((a, b) => {
          const velocityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return velocityOrder[b.analytics.stockVelocity] - velocityOrder[a.analytics.stockVelocity];
        });
    
    default:
      return products;
  }
};
