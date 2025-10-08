import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database['public']['Enums']['order_status'];

interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      notes,
      trackingNumber,
      trackingUrl,
      carrier
    }: UpdateOrderStatusInput) => {
      const updateData: any = { status };
      
      if (notes) {
        updateData.admin_notes = notes;
      }
      
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
      
      if (trackingUrl) {
        updateData.tracking_url = trackingUrl;
      }
      
      if (carrier) {
        updateData.carrier = carrier;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the order status.",
        variant: "destructive",
      });
    }
  });
};
