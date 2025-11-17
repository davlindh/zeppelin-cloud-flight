import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event, EventStatus } from "@/types/events";

interface AdminEventFilters {
  status?: EventStatus[];
  dateRange?: { start: string; end: string };
  includePast?: boolean;
}

export interface EventWithStats extends Event {
  registration_count?: number;
  confirmed_count?: number;
  pending_count?: number;
  waitlist_count?: number;
}

export const useAdminEvents = (filters?: AdminEventFilters) => {
  return useQuery<EventWithStats[]>({
    queryKey: ["admin-events", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          event_registrations(
            id,
            status
          )
        `)
        .order("starts_at", { ascending: true });

      // Apply filters only if explicitly provided
      if (filters?.status?.length) {
        query = query.in("status", filters.status);
      }

      if (!filters?.includePast) {
        query = query.gte("starts_at", new Date().toISOString());
      }

      if (filters?.dateRange) {
        query = query
          .gte("starts_at", filters.dateRange.start)
          .lte("starts_at", filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate aggregated stats for each event
      const eventsWithStats: EventWithStats[] = (data || []).map((event: any) => {
        const registrations = event.event_registrations || [];
        const registration_count = registrations.length;
        const confirmed_count = registrations.filter((r: any) => r.status === "confirmed").length;
        const pending_count = registrations.filter((r: any) => r.status === "pending").length;
        const waitlist_count = registrations.filter((r: any) => r.status === "waitlist").length;

        // Remove the nested registrations from the response
        const { event_registrations, ...eventData } = event;

        return {
          ...eventData,
          registration_count,
          confirmed_count,
          pending_count,
          waitlist_count,
        };
      });

      return eventsWithStats;
    },
    staleTime: 30_000, // 30 seconds
  });
};
