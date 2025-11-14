import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventStats } from "@/types/events";

export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: async (): Promise<EventStats> => {
      // Get event capacity
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("capacity")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      // Get all registrations
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("status, checked_in_at")
        .eq("event_id", eventId);

      if (regError) throw regError;

      const regs = registrations ?? [];
      const confirmed = regs.filter((r) => r.status === "confirmed");
      const checkedIn = confirmed.filter((r) => r.checked_in_at);

      return {
        total_capacity: event?.capacity ?? 0,
        total_registrations: regs.length,
        confirmed_count: confirmed.length,
        pending_count: regs.filter((r) => r.status === "pending").length,
        waitlisted_count: regs.filter((r) => r.status === "waitlist").length,
        cancelled_count: regs.filter((r) => r.status === "cancelled").length,
        checked_in_count: checkedIn.length,
        no_show_count: confirmed.length - checkedIn.length,
        available_spots: Math.max(0, (event?.capacity ?? 0) - confirmed.length),
      };
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}
