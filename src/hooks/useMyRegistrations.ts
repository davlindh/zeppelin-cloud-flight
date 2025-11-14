import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthenticatedUser } from "./useAuthenticatedUser";
import type { EventRegistration } from "@/types/events";

export function useMyRegistrations() {
  const { data: user } = useAuthenticatedUser();

  return useQuery({
    queryKey: ["my-event-registrations", user?.id],
    queryFn: async (): Promise<EventRegistration[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as EventRegistration[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}
