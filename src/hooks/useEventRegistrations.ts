import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventRegistrationWithUser } from "@/types/events";

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ["event-registrations", eventId],
    queryFn: async (): Promise<EventRegistrationWithUser[]> => {
      // Fetch registrations without user join (no FK relationship exists)
      const { data: registrations, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no registrations or no user_ids, return early
      if (!registrations || registrations.length === 0) {
        return [];
      }

      // Fetch user data separately for registrations that have user_id
      const userIds = registrations
        .map((r) => r.user_id)
        .filter((id): id is string => !!id);

      if (userIds.length === 0) {
        return registrations.map((reg) => ({
          ...reg,
          user: undefined,
        })) as EventRegistrationWithUser[];
      }

      // Fetch users from auth.users via RPC or public.users if it exists
      // For now, return without user data since FK doesn't exist
      // TODO: Add foreign key relationship or fetch from correct users table
      return registrations.map((reg) => ({
        ...reg,
        user: undefined,
      })) as EventRegistrationWithUser[];
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}
