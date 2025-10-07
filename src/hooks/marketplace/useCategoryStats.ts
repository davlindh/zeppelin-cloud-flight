import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CategoryStats {
  productCount: number;
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatus: 'good' | 'low' | 'out';
  isHot: boolean;
  hasNewArrivals: boolean;
  isComingSoon: boolean;
}

interface CategoryStatsMap {
  [categoryName: string]: CategoryStats;
}

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['category-stats'],
    queryFn: async (): Promise<CategoryStatsMap> => {
      console.log('Fetching category statistics...');
      
      try {
        // Get all categories first
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, display_name')
          .eq('is_active', true);

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }

        if (!categoriesData) {
          return {};
        }

        // Get product statistics for each category
        const statsPromises = categoriesData.map(async (category) => {
          const { data: products, error } = await supabase
            .from('products')
            .select('selling_price, stock_quantity, in_stock, created_at')
            .eq('category_id', category.id)
            .eq('is_stock_item', true);

          if (error) {
            console.warn(`Error fetching products for category ${category.name}:`, error);
            return [category.name, {
              productCount: 0,
              stockStatus: 'out' as const,
              isHot: false,
              hasNewArrivals: false,
              isComingSoon: false
            }];
          }

          if (!products || products.length === 0) {
            return [category.name, {
              productCount: 0,
              stockStatus: 'out' as const,
              isHot: false,
              hasNewArrivals: false,
              isComingSoon: true // Categories with no products are "coming soon"
            }];
          }

          // Calculate statistics
          const productCount = products.length;
          const prices = products.map(p => p.selling_price).filter(Boolean);
          const inStockCount = products.filter(p => p.in_stock).length;
          
          // Price range
          const priceRange = prices.length > 0 ? {
            min: Math.min(...prices),
            max: Math.max(...prices)
          } : undefined;

          // Stock status
          const stockStatus = 
            inStockCount === 0 ? 'out' :
            (inStockCount / productCount) < 0.3 ? 'low' : 'good';

          // Activity indicators
          const recentDate = new Date();
          recentDate.setDate(recentDate.getDate() - 7); // Last 7 days
          
          const hasNewArrivals = products.some(p => 
            new Date(p.created_at) > recentDate
          );
          
          const isHot = productCount >= 20 && inStockCount > 10; // Many products and good stock

          const stats: CategoryStats = {
            productCount,
            priceRange,
            stockStatus,
            isHot,
            hasNewArrivals,
            isComingSoon: false
          };

          return [category.name, stats];
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap = Object.fromEntries(statsResults);
        
        console.log('Category statistics:', statsMap);
        return statsMap;

      } catch (error) {
        console.error('Failed to fetch category statistics:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
