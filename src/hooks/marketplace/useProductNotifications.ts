
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { supabase } from '@/integrations/supabase/client';

interface ProductNotification {
  id: string;
  type: 'price-drop' | 'low-stock' | 'back-in-stock' | 'general';
  productId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const useProductNotifications = () => {
  const { toast } = useToast();
  const { state: wishlistState } = useWishlist();
  const { preferences, isQuietTime } = useNotificationPreferences();
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('product-notifications');
      if (stored) {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timeStamp || n.timestamp)
        }));
        setNotifications(parsed);
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('product-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.warn('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Set up real-time subscriptions for wishlist items
  useEffect(() => {
    if (wishlistState.items.length === 0) return;

    const productIds = wishlistState.items
      .filter(item => item.itemType === 'product')
      .map(item => item.productId);

    if (productIds.length === 0) return;

    setIsLoading(true);

    // Subscribe to real-time product updates
    const channel = supabase
      .channel('wishlist-product-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=in.(${productIds.join(',')})`
        },
        (payload) => {
          handleProductUpdate(payload.new as any);
        }
      )
      .subscribe();

    setIsLoading(false);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wishlistState.items]);

  const handleProductUpdate = (updatedProduct: any) => {
    const wishlistItem = wishlistState.items.find(item => 
      item.productId === updatedProduct.id && item.itemType === 'product'
    );

    if (!wishlistItem) return;

    const notifications: ProductNotification[] = [];

    // Check for price drops
    if (wishlistItem.priceAlert && 
        updatedProduct.selling_price < wishlistItem.priceAlert &&
        preferences.priceDropAlerts) {
      notifications.push({
        id: `price-${updatedProduct.id}-${Date.now()}`,
        type: 'price-drop',
        productId: updatedProduct.id,
        message: `Price dropped to $${updatedProduct.selling_price} for "${updatedProduct.title}"`,
        timestamp: new Date(),
        read: false,
        priority: wishlistItem.priority || 'medium'
      });
    }

    // Check for back in stock
    if (wishlistItem.backInStockAlert && 
        updatedProduct.in_stock && 
        preferences.backInStockAlerts) {
      notifications.push({
        id: `stock-${updatedProduct.id}-${Date.now()}`,
        type: 'back-in-stock',
        productId: updatedProduct.id,
        message: `"${updatedProduct.title}" is back in stock!`,
        timestamp: new Date(),
        read: false,
        priority: 'high'
      });
    }

    // Check for low stock
    if (wishlistItem.stockAlert && 
        updatedProduct.in_stock && 
        updatedProduct.stock_quantity < 10 && 
        updatedProduct.reviews > 20 &&
        preferences.stockAlerts) {
      notifications.push({
        id: `low-stock-${updatedProduct.id}-${Date.now()}`,
        type: 'low-stock',
        productId: updatedProduct.id,
        message: `"${updatedProduct.title}" is running low on stock (${updatedProduct.stock_quantity} left)!`,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    }

    // Add notifications and show toasts
    notifications.forEach(notification => {
      addNotification(notification);
      
      // Show toast if not in quiet time and immediate notifications are enabled
      if (!isQuietTime() && preferences.frequency.immediate) {
        const icons = {
          'price-drop': '💰',
          'back-in-stock': '🎉',
          'low-stock': '⚠️',
          'general': '📢'
        };

        toast({
          title: `${icons[notification.type]} ${getNotificationTitle(notification.type)}`,
          description: notification.message,
        });
      }
    });
  };

  const addNotification = (notification: ProductNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 100)); // Keep latest 100
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationTitle = (type: ProductNotification['type']): string => {
    switch (type) {
      case 'price-drop': return 'Price Alert!';
      case 'back-in-stock': return 'Back in Stock!';
      case 'low-stock': return 'Stock Alert!';
      default: return 'Notification';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
};
