import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateBookingData {
  id: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_message?: string;
  selected_date?: string;
  selected_time?: string;
  customizations?: any;
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateBookingData) => {
      const { id, ...updateData } = data;
      
      const { data: booking, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      return booking;
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Updated",
        description: `Booking ${data.id} has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
    },
    onError: (error) => {
      console.error('Booking update failed:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }

      return bookingId;
    },
    onSuccess: (bookingId) => {
      toast({
        title: "Booking Deleted",
        description: "The booking has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.removeQueries({ queryKey: ['booking', bookingId] });
    },
    onError: (error) => {
      console.error('Booking deletion failed:', error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};