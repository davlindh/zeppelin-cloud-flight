import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/unified';
import { transformDatabaseService } from '@/utils/serviceTransforms';

interface ServiceFilters {
  category?: string;
  search?: string;
  available?: boolean;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any; // Allow additional properties
}

export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async (): Promise<Service[]> => {
      console.log('🔍 useServices: Fetching services from database with filters:', filters);
      
      try {
        let query = supabase
          .from('services')
          .select(`
            *,
            service_providers!provider_id (
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

        // Apply filters
        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters?.available !== undefined) {
          query = query.eq('available', filters.available);
        }

        if (filters?.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters?.minPrice) {
          query = query.gte('starting_price', filters.minPrice);
        }

        if (filters?.maxPrice) {
          query = query.lte('starting_price', filters.maxPrice);
        }

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          query = query.or([
            `title.ilike.%${searchTerm}%`,
            `description.ilike.%${searchTerm}%`,
            `provider.ilike.%${searchTerm}%`,
            `category.ilike.%${searchTerm}%`
          ].join(','));
        }

        const { data: servicesData, error } = await query;

        if (error) {
          console.error('Error fetching services:', error);
          throw error;
        }

        console.log('🔍 useServices: Fetched services from database:', {
          count: servicesData?.length ?? 0,
          filters,
          sampleServices: servicesData?.slice(0, 2).map(s => ({ id: s.id, title: s.title, provider: s.provider }))
        });

        if (!servicesData || servicesData.length === 0) {
          console.warn('🔍 useServices: No services found in database for filters:', filters);
          return [];
        }

        const transformedServices = servicesData.map(transformDatabaseService);
        console.log('🔍 useServices: Transformed services:', {
          count: transformedServices.length,
          sampleTransformed: transformedServices.slice(0, 2).map(s => ({ id: s.id, title: s.title, provider: s.provider }))
        });
        
        return transformedServices;
      } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes 
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export type { ServiceFilters };

