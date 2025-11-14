import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductExtended } from '@/types/commerce';

export const useProductsByEvent = (eventId?: string) => {
  return useQuery({
    queryKey: ['products-by-event', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          events:event_id(id, title),
          projects:project_id(id, title),
          service_providers:seller_id(id, business_name)
        `)
        .eq('event_id', eventId)
        .eq('approval_status', 'approved')
        .in('visibility', ['public', 'event_only'])
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products: ProductExtended[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.selling_price,
        originalPrice: p.original_price,
        image: p.image,
        images: p.images || [],
        category: p.category || '',
        categoryId: p.category_id || '',
        brand: p.product_brand,
        inStock: p.in_stock,
        stockQuantity: p.stock_quantity,
        rating: p.rating,
        reviews: p.reviews,
        sellerId: p.seller_id,
        sellerType: p.seller_type || 'provider',
        sellerName: p.service_providers?.business_name,
        eventId: p.event_id,
        eventTitle: p.events?.title,
        projectId: p.project_id,
        projectTitle: p.projects?.title,
        visibility: p.visibility || 'public',
        approvalStatus: p.approval_status || 'approved',
        commissionRate: p.commission_rate || 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      return products;
    },
    enabled: !!eventId,
  });
};
