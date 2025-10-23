import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { z } from 'zod';

export interface GuestOrderLookupData {
  orderNumber: string;
  email: string;
}

// Basic schemas for validation
const orderNumberSchema = z.string()
  .min(1, 'Order number is required')
  .regex(/^ORD-\d{4}-\d{4}$/, 'Invalid order number format (ORD-YYYY-NNNN)');

const emailSchema = z.string().email('Valid email address is required');

// Schema for guest order lookup
const guestOrderLookupSchema = z.object({
  orderNumber: orderNumberSchema,
  email: emailSchema
});

export interface OrderWithItems {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  billing_address: any;
  order_items: Array<{
    id: string;
    item_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// Query for retrieving an order by order number and email
export const useOrderLookup = (orderNumber?: string, email?: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['guest-order', orderNumber, email],
    queryFn: async (): Promise<OrderWithItems | null> => {
      if (!orderNumber || !email) {
        throw new Error('Order number and email are required');
      }

      // Validate input
      guestOrderLookupSchema.parse({ orderNumber, email });

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            item_title,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('order_number', orderNumber)
        .eq('customer_email', email)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: enabled && !!orderNumber && !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes - order data doesn't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication/validation errors
      if (error?.code === 'PGRST116' || failureCount >= 2) {
        return false;
      }
      return true;
    },
  });
};

// Utility function for validating guest order access
export const validateGuestAccess = (order: OrderWithItems | null, orderNumber: string, email: string): {
  hasAccess: boolean;
  error: string | null;
} => {
  if (!order) {
    return {
      hasAccess: false,
      error: 'Order not found. Please check your order number and email address.'
    };
  }

  // Check if the email matches the order's customer email
  if (order.customer_email?.toLowerCase() !== email.toLowerCase()) {
    return {
      hasAccess: false,
      error: 'Email address does not match the order.'
    };
  }

  // Check if the order number matches
  if (order.order_number !== orderNumber) {
    return {
      hasAccess: false,
      error: 'Order number mismatch.'
    };
  }

  return { hasAccess: true, error: null };
};

// Generate a secure token for order access (for future use)
export const generateOrderAccessToken = async (orderId: string, email: string): Promise<string> => {
  // This could be implemented to create a temporary access token
  // stored in a session table, but for now we'll rely on email+order_number lookup
  const token = btoa(`${orderId}:${email}:${Date.now()}`);
  console.warn('Order access token generated:', token);
  return token;
};

/**
 * Hook for managing guest user order access and lookup
 */
export const useGuestOrder = () => {
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  // Mutation for order updates (future use - cancellation, etc.)
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-order'] });
    },
    onError: (error) => {
      handleError(new Error('Failed to update order'));
    }
  });

  return {
    useOrderLookup,
    updateOrderMutation,
    validateGuestAccess,
    generateOrderAccessToken
  };
};
