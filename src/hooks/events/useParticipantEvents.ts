import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ParticipantEvent {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at: string;
  venue?: string;
  location?: string;
  role: 'attendee' | 'organizer';
  ticket_count: number;
  ticket_status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
}

/**
 * Fetch events associated with a participant (by auth_user_id)
 * Returns both ticket purchases and event registrations
 */
export function useParticipantEvents(authUserId?: string) {
  return useQuery({
    queryKey: ['participant-events', authUserId],
    queryFn: async (): Promise<ParticipantEvent[]> => {
      if (!authUserId) return [];
      
      // Fetch ticket orders with event details
      const { data: tickets, error: ticketError } = await supabase
        .from('event_ticket_orders')
        .select(`
          id,
          event_id,
          quantity,
          status,
          event:events (
            id,
            title,
            slug,
            starts_at,
            ends_at,
            venue,
            location
          )
        `)
        .eq('user_id', authUserId)
        .in('status', ['pending', 'confirmed']);
      
      if (ticketError) {
        console.error('Error fetching participant ticket orders:', ticketError);
        throw ticketError;
      }
      
      // Fetch registrations with event details
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          event_id,
          status,
          event:events (
            id,
            title,
            slug,
            starts_at,
            ends_at,
            venue,
            location,
            created_by
          )
        `)
        .eq('user_id', authUserId)
        .in('status', ['pending', 'confirmed']);
      
      if (regError) {
        console.error('Error fetching participant registrations:', regError);
        throw regError;
      }
      
      // Process tickets
      const ticketEvents = (tickets || []).map((ticket: any) => ({
        id: ticket.id,
        event_id: ticket.event_id,
        title: ticket.event?.title || 'Unknown Event',
        slug: ticket.event?.slug || '',
        starts_at: ticket.event?.starts_at || '',
        ends_at: ticket.event?.ends_at || '',
        venue: ticket.event?.venue,
        location: ticket.event?.location,
        role: 'attendee' as const,
        ticket_count: ticket.quantity || 0,
        ticket_status: ticket.status,
      }));
      
      // Process registrations
      const registrationEvents = (registrations || []).map((reg: any) => ({
        id: reg.id,
        event_id: reg.event_id,
        title: reg.event?.title || 'Unknown Event',
        slug: reg.event?.slug || '',
        starts_at: reg.event?.starts_at || '',
        ends_at: reg.event?.ends_at || '',
        venue: reg.event?.venue,
        location: reg.event?.location,
        role: reg.event?.created_by === authUserId ? 'organizer' as const : 'attendee' as const,
        ticket_count: 1,
        ticket_status: (reg.status === 'confirmed' ? 'confirmed' : 'pending') as 'pending' | 'confirmed' | 'cancelled' | 'refunded',
      }));
      
      // Merge and dedupe by event_id
      const allEvents = [...ticketEvents, ...registrationEvents];
      const eventMap = new Map<string, ParticipantEvent>();
      
      allEvents.forEach(event => {
        if (!eventMap.has(event.event_id)) {
          eventMap.set(event.event_id, event);
        } else {
          // If already exists, sum ticket counts and prioritize confirmed status
          const existing = eventMap.get(event.event_id)!;
          existing.ticket_count += event.ticket_count;
          if (event.ticket_status === 'confirmed') {
            existing.ticket_status = 'confirmed';
          }
          if (event.role === 'organizer') {
            existing.role = 'organizer';
          }
        }
      });
      
      // Sort by starts_at (upcoming first)
      return Array.from(eventMap.values()).sort((a, b) => 
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
    },
    enabled: !!authUserId,
    staleTime: 30_000,
  });
}
