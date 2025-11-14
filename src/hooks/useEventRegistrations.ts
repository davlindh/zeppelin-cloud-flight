import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventRegistrationWithUser } from "@/types/events";

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ["event-registrations", eventId],
    queryFn: async (): Promise<EventRegistrationWithUser[]> => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data ?? []).map((reg: any) => ({
        ...reg,
        user: reg.user ? {
          id: reg.user.id,
          email: reg.user.email,
          full_name: reg.user.full_name,
        } : undefined,
      })) as EventRegistrationWithUser[];
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}
