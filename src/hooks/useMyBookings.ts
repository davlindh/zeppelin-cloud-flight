import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingExtended } from '@/types/services';

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async (): Promise<BookingExtended[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for my bookings');
        return [];
      }

      console.log('🔍 Fetching bookings for user:', user.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            title,
            starting_price,
            duration,
            provider,
            provider_id
          )
        `)
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my bookings:', error);
        throw error;
      }

      console.log('✅ Fetched my bookings:', data?.length);
      return (data || []) as any as BookingExtended[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
