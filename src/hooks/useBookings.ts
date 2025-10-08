
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingData, ServiceForBooking } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

interface DatabaseBooking {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
  selected_date: string;
  selected_time: string;
  customizations: any; // Changed from Record<string, any> to any to handle Json type
  agreed_to_terms: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  services?: {
    title: string;
    starting_price: number;
    duration: string;
    provider: string;
  };
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingData: {
      service: ServiceForBooking;
      booking: BookingData;
    }) => {
      console.log('Creating booking:', bookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          service_id: bookingData.service.id,
          customer_name: bookingData.booking.contactInfo.name,
          customer_email: bookingData.booking.contactInfo.email,
          customer_phone: bookingData.booking.contactInfo.phone,
          customer_message: bookingData.booking.contactInfo.message,
          selected_date: bookingData.booking.selectedDate,
          selected_time: bookingData.booking.selectedTime,
          customizations: bookingData.booking.customizations,
          agreed_to_terms: bookingData.booking.agreedToTerms,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been sent to the provider. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      console.error('Booking submission failed:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useBookings = (customerEmail?: string) => {
  return useQuery({
    queryKey: ['bookings', customerEmail],
    queryFn: async (): Promise<DatabaseBooking[]> => {
      console.log('Fetching bookings for customer:', customerEmail);
      
      try {
        let query = supabase
          .from('bookings')
          .select(`
            *,
            services (
              title,
              starting_price,
              duration,
              provider
            )
          `)
          .order('created_at', { ascending: false });

        if (customerEmail) {
          query = query.eq('customer_email', customerEmail);
        }

        const { data: bookingsData, error } = await query;

        if (error) {
          console.error('Error fetching bookings:', error);
          throw error;
        }

        console.log('Fetched bookings from database:', bookingsData);
        // Type assertion after validating the data structure
        return (bookingsData ?? []) as DatabaseBooking[];
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
      }
    },
    enabled: true, // Always enabled for admin, conditional for customer
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async (): Promise<DatabaseBooking | null> => {
      console.log('Fetching single booking:', id);
      
      try {
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services (
              title,
              starting_price,
              duration,
              provider
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
          throw error;
        }

        if (!bookingData) {
          console.warn('Booking not found:', id);
          return null;
        }

        // Type assertion after validating the data structure
        return bookingData as DatabaseBooking;
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};
