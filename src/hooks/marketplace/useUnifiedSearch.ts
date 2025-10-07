import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl } from '@/utils/marketplace/imageUtils';

export interface UnifiedSearchResult {
  id: string;
  title: string;
  type: 'auction' | 'product' | 'service';
  description?: string;
  price?: number;
  currentBid?: number;
  startingPrice?: number;
  image: string;
  category?: string;
  categoryName?: string;
  slug?: string;
  endTime?: string; // for auctions
  inStock?: boolean; // for products
  available?: boolean; // for services
  rating?: number;
  provider?: string; // for services
}

interface UseUnifiedSearchOptions {
  searchTerm: string;
  limit?: number;
  categories?: string[];
}

export const useUnifiedSearch = ({ 
  searchTerm, 
  limit = 20,
  categories = []
}: UseUnifiedSearchOptions) => {
  return useQuery({
    queryKey: ['unified-search', searchTerm, limit, categories],
    queryFn: async (): Promise<UnifiedSearchResult[]> => {
      if (!searchTerm.trim()) {
        return [];
      }

      console.log('🔍 Unified Search:', { searchTerm, limit, categories });

      const results: UnifiedSearchResult[] = [];
      const term = searchTerm.toLowerCase();

      try {
        // Search Auctions
        let auctionQuery = supabase
          .from('auctions')
          .select('id, title, image, current_bid, starting_bid, end_time, category, slug')
          .or(`title.ilike.%${term}%,category.ilike.%${term}%`)
          .limit(Math.ceil(limit / 3));

        if (categories.length > 0) {
          auctionQuery = auctionQuery.in('category', categories as any);
        }

        const { data: auctions } = await auctionQuery;

        if (auctions) {
          results.push(...auctions.map(auction => ({
            id: auction.id,
            title: auction.title,
            type: 'auction' as const,
            price: auction.current_bid,
            currentBid: auction.current_bid,
            startingPrice: auction.starting_bid,
            image: getImageUrl(auction.image), // Transform nullable to non-null
            category: auction.category,
            slug: auction.slug || undefined,
            endTime: auction.end_time
          })));
        }

        // Search Products
        const productQuery = supabase
          .from('products')
          .select(`
            id, title, description, selling_price, image, in_stock, rating, slug,
            category:categories!category_id (name, display_name)
          `)
          .or(`title.ilike.%${term}%,description.ilike.%${term}%,product_brand.ilike.%${term}%`)
          .eq('is_stock_item', true)
          .limit(Math.ceil(limit / 3));

        const { data: products } = await productQuery;

        if (products) {
          results.push(...products.map(product => ({
            id: product.id,
            title: product.title,
            type: 'product' as const,
            description: product.description,
            price: product.selling_price,
            image: getImageUrl(product.image), // Transform nullable to non-null
            category: product.category?.name || 'general',
            categoryName: product.category?.display_name || product.category?.name || 'General',
            slug: product.slug || undefined,
            inStock: product.in_stock || false,
            rating: product.rating || 0
          })));
        }

        // Search Services
        let serviceQuery = supabase
          .from('services')
          .select('id, title, description, starting_price, image, available, rating, category, slug, provider')
          .or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
          .limit(Math.ceil(limit / 3));

        if (categories.length > 0) {
          serviceQuery = serviceQuery.in('category', categories as any);
        }

        const { data: services } = await serviceQuery;

        if (services) {
          results.push(...services.map(service => ({
            id: service.id,
            title: service.title,
            type: 'service' as const,
            description: service.description,
            startingPrice: service.starting_price,
            image: getImageUrl(service.image), // Transform nullable to non-null
            category: service.category,
            slug: service.slug || undefined,
            available: service.available,
            rating: service.rating,
            provider: service.provider
          })));
        }

        // Sort by relevance (exact matches first, then by rating/price)
        const sortedResults = results.sort((a, b) => {
          const aExactMatch = a.title.toLowerCase().includes(term);
          const bExactMatch = b.title.toLowerCase().includes(term);
          
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // Secondary sort by rating if available
          if (a.rating && b.rating) {
            return b.rating - a.rating;
          }
          
          return 0;
        });

        console.log('🔍 Unified Search Results:', {
          term,
          totalResults: sortedResults.length,
          breakdown: {
            auctions: sortedResults.filter(r => r.type === 'auction').length,
            products: sortedResults.filter(r => r.type === 'product').length,
            services: sortedResults.filter(r => r.type === 'service').length
          }
        });

        return sortedResults.slice(0, limit);

      } catch (error) {
        console.error('Unified search error:', error);
        return [];
      }
    },
    enabled: !!searchTerm.trim(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes,
  });
};