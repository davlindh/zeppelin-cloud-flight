import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export type ActivityType = 'order' | 'favorite' | 'review' | 'bid' | 'booking';

export interface CustomerActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  image?: string;
  linkTo?: string;
  entityId: string;
}

export const useCustomerActivity = (userId: string | undefined, limit = 20) => {
  return useQuery({
    queryKey: ['customer-activity', userId, limit],
    queryFn: async (): Promise<CustomerActivity[]> => {
      if (!userId) throw new Error('User ID required');

      const activities: CustomerActivity[] = [];

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total_amount, order_items(item_title, item_type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      orders?.forEach(order => {
        const firstItem = order.order_items?.[0];
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'Order Placed',
          description: `Order #${order.order_number} - ${order.total_amount} kr`,
          timestamp: order.created_at,
          relativeTime: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
          linkTo: `/marketplace/orders/${order.id}`,
          entityId: order.id
        });
      });

      // Fetch favorites
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('id, created_at, item_id, item_type, products(title, image)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      favorites?.forEach(fav => {
        activities.push({
          id: `favorite-${fav.id}`,
          type: 'favorite',
          title: 'Item Favorited',
          description: (fav as any).products?.title || 'Item',
          timestamp: fav.created_at,
          relativeTime: formatDistanceToNow(new Date(fav.created_at), { addSuffix: true }),
          image: (fav as any).products?.image,
          linkTo: `/marketplace/shop/${fav.item_id}`,
          entityId: fav.item_id
        });
      });

      // Fetch bids
      const { data: bids } = await supabase
        .from('bid_history')
        .select('id, created_at, amount, auction_id, auctions(title, image)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      bids?.forEach(bid => {
        activities.push({
          id: `bid-${bid.id}`,
          type: 'bid',
          title: 'Bid Placed',
          description: `${bid.amount} kr on ${(bid as any).auctions?.title || 'auction'}`,
          timestamp: bid.created_at,
          relativeTime: formatDistanceToNow(new Date(bid.created_at), { addSuffix: true }),
          image: (bid as any).auctions?.image,
          linkTo: `/marketplace/auctions/${bid.auction_id}`,
          entityId: bid.auction_id
        });
      });

      // Sort all activities by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    enabled: !!userId,
    staleTime: 30 * 1000 // 30 seconds
  });
};
