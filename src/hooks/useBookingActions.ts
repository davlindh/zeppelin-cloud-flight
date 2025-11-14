import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ProposedTime } from '@/types/services';

export const useBookingActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const acceptBooking = useMutation({
    mutationFn: async ({ bookingId, message }: { bookingId: string; message?: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          provider_response: message || 'Booking confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Confirmed',
        description: 'The booking has been confirmed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: (error) => {
      console.error('Error accepting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const rejectBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'rejected',
          provider_response: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Rejected',
        description: 'The booking has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: (error) => {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const proposeAlternativeTime = useMutation({
    mutationFn: async ({
      bookingId,
      times,
      message,
    }: {
      bookingId: string;
      times: ProposedTime[];
      message?: string;
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'pending_provider' as any,
          proposed_times: times as any,
          provider_response: message || 'Alternative times proposed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Alternative Times Proposed',
        description: 'Your alternative time suggestions have been sent to the customer.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: (error) => {
      console.error('Error proposing alternative time:', error);
      toast({
        title: 'Error',
        description: 'Failed to propose alternative times. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addProviderNotes = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          provider_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Notes Saved',
        description: 'Your notes have been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: (error) => {
      console.error('Error adding provider notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    acceptBooking: acceptBooking.mutateAsync,
    rejectBooking: rejectBooking.mutateAsync,
    proposeAlternativeTime: proposeAlternativeTime.mutateAsync,
    addProviderNotes: addProviderNotes.mutateAsync,
    isAccepting: acceptBooking.isPending,
    isRejecting: rejectBooking.isPending,
    isProposing: proposeAlternativeTime.isPending,
    isSavingNotes: addProviderNotes.isPending,
  };
};
