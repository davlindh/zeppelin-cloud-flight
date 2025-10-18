import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'price_drop' | 'stock_alert' | 'auction_ending' | 'outbid' | 'back_in_stock' | 'booking_update' | 'communication_response' | 'service_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  userId?: string;
  auctionId?: string;
  productId?: string;
  serviceId?: string;
  metadata?: Record<string, any>;
}

interface UseNotificationsOptions {
  userId?: string;
  limit?: number;
  includeRead?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { userId, limit = 50, includeRead = true } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications from Supabase
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', userId, limit, includeRead],
    queryFn: async () => {
      let query = supabase
        .from('bid_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Transform Supabase notifications to our format
      return (data ?? []).map(item => ({
        id: item.id,
        type: mapNotificationType(item.notification_type),
        title: getNotificationTitle(item.notification_type),
        message: item.message,
        timestamp: formatTimestamp(item.created_at),
        read: item.is_read || false,
        actionUrl: getActionUrl(item),
        actionText: getActionText(item.notification_type),
        userId: item.user_id,
        auctionId: item.auction_id,
        metadata: {}
      })) as Notification[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('bid_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      let query = supabase
        .from('bid_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('bid_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });

  // Create new notification
  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const { error } = await supabase
        .from('bid_notifications')
        .insert({
          user_id: notification.userId,
          auction_id: notification.auctionId,
          notification_type: mapToSupabaseType(notification.type),
          message: notification.message,
          is_read: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bid_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time notification update:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT' && payload.new) {
            const newNotification = payload.new as any;
            toast({
              title: getNotificationTitle(newNotification.notification_type),
              description: newNotification.message,
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutate(id),
    createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => 
      createNotificationMutation.mutate(notification),
    refetch,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isCreating: createNotificationMutation.isPending,
  };
};

// Helper functions
function mapNotificationType(supabaseType: string): Notification['type'] {
  switch (supabaseType) {
    case 'outbid': return 'outbid';
    case 'winning': return 'auction_ending';
    case 'auction_ending': return 'auction_ending';
    case 'auction_won': return 'auction_ending';
    case 'auction_lost': return 'auction_ending';
    default: return 'auction_ending';
  }
}

function mapToSupabaseType(type: Notification['type']): string {
  switch (type) {
    case 'outbid': return 'outbid';
    case 'auction_ending': return 'auction_ending';
    case 'price_drop': return 'auction_ending'; // Map to available type
    case 'stock_alert': return 'auction_ending';
    case 'back_in_stock': return 'auction_ending';
    default: return 'auction_ending';
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'outbid': return 'You\'ve been outbid';
    case 'winning': return 'You\'re winning!';
    case 'auction_ending': return 'Auction ending soon';
    case 'auction_won': return 'Congratulations!';
    case 'auction_lost': return 'Auction ended';
    default: return 'Notification';
  }
}

function getActionText(type: string): string {
  switch (type) {
    case 'outbid': return 'Place New Bid';
    case 'winning': return 'View Auction';
    case 'auction_ending': return 'Place Bid';
    case 'auction_won': return 'View Details';
    case 'auction_lost': return 'View Auction';
    default: return 'View';
  }
}

function getActionUrl(item: any): string {
  if (item.auction_id) {
    return `/marketplace/auctions/${item.auction_id}`;
  }
  return '/marketplace/auctions';
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
