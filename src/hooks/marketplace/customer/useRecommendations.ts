import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductRecommendation {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string | null;
  rating: number;
  inStock: boolean;
  isNew: boolean;
  isPopular: boolean;
  categoryName: string;
}

export const useRecommendations = (userId: string | undefined, limit = 6) => {
  return useQuery({
    queryKey: ['customer-recommendations', userId, limit],
    queryFn: async (): Promise<ProductRecommendation[]> => {
      if (!userId) {
        // For non-logged-in users, return trending products
        const { data: trending } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('in_stock', true)
          .order('reviews', { ascending: false })
          .limit(limit);

        return mapProducts(trending || []);
      }

      // Get user's favorite categories from past orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('item_id, item_type, orders!inner(user_id)')
        .eq('orders.user_id', userId);

      const productIds = orderItems?.filter(i => i.item_type === 'product').map(i => i.item_id) || [];

      const { data: purchasedProducts } = await supabase
        .from('products')
        .select('category_id')
        .in('id', productIds);

      const categoryIds = [...new Set(purchasedProducts?.map(p => p.category_id).filter(Boolean))];

      // Get favorited items to exclude
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'product');

      const favoritedIds = favorites?.map(f => f.item_id) || [];
      const excludeIds = [...new Set([...productIds, ...favoritedIds])];

      // Fetch recommendations based on favorite categories
      let query = supabase
        .from('products')
        .select('*, categories(name)')
        .eq('in_stock', true)
        .not('id', 'in', `(${excludeIds.join(',') || 'null'})`);

      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }

      const { data: recommendations } = await query
        .order('rating', { ascending: false })
        .order('reviews', { ascending: false })
        .limit(limit);

      // If not enough recommendations, fill with trending products
      if ((recommendations?.length || 0) < limit) {
        const remaining = limit - (recommendations?.length || 0);
        const { data: trending } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('in_stock', true)
          .not('id', 'in', `(${[...excludeIds, ...(recommendations?.map(r => r.id) || [])].join(',') || 'null'})`)
          .order('reviews', { ascending: false })
          .limit(remaining);

        return mapProducts([...(recommendations || []), ...(trending || [])]);
      }

      return mapProducts(recommendations || []);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

function mapProducts(products: any[]): ProductRecommendation[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.selling_price,
    originalPrice: p.original_price,
    image: p.image,
    rating: p.rating || 0,
    inStock: p.in_stock,
    isNew: new Date(p.created_at) > sevenDaysAgo,
    isPopular: (p.reviews || 0) > 10,
    categoryName: p.categories?.name || 'General'
  }));
}
