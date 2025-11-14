import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductExtended, ProductVisibility, ApprovalStatus } from '@/types/commerce';

interface UseMyProductsOptions {
  visibility?: ProductVisibility;
  approvalStatus?: ApprovalStatus;
  eventId?: string;
}

export const useMyProducts = (options: UseMyProductsOptions = {}) => {
  return useQuery({
    queryKey: ['my-products', options],
    queryFn: async () => {
      // First, get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!provider) throw new Error('Provider profile not found');

      // Build query
      let query = supabase
        .from('products')
        .select(`
          *,
          events:event_id(id, title),
          projects:project_id(id, title),
          service_providers:seller_id(id, business_name)
        `)
        .eq('seller_id', provider.id)
        .order('created_at', { ascending: false });

      if (options.visibility) {
        query = query.eq('visibility', options.visibility);
      }

      if (options.approvalStatus) {
        query = query.eq('approval_status', options.approvalStatus);
      }

      if (options.eventId) {
        query = query.eq('event_id', options.eventId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to ProductExtended
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
    enabled: true,
  });
};
