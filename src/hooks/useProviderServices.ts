import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ServiceExtended } from '@/types/services';

interface UseProviderServicesOptions {
  providerId?: string;
  status?: 'active' | 'draft';
  eventId?: string;
  tags?: string[];
}

export const useProviderServices = (options: UseProviderServicesOptions = {}) => {
  const { providerId, status, eventId, tags } = options;

  return useQuery({
    queryKey: ['provider-services', providerId, status, eventId, tags],
    queryFn: async (): Promise<ServiceExtended[]> => {
      console.log('🔍 Fetching provider services with options:', options);

      let query = supabase
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
        .order('created_at', { ascending: false });

      // Filter by provider
      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      // Filter by availability status
      if (status === 'active') {
        query = query.eq('available', true);
      } else if (status === 'draft') {
        query = query.eq('available', false);
      }

      // Filter by event availability
      if (eventId) {
        query = query.contains('event_availability', [{ event_id: eventId }]);
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching provider services:', error);
        throw error;
      }

      console.log('✅ Fetched provider services:', data?.length);
      return (data || []) as any as ServiceExtended[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
