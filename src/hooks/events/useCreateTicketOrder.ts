import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketOrderParams {
  ticketTypeId: string;
  quantity: number;
}

export const useCreateTicketOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketTypeId, quantity }: CreateTicketOrderParams) => {
      const { data, error } = await supabase.rpc('create_event_ticket_order', {
        p_ticket_type_id: ticketTypeId,
        p_quantity: quantity,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Order Created',
        description: 'Your ticket order has been created. Please proceed to payment.',
      });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-orders'] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-availability'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message,
      });
    },
  });
};
