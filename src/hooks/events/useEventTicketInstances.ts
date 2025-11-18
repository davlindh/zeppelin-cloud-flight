import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TicketInstance {
  id: string;
  ticket_order_id: string;
  event_id: string;
  ticket_type_id: string;
  holder_name: string | null;
  holder_email: string | null;
  qr_code: string | null;
  status: 'valid' | 'checked_in' | 'void';
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  ticket_type?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  event?: {
    id: string;
    title: string;
    starts_at: string;
    venue: string | null;
  };
}

interface TicketInstanceWithDetails extends TicketInstance {
  order?: {
    id: string;
    user_id: string | null;
    quantity: number;
    status: string;
  };
}

export const useEventTicketInstances = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-ticket-instances', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_ticket_instances')
        .select(`
          *,
          ticket_type:event_ticket_types(id, name, price, currency),
          event:events(id, title, starts_at, venue)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketInstance[];
    },
  });
};

export const useMyTicketInstances = () => {
  return useQuery({
    queryKey: ['my-ticket-instances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('event_ticket_instances')
        .select(`
          *,
          ticket_type:event_ticket_types(id, name, price, currency),
          event:events(id, title, starts_at, venue, slug),
          order:event_ticket_orders!inner(id, user_id, quantity, status)
        `)
        .eq('order.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketInstanceWithDetails[];
    },
  });
};

export const useCheckInTicket = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCode: string) => {
      const { data, error } = await supabase.rpc('check_in_ticket_by_qr', {
        p_qr_code: qrCode,
      });

      if (error) throw error;
      return data as {
        success: boolean;
        ticket_instance: any;
        event_title: string;
        ticket_type_name: string;
        holder_name: string | null;
        checked_in_at: string;
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Check-in Successful',
        description: `Ticket checked in at ${new Date(data.checked_in_at).toLocaleTimeString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-instances'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: error.message,
      });
    },
  });
};

export const useVoidTicketInstance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .from('event_ticket_instances')
        .update({ status: 'void' })
        .eq('id', instanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Ticket Voided',
        description: 'The ticket has been marked as void',
      });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-instances'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
};
