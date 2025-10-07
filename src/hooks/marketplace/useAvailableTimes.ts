
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseAvailableTimesParams {
  serviceId: string;
  selectedDate: string;
}

export const useAvailableTimes = ({ serviceId, selectedDate }: UseAvailableTimesParams) => {
  return useQuery({
    queryKey: ['available-times', serviceId, selectedDate],
    queryFn: async (): Promise<string[]> => {
      if (!serviceId || !selectedDate) {
        return [];
      }

      console.log('Fetching available times for:', { serviceId, selectedDate });
      
      try {
        const { data, error } = await supabase.rpc('get_available_times', {
          service_uuid: serviceId,
          selected_date: selectedDate
        });

        if (error) {
          console.error('Error fetching available times:', error);
          throw error;
        }

        console.log('Available times:', data);
        return data || [];
      } catch (error) {
        console.error('Failed to fetch available times:', error);
        return [];
      }
    },
    enabled: !!serviceId && !!selectedDate,
    staleTime: 1 * 60 * 1000, // 1 minute - times can change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};
