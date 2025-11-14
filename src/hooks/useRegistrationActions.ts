import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EventRegistrationStatus } from "@/types/events";

export function useRegistrationActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateRegistrationStatus = useMutation({
    mutationFn: async ({
      registrationId,
      status,
    }: {
      registrationId: string;
      status: EventRegistrationStatus;
    }) => {
      const updates: any = { status };
      
      if (status === "confirmed") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = (await supabase.auth.getUser()).data.user?.id;
      } else if (status === "cancelled") {
        updates.cancelled_at = new Date().toISOString();
        updates.cancelled_by = (await supabase.auth.getUser()).data.user?.id;
      }

      const { data, error } = await supabase
        .from("event_registrations")
        .update(updates)
        .eq("id", registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["event-stats"] });
      queryClient.invalidateQueries({ queryKey: ["my-event-registrations"] });
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

  const toggleCheckIn = useMutation({
    mutationFn: async (registrationId: string) => {
      // First get current state
      const { data: current, error: fetchError } = await supabase
        .from("event_registrations")
        .select("checked_in_at")
        .eq("id", registrationId)
        .single();

      if (fetchError) throw fetchError;

      const newCheckedIn = current.checked_in_at ? null : new Date().toISOString();

      const { data, error } = await supabase
        .from("event_registrations")
        .update({ checked_in_at: newCheckedIn })
        .eq("id", registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["event-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({
      registrationIds,
      status,
    }: {
      registrationIds: string[];
      status: EventRegistrationStatus;
    }) => {
      const updates: any = { status };
      
      if (status === "confirmed") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      const promises = registrationIds.map((id) =>
        supabase
          .from("event_registrations")
          .update(updates)
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} registrations`);
      }

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["event-stats"] });
      toast({
        title: "Bulk update completed",
        description: `Updated ${variables.registrationIds.length} registrations to ${variables.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    updateRegistrationStatus,
    toggleCheckIn,
    bulkUpdateStatus,
  };
}
