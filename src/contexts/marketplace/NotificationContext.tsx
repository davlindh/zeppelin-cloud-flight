import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  refreshNotifications: () => void;
  // Real-time features
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  const { toast } = useToast();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch
  } = useNotifications({
    userId: currentUserId,
    limit: 100,
    includeRead: true
  });

  // Update user ID when it changes
  useEffect(() => {
    setCurrentUserId(userId);
  }, [userId]);

  // Show toast notifications for new unread notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    // Only show toast for recent notifications (within last 5 minutes)
    const recentUnread = unreadNotifications.filter(n => {
      const notificationTime = new Date(n.timestamp).getTime();
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      return (now - notificationTime) < fiveMinutes;
    });

    if (recentUnread.length > 0 && !isLoading) {
      const latestNotification = recentUnread[0];
      if (latestNotification) {
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          duration: 6000,
        });
      }
    }
  }, [notifications, isLoading, toast]);

  const subscribeToNotifications = (newUserId: string) => {
    setCurrentUserId(newUserId);
  };

  const unsubscribeFromNotifications = () => {
    setCurrentUserId(undefined);
  };

  const refreshNotifications = () => {
    refetch();
  };

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// Hook for triggering notifications from anywhere in the app
export const useNotificationTrigger = () => {
  const { createNotification } = useNotificationContext();

  const triggerPriceDropAlert = (productId: string, productName: string, oldPrice: number, newPrice: number, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'price_drop',
      title: 'Price Drop Alert',
      message: `${productName} dropped from $${oldPrice} to $${newPrice}`,
      userId,
      productId,
      actionUrl: `/shop/product/${productId}`,
      actionText: 'View Product'
    });
  };

  const triggerAuctionEndingAlert = (auctionId: string, auctionTitle: string, timeLeft: string, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'auction_ending',
      title: 'Auction Ending Soon',
      message: `"${auctionTitle}" ends in ${timeLeft}`,
      userId,
      auctionId,
      actionUrl: `/marketplace/auctions/${auctionId}`,
      actionText: 'Place Bid'
    });
  };

  const triggerOutbidAlert = (auctionId: string, auctionTitle: string, newBidAmount: number, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'outbid',
      title: 'You\'ve been outbid',
      message: `Someone placed a $${newBidAmount} bid on "${auctionTitle}"`,
      userId,
      auctionId,
      actionUrl: `/marketplace/auctions/${auctionId}`,
      actionText: 'Place New Bid'
    });
  };

  const triggerBackInStockAlert = (productId: string, productName: string, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'back_in_stock',
      title: 'Back in Stock',
      message: `${productName} is now available`,
      userId,
      productId,
      actionUrl: `/shop/product/${productId}`,
      actionText: 'Shop Now'
    });
  };

  const triggerBookingUpdate = (serviceId: string, serviceName: string, status: string, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'booking_update',
      title: 'Booking Update',
      message: `Your booking for "${serviceName}" is now ${status}`,
      userId,
      serviceId,
      actionUrl: `/services/${serviceId}`,
      actionText: 'View Details'
    });
  };

  const triggerCommunicationResponse = (serviceId: string, providerName: string, userId?: string) => {
    if (!userId) return;
    
    createNotification({
      type: 'communication_response',
      title: 'Provider Response',
      message: `${providerName} has responded to your message`,
      userId,
      serviceId,
      actionUrl: `/services/${serviceId}`,
      actionText: 'View Response'
    });
  };

  return {
    triggerPriceDropAlert,
    triggerAuctionEndingAlert,
    triggerOutbidAlert,
    triggerBackInStockAlert,
    triggerBookingUpdate,
    triggerCommunicationResponse,
  };
};

// Helper hook for notification preferences integration
export const useNotificationFiltering = () => {
  const { notifications } = useNotificationContext();

  const filterByType = (type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  };

  const filterByRead = (read: boolean) => {
    return notifications.filter(n => n.read === read);
  };

  const filterByTimeframe = (hours: number) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.timestamp) > cutoff);
  };

  return {
    filterByType,
    filterByRead,
    filterByTimeframe,
    allNotifications: notifications,
  };
};
