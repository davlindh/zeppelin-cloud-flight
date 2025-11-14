import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardRole, NotificationItem } from '@/types/dashboard';

interface UseRoleNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  refresh: () => void;
  isLoading: boolean;
}

export function useRoleNotifications(
  role: DashboardRole, 
  userId?: string
): UseRoleNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['role-notifications', role, userId],
    queryFn: async (): Promise<NotificationItem[]> => {
      // This is a generic hook that can be extended per role
      // Each role (admin, provider, participant, customer) can fetch their own notifications
      
      // For now, return empty array
      // Implementations should override this in role-specific hooks
      return [];
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });

  // Update local state when query data changes
  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  }, [data]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: refetch,
    isLoading,
  };
}
