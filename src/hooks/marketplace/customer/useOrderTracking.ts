import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, formatDistanceToNow } from 'date-fns';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTracking {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  itemsCount: number;
  totalAmount: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    isComplete: boolean;
  }[];
}

export const useOrderTracking = (userId: string | undefined, limit = 3) => {
  return useQuery({
    queryKey: ['order-tracking', userId, limit],
    queryFn: async (): Promise<OrderTracking[]> => {
      if (!userId) throw new Error('User ID required');

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(id),
          order_status_history(old_status, new_status, created_at)
        `)
        .eq('user_id', userId)
        .in('status', ['pending', 'paid', 'shipped'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return orders?.map(order => {
        const allStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];
        const currentStatusIndex = allStatuses.indexOf(order.status as OrderStatus);

        // Build status history from current status
        const statusHistory = allStatuses.map((status, index) => ({
          status,
          timestamp: index <= currentStatusIndex ? order.created_at : '',
          isComplete: index <= currentStatusIndex
        }));

        // Estimate delivery (7 days from order for paid/shipped orders)
        let estimatedDelivery: string | undefined;
        if (order.status === 'paid' || order.status === 'shipped') {
          const deliveryDate = addDays(new Date(order.created_at), 7);
          estimatedDelivery = formatDistanceToNow(deliveryDate, { addSuffix: true });
        }

        return {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status as OrderStatus,
          createdAt: order.created_at,
          itemsCount: order.order_items?.length || 0,
          totalAmount: order.total_amount,
          estimatedDelivery,
          trackingNumber: order.tracking_number,
          trackingUrl: order.tracking_url,
          statusHistory
        };
      }) || [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000 // 1 minute
  });
};
