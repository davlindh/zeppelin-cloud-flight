import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EventRegistrationStatus } from "@/types/events";

export function useEventRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const register = useMutation({
    mutationFn: async ({
      eventId,
      userId,
      note,
    }: {
      eventId: string;
      userId: string;
      note?: string;
    }) => {
      const { data, error } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            status: "pending",
            note,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Registration submitted",
        description: "Your registration is pending confirmation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      registrationId,
      status,
    }: {
      registrationId: string;
      status: EventRegistrationStatus;
    }) => {
      const { data, error } = await supabase
        .from("event_registrations")
        .update({ status })
        .eq("id", registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Status updated",
        description: "Registration status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancel = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "cancelled" })
        .eq("id", registrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Registration cancelled",
        description: "You have cancelled your registration.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    register,
    updateStatus,
    cancel,
  };
}
