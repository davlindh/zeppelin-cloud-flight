import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ServiceExtended } from '@/types/services';

export const useServicesByEvent = (eventId: string, enabled = true) => {
  return useQuery({
    queryKey: ['services-by-event', eventId],
    queryFn: async (): Promise<ServiceExtended[]> => {
      console.log('🔍 Fetching services for event:', eventId);

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_providers!services_provider_id_fkey (
            id,
            name,
            avatar,
            rating,
            reviews,
            experience,
            location,
            phone,
            email,
            bio,
            specialties,
            certifications,
            response_time,
            completed_projects
          )
        `)
        .eq('available', true)
        .or(`event_availability.cs.[{"event_id":"${eventId}","available":true}]`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services by event:', error);
        throw error;
      }

      console.log('✅ Fetched services for event:', data?.length);
      return (data || []) as any as ServiceExtended[];
    },
    enabled: enabled && !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
