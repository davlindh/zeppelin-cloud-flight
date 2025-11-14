import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event, EventStatus } from "@/types/events";

interface UseEventsOptions {
  status?: EventStatus;
  includePast?: boolean;
}

export function useEvents(options?: UseEventsOptions) {
  return useQuery({
    queryKey: ["events", options],
    queryFn: async (): Promise<Event[]> => {
      let query = supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (!options?.includePast) {
        query = query.gte("starts_at", new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Event[];
    },
    staleTime: 60_000,
  });
}
