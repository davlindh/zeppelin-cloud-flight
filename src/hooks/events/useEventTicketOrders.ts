import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EventTicketOrder {
  id: string;
  event_id: string;
  ticket_type_id: string;
  user_id?: string;
  quantity: number;
  unit_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  order_id?: string;
  registration_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EventTicketOrderWithDetails extends EventTicketOrder {
  ticket_type?: {
    name: string;
    event_id: string;
  };
  user?: {
    email?: string;
    id: string;
  };
  event?: {
    title: string;
    slug: string;
    starts_at: string;
  };
}

/**
 * Fetch all ticket orders for a specific event
 */
export function useEventTicketOrders(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-ticket-orders', eventId],
    queryFn: async (): Promise<EventTicketOrderWithDetails[]> => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_ticket_orders')
        .select(`
          *,
          ticket_type:event_ticket_types(name, event_id),
          event:events(title, slug, starts_at)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ticket orders:', error);
        throw error;
      }
      
      return (data || []) as EventTicketOrderWithDetails[];
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}

/**
 * Fetch ticket orders for a specific ticket type
 */
export function useTicketTypeOrders(ticketTypeId: string | undefined) {
  return useQuery({
    queryKey: ['ticket-type-orders', ticketTypeId],
    queryFn: async (): Promise<EventTicketOrderWithDetails[]> => {
      if (!ticketTypeId) return [];
      
      const { data, error } = await supabase
        .from('event_ticket_orders')
        .select(`
          *,
          ticket_type:event_ticket_types(name, event_id)
        `)
        .eq('ticket_type_id', ticketTypeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ticket type orders:', error);
        throw error;
      }
      
      return (data || []) as EventTicketOrderWithDetails[];
    },
    enabled: !!ticketTypeId,
    staleTime: 30_000,
  });
}

/**
 * Fetch ticket orders for the current user
 */
export function useMyTicketOrders() {
  return useQuery({
    queryKey: ['my-ticket-orders'],
    queryFn: async (): Promise<EventTicketOrderWithDetails[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('event_ticket_orders')
        .select(`
          *,
          ticket_type:event_ticket_types(name, event_id),
          event:events(title, slug, starts_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching my ticket orders:', error);
        throw error;
      }
      
      return (data || []) as EventTicketOrderWithDetails[];
    },
    staleTime: 30_000,
  });
}

/**
 * Create a new ticket order (used during checkout)
 */
export function useCreateTicketOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      event_id: string;
      ticket_type_id: string;
      user_id?: string;
      quantity: number;
      unit_price: number;
      currency?: string;
      order_id?: string;
      status?: 'pending' | 'confirmed';
    }) => {
      const { data: result, error } = await supabase
        .from('event_ticket_orders')
        .insert({
          event_id: data.event_id,
          ticket_type_id: data.ticket_type_id,
          user_id: data.user_id,
          quantity: data.quantity,
          unit_price: data.unit_price,
          currency: data.currency || 'SEK',
          order_id: data.order_id,
          status: data.status || 'pending',
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating ticket order:', error);
        throw error;
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-orders', result.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.event_id] });
      queryClient.invalidateQueries({ queryKey: ['my-ticket-orders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create ticket order:', error);
      toast.error('Failed to create ticket order');
    },
  });
}

/**
 * Update ticket order status (e.g., pending -> confirmed after payment)
 */
export function useUpdateTicketOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status,
      eventId 
    }: { 
      id: string; 
      status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
      eventId: string;
    }) => {
      const { data, error } = await supabase
        .from('event_ticket_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating ticket order status:', error);
        throw error;
      }
      
      return { ...data, eventId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-orders', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-ticket-orders'] });
      toast.success('Ticket order status updated');
    },
    onError: (error: Error) => {
      console.error('Failed to update ticket order status:', error);
      toast.error('Failed to update ticket order status');
    },
  });
}

/**
 * Cancel a ticket order
 */
export function useCancelTicketOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { data, error } = await supabase
        .from('event_ticket_orders')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error cancelling ticket order:', error);
        throw error;
      }
      
      return { ...data, eventId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-orders', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-ticket-orders'] });
      toast.success('Ticket order cancelled');
    },
    onError: (error: Error) => {
      console.error('Failed to cancel ticket order:', error);
      toast.error('Failed to cancel ticket order');
    },
  });
}
