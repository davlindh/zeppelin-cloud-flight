import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminNotification {
  id: string;
  type: 'role_application' | 'security_alert' | 'low_stock' | 'auction_ending' | 'order_pending';
  title: string;
  message: string;
  urgency: 'urgent' | 'important' | 'info';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  entityId?: string;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscriptions();
  }, []);

  const loadNotifications = async () => {
    // Load recent items that need attention
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const notificationsList: AdminNotification[] = [];

    // Check for pending orders
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id, order_number, created_at')
      .eq('status', 'pending')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    pendingOrders?.forEach(order => {
      notificationsList.push({
        id: `order-${order.id}`,
        type: 'order_pending',
        title: 'New Order Pending',
        message: `Order #${order.order_number} requires processing`,
        urgency: 'important',
        timestamp: order.created_at,
        read: false,
        actionUrl: `/admin/orders/${order.id}`,
        entityId: order.id,
      });
    });

    // Check for low stock products
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id, title, stock_quantity')
      .lte('stock_quantity', 10)
      .gt('stock_quantity', 0)
      .limit(5);

    lowStockProducts?.forEach(product => {
      notificationsList.push({
        id: `stock-${product.id}`,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.title} has only ${product.stock_quantity} units left`,
        urgency: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/admin/products/${product.id}`,
        entityId: product.id,
      });
    });

    // Check for auctions ending soon
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const { data: endingAuctions } = await supabase
      .from('auctions')
      .select('id, title, end_time')
      .eq('status', 'active')
      .lte('end_time', tomorrow)
      .gte('end_time', now.toISOString())
      .order('end_time', { ascending: true })
      .limit(5);

    endingAuctions?.forEach(auction => {
      notificationsList.push({
        id: `auction-${auction.id}`,
        type: 'auction_ending',
        title: 'Auction Ending Soon',
        message: `${auction.title} ends soon`,
        urgency: 'info',
        timestamp: auction.end_time,
        read: false,
        actionUrl: `/admin/auctions/${auction.id}`,
        entityId: auction.id,
      });
    });

    setNotifications(notificationsList.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    setUnreadCount(notificationsList.filter(n => !n.read).length);
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase.channel('admin-notifications');

    // Listen for new orders
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        const newNotification: AdminNotification = {
          id: `order-${payload.new.id}`,
          type: 'order_pending',
          title: 'New Order Received',
          message: `Order #${payload.new.order_number} requires processing`,
          urgency: 'important',
          timestamp: payload.new.created_at,
          read: false,
          actionUrl: `/admin/orders/${payload.new.id}`,
          entityId: payload.new.id,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: '🔔 New Order',
          description: newNotification.message,
        });
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: loadNotifications,
  };
}
