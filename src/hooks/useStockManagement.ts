import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StockItem {
  id: string;
  available: number;
  reserved: number;
  total: number;
  type: 'product' | 'ticket';
  productId?: string;
  ticketTypeId?: string;
}

interface StockUpdate {
  itemId: string;
  change: number;
  reason: 'purchase' | 'cancellation' | 'refund' | 'admin';
}

interface StockState {
  [itemId: string]: StockItem;
}

export const useStockManagement = () => {
  const [stock, setStock] = useState<StockState>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Subscribe to real-time stock updates
  useEffect(() => {
    const channel = supabase
      .channel('stock-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_levels',
        },
        (payload) => {
          const newStock = payload.new as StockItem;
          setStock(prev => ({
            ...prev,
            [newStock.id]: newStock
          }));
          
          // Show low stock alert if needed
          if (newStock.available <= 5 && newStock.available > 0) {
            toast({
              title: 'Low Stock Alert',
              description: `${newStock.available} items remaining`,
              variant: 'default',
            });
          }
          
          if (newStock.available === 0) {
            toast({
              title: 'Out of Stock',
              description: 'This item is now sold out',
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Load stock data for multiple items
  const loadStock = useCallback(async (itemIds: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_levels')
        .select('*')
        .in('id', itemIds);

      if (error) throw error;

      const stockData: StockState = {};
      data?.forEach(item => {
        stockData[item.id] = item;
      });

      setStock(prev => ({ ...prev, ...stockData }));
    } catch (error) {
      console.error('Failed to load stock data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update stock levels
  const updateStock = useCallback(async (updates: StockUpdate[]) => {
    setLoading(true);
    try {
      for (const update of updates) {
        const { error } = await supabase.rpc('update_stock_levels', {
          p_item_id: update.itemId,
          p_change: update.change,
          p_reason: update.reason,
          p_user_id: (await supabase.auth.getUser()).data.user?.id || null,
        });

        if (error) throw error;
      }

      // Optimistically update local state
      setStock(prev => {
        const updated = { ...prev };
        updates.forEach(update => {
          if (updated[update.itemId]) {
            updated[update.itemId] = {
              ...updated[update.itemId],
              available: Math.max(0, updated[update.itemId].available + update.change),
              reserved: updated[update.itemId].reserved + (update.reason === 'reservation' ? update.change : 0),
            };
          }
        });
        return updated;
      });

      toast({
        title: 'Success',
        description: 'Stock levels updated successfully',
      });
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock levels',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Check stock availability
  const checkStock = useCallback((itemId: string, requestedQuantity: number = 1): {
    available: boolean;
    availableQuantity: number;
    lowStock: boolean;
    outOfStock: boolean;
  } => {
    const itemStock = stock[itemId];
    if (!itemStock) {
      return {
        available: false,
        availableQuantity: 0,
        lowStock: false,
        outOfStock: true,
      };
    }

    const available = itemStock.available >= requestedQuantity;
    const lowStock = itemStock.available <= 5 && itemStock.available > 0;
    const outOfStock = itemStock.available === 0;

    return {
      available,
      availableQuantity: itemStock.available,
      lowStock,
      outOfStock,
    };
  }, [stock]);

  // Reserve stock for pending orders
  const reserveStock = useCallback(async (itemId: string, quantity: number) => {
    return updateStock([{
      itemId,
      change: -quantity,
      reason: 'reservation'
    }]);
  }, [updateStock]);

  // Release reserved stock
  const releaseStock = useCallback(async (itemId: string, quantity: number) => {
    return updateStock([{
      itemId,
      change: quantity,
      reason: 'cancellation'
    }]);
  }, [updateStock]);

  // Confirm sale (move from reserved to sold)
  const confirmSale = useCallback(async (itemId: string, quantity: number) => {
    const { error } = await supabase.rpc('confirm_stock_sale', {
      p_item_id: itemId,
      p_quantity: quantity,
      p_user_id: (await supabase.auth.getUser()).data.user?.id || null,
    });

    if (error) throw error;

    // Update local state
    setStock(prev => {
      if (prev[itemId]) {
        return {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            reserved: prev[itemId].reserved - quantity,
          }
        };
      }
      return prev;
    });
  }, []);

  return {
    stock,
    loading,
    loadStock,
    updateStock,
    checkStock,
    reserveStock,
    releaseStock,
    confirmSale,
  };
};
