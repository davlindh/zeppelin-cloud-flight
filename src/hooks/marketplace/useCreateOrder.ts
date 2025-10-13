import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type OrderItemType = Database['public']['Enums']['order_item_type'];

export interface OrderItem {
  type: OrderItemType;
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  variantId?: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderInput {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount?: number;
  totalAmount: number;
  shippingAddress: Record<string, any>;
  billingAddress?: Record<string, any>;
  notes?: string;
  items: OrderItem[];
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_email: orderData.customerEmail,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          subtotal: orderData.subtotal,
          tax_amount: orderData.taxAmount,
          shipping_amount: orderData.shippingAmount,
          discount_amount: orderData.discountAmount || 0,
          total_amount: orderData.totalAmount,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          customer_notes: orderData.notes,
        } as any])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // 2. Create order items
      const itemsToInsert = orderData.items.map(item => ({
        order_id: order.id,
        item_type: item.type,
        item_id: item.id,
        item_title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
        variant_id: item.variantId,
        metadata: item.metadata,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
      
      return order;
    },
    onSuccess: (order) => {
      toast({
        title: "Order Created",
        description: `Order ${order.order_number} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
    }
  });
};
