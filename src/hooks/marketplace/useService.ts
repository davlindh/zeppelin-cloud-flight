
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/unified';
import { transformDatabaseService } from '@/utils/marketplace/serviceTransforms';

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async (): Promise<Service | null> => {
      console.log('Fetching single service:', id);
      
      try {
        // Check if the id is a UUID or a slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        let query = supabase
          .from('services')
          .select(`
            *,
            service_providers:provider_id (
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
          `);

        if (isUUID) {
          query = query.eq('id', id);
        } else {
          // Try to fetch by slug
          query = query.eq('slug', id);
        }

        const { data: serviceData, error } = await query.maybeSingle();

        if (error) {
          console.error('Error fetching service:', error);
          throw error;
        }

        if (!serviceData) {
          console.warn('Service not found:', id);
          return null;
        }

        console.log('Raw service data from database:', serviceData);
        
        // Type assertion to handle Supabase's response structure
        const typedServiceData = serviceData as any;
        return transformDatabaseService(typedServiceData);
      } catch (error) {
        console.error('Failed to fetch service:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
