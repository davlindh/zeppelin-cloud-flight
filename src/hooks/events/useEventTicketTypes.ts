import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EventTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  badge?: string;
  price: number;
  original_price?: number;
  currency: string;
  capacity: number;
  per_user_limit?: number;
  sales_start?: string;
  sales_end?: string;
  is_active: boolean;
  requires_approval: boolean;
  is_visible_public: boolean;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TicketAvailability extends EventTicketType {
  sold: number;
  remaining: number;
  pending_orders: number;
}

export interface TicketSalesStats {
  total_revenue: number;
  total_sold: number;
  total_capacity: number;
  total_remaining: number;
  average_price: number;
  tickets: Array<{
    ticket_type_id: string;
    name: string;
    price: number;
    sold: number;
    remaining: number;
    revenue: number;
  }>;
}

/**
 * Fetch event ticket types with real-time availability
 * Uses the event_ticket_availability view which computes sold/remaining from orders
 */
export function useEventTicketTypes(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-ticket-types', eventId],
    queryFn: async (): Promise<TicketAvailability[]> => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_ticket_availability')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching ticket types:', error);
        throw error;
      }
      
      // Map ticket_type_id to id for consistency
      return (data || []).map(item => ({
        ...item,
        id: item.ticket_type_id,
      })) as TicketAvailability[];
    },
    enabled: !!eventId,
    staleTime: 30_000, // Cache for 30 seconds
  });
}

/**
 * Calculate sales statistics for event tickets
 */
export function useTicketSalesStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-ticket-sales-stats', eventId],
    queryFn: async (): Promise<TicketSalesStats> => {
      if (!eventId) {
        return {
          total_revenue: 0,
          total_sold: 0,
          total_capacity: 0,
          total_remaining: 0,
          average_price: 0,
          tickets: [],
        };
      }
      
      const { data, error } = await supabase
        .from('event_ticket_availability')
        .select('*')
        .eq('event_id', eventId);
      
      if (error) {
        console.error('Error fetching ticket stats:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return {
          total_revenue: 0,
          total_sold: 0,
          total_capacity: 0,
          total_remaining: 0,
          average_price: 0,
          tickets: [],
        };
      }
      
      const total_sold = data.reduce((sum, t) => sum + (t.sold || 0), 0);
      const total_revenue = data.reduce((sum, t) => sum + ((t.sold || 0) * t.price), 0);
      const total_capacity = data.reduce((sum, t) => sum + t.capacity, 0);
      const total_remaining = data.reduce((sum, t) => sum + (t.remaining || 0), 0);
      
      return {
        total_revenue,
        total_sold,
        total_capacity,
        total_remaining,
        average_price: total_sold > 0 ? total_revenue / total_sold : 0,
        tickets: data.map(t => ({
          ticket_type_id: t.ticket_type_id,
          name: t.name,
          price: t.price,
          sold: t.sold || 0,
          remaining: t.remaining || 0,
          revenue: (t.sold || 0) * t.price,
        })),
      };
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}

/**
 * Create a new ticket type for an event
 */
export function useCreateTicketType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<EventTicketType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('event_ticket_types')
        .insert({
          event_id: data.event_id,
          name: data.name,
          description: data.description,
          badge: data.badge,
          price: data.price,
          original_price: data.original_price,
          currency: data.currency || 'SEK',
          capacity: data.capacity,
          per_user_limit: data.per_user_limit,
          sales_start: data.sales_start,
          sales_end: data.sales_end,
          is_active: data.is_active,
          requires_approval: data.requires_approval,
          is_visible_public: data.is_visible_public,
          sort_order: data.sort_order,
          metadata: data.metadata || {},
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating ticket type:', error);
        throw error;
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.event_id] });
      toast.success('Ticket type created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create ticket type:', error);
      toast.error('Failed to create ticket type');
    },
  });
}

/**
 * Update an existing ticket type
 */
export function useUpdateTicketType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EventTicketType> & { id: string }) => {
      const updateData: Record<string, any> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.badge !== undefined) updateData.badge = data.badge;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.original_price !== undefined) updateData.original_price = data.original_price;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.per_user_limit !== undefined) updateData.per_user_limit = data.per_user_limit;
      if (data.sales_start !== undefined) updateData.sales_start = data.sales_start;
      if (data.sales_end !== undefined) updateData.sales_end = data.sales_end;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.requires_approval !== undefined) updateData.requires_approval = data.requires_approval;
      if (data.is_visible_public !== undefined) updateData.is_visible_public = data.is_visible_public;
      if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      
      const { data: result, error } = await supabase
        .from('event_ticket_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating ticket type:', error);
        throw error;
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.event_id] });
      toast.success('Ticket type updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update ticket type:', error);
      toast.error('Failed to update ticket type');
    },
  });
}

/**
 * Delete a ticket type
 */
export function useDeleteTicketType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      // First check if there are any orders for this ticket type
      const { data: orders, error: ordersError } = await supabase
        .from('event_ticket_orders')
        .select('id')
        .eq('ticket_type_id', id)
        .eq('status', 'confirmed')
        .limit(1);
      
      if (ordersError) {
        console.error('Error checking orders:', ordersError);
        throw ordersError;
      }
      
      if (orders && orders.length > 0) {
        throw new Error('Cannot delete ticket type with confirmed orders. Deactivate it instead.');
      }
      
      const { error } = await supabase
        .from('event_ticket_types')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting ticket type:', error);
        throw error;
      }
      
      return { id, eventId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['event-ticket-types', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket-sales-stats', result.eventId] });
      toast.success('Ticket type deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete ticket type:', error);
      toast.error(error.message || 'Failed to delete ticket type');
    },
  });
}
