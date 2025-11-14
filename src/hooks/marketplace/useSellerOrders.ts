import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SellerOrderItem } from '@/types/commerce';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface UseSellerOrdersOptions {
  status?: OrderStatus;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useSellerOrders = (options: UseSellerOrdersOptions = {}) => {
  return useQuery({
    queryKey: ['seller-orders', options],
    queryFn: async () => {
      // Get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!provider) throw new Error('Provider profile not found');

      // Build query for order items
      let query = supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            status,
            customer_name,
            customer_email,
            created_at,
            event_id,
            events(id, title)
          )
        `)
        .eq('seller_id', provider.id)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('orders.status', options.status);
      }

      if (options.eventId) {
        query = query.eq('orders.event_id', options.eventId);
      }

      if (options.dateFrom) {
        query = query.gte('orders.created_at', options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte('orders.created_at', options.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to SellerOrderItem
      const orderItems: SellerOrderItem[] = (data || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        orderNumber: item.orders.order_number,
        itemTitle: item.item_title,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        commissionRate: item.commission_rate || 0,
        commissionAmount: item.commission_amount || 0,
        customerName: item.orders.customer_name,
        customerEmail: item.orders.customer_email,
        orderStatus: item.orders.status,
        orderCreatedAt: item.orders.created_at,
        eventId: item.orders.event_id,
        eventTitle: item.orders.events?.title,
      }));

      return orderItems;
    },
  });
};
