import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export type NotificationUrgency = 'urgent' | 'important' | 'info';
export type NotificationType = 'order' | 'price_drop' | 'auction' | 'booking' | 'review' | 'general';

export interface CustomerNotification {
  id: string;
  type: NotificationType;
  urgency: NotificationUrgency;
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const useCustomerNotifications = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['customer-notifications', userId],
    queryFn: async (): Promise<CustomerNotification[]> => {
      if (!userId) throw new Error('User ID required');

      const notifications: CustomerNotification[] = [];

      // Check for pending orders (urgent)
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id, order_number, created_at')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      pendingOrders?.forEach(order => {
        notifications.push({
          id: `pending-order-${order.id}`,
          type: 'order',
          urgency: 'urgent',
          title: 'Complete Your Payment',
          message: `Order #${order.order_number} is awaiting payment`,
          timestamp: order.created_at,
          relativeTime: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
          isRead: false,
          actionUrl: `/marketplace/orders/${order.id}`,
          actionLabel: 'Complete Payment'
        });
      });

      // Check for delivered orders needing review (important)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('id, order_number, delivered_at, created_at')
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .gte('delivered_at', threeDaysAgo.toISOString())
        .order('delivered_at', { ascending: false })
        .limit(3);

      deliveredOrders?.forEach(order => {
        notifications.push({
          id: `review-order-${order.id}`,
          type: 'review',
          urgency: 'important',
          title: 'Share Your Experience',
          message: `How was your order #${order.order_number}?`,
          timestamp: order.delivered_at || order.created_at,
          relativeTime: formatDistanceToNow(new Date(order.delivered_at || order.created_at), { addSuffix: true }),
          isRead: false,
          actionUrl: `/marketplace/orders/${order.id}`,
          actionLabel: 'Write Review'
        });
      });

      // Check for bid notifications
      const { data: bidNotifications } = await supabase
        .from('bid_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      bidNotifications?.forEach(notif => {
        notifications.push({
          id: `bid-notif-${notif.id}`,
          type: 'auction',
          urgency: notif.notification_type === 'outbid' ? 'important' : 'info',
          title: notif.notification_type === 'outbid' ? 'You\'ve Been Outbid!' : 'Auction Update',
          message: notif.message,
          timestamp: notif.created_at || new Date().toISOString(),
          relativeTime: formatDistanceToNow(new Date(notif.created_at || new Date()), { addSuffix: true }),
          isRead: notif.is_read || false,
          actionUrl: notif.auction_id ? `/marketplace/auctions/${notif.auction_id}` : undefined,
          actionLabel: 'View Auction'
        });
      });

      // Sort by urgency and timestamp
      const urgencyOrder = { urgent: 0, important: 1, info: 2 };
      return notifications.sort((a, b) => {
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000 // Refetch every minute
  });
};
