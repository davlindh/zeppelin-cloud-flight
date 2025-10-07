import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/unified';

import { getImageUrl } from '@/utils/marketplace/imageUtils';

interface ServiceProvider {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  response_time: string | null;
  completed_projects: number | null;
  created_at: string;
  updated_at: string;
  services?: Array<{
    id: string;
    title: string;
    category: string;
    starting_price: number;
    available: boolean;
    rating: number;
    reviews: number;
  }>;
}

export interface ProviderWithServices {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  specialties?: string[];
  certifications?: string[];
  responseTime?: string;
  completedProjects?: number;
  services: Service[];
  totalServices: number;
  categories: string[];
  created_at: string;
  updated_at: string;
}

const transformProviderData = (provider: ServiceProvider): ProviderWithServices => {
  // Transform services if they exist
  const services: Service[] = (provider.services ?? []).map(service => ({
    id: service.id,
    title: service.title,
    provider: provider.name,
    rating: service.rating,
    reviews: service.reviews,
    startingPrice: service.starting_price,
    duration: '1 hour', // Default duration
    category: service.category,
    location: provider.location,
    available: service.available,
    image: getImageUrl(null),
    description: ',
    features: [],
    images: [],
    providerDetails: {
      id: provider.id,
      name: provider.name,
      avatar: getImageUrl(provider.avatar),
      rating: provider.rating,
      reviews: provider.reviews,
      experience: provider.experience,
      location: provider.location,
      phone: provider.phone ?? '',
      email: provider.email ?? ',
      bio: provider.bio ?? '',
      specialties: provider.specialties ?? [],
      certifications: provider.certifications ?? [],
      responseTime: provider.response_time ?? '24 hours',
      completedProjects: provider.completed_projects ?? 0,
      portfolio: [],
      recentReviews: []
    },
    availableTimes: [],
    providerRating: provider.rating,
    responseTime: provider.response_time ?? '24 hours'
  }));

  // Extract unique categories
  const categories = [...new Set(services.map(service => service.category))];

  return {
    id: provider.id,
    name: provider.name,
    avatar: getImageUrl(provider.avatar),
    rating: provider.rating,
    reviews: provider.reviews,
    experience: provider.experience,
    location: provider.location,
    phone: provider.phone ?? ',
    email: provider.email ?? '',
    bio: provider.bio ?? ',
    specialties: provider.specialties ?? [],
    certifications: provider.certifications ?? [],
    responseTime: provider.response_time ?? '24 hours',
    completedProjects: provider.completed_projects ?? 0,
    services,
    totalServices: services.length,
    categories,
    created_at: provider.created_at,
    updated_at: provider.updated_at
  };
};

export const useServiceProviders = (filters?: {
  location?: string;
  category?: string;
  minRating?: number;
}) => {
  return useQuery({
    queryKey: ['service-providers', filters],
    queryFn: async (): Promise<ProviderWithServices[]> => {
      console.log('🔍 useServiceProviders: Fetching providers from database with filters:', filters);
      
      try {
        let query = supabase
          .from('service_providers')
          .select(`
            *,
            services (
              id,
              title,
              category,
              starting_price,
              available,
              rating,
              reviews
            )
          `)
          .order('rating', { ascending: false });

        // Apply filters
        if (filters?.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters?.minRating) {
          query = query.gte('rating', filters.minRating);
        }

        const { data: providersData, error } = await query;

        if (error) {
          console.error('Error fetching service providers:', error);
          throw error;
        }

        console.log('🔍 useServiceProviders: Fetched providers from database:', {
          count: providersData?.length ?? 0,
          filters,
          sampleProviders: providersData?.slice(0, 2).map(p => ({ id: p.id, name: p.name, services: p.services?.length ?? 0 }))
        });

        if (!providersData || providersData.length === 0) {
          console.warn('🔍 useServiceProviders: No providers found in database for filters:', filters);
          return [];
        }

        let transformedProviders = providersData.map(transformProviderData);

        // Filter by category if specified (must be done after transform since category comes from services)
        if (filters?.category && filters.category !== 'all') {
          transformedProviders = transformedProviders.filter(provider => 
            provider.categories.includes(filters.category!)
          );
        }

        console.log('🔍 useServiceProviders: Transformed providers:', {
          count: transformedProviders.length,
          sampleTransformed: transformedProviders.slice(0, 2).map(p => ({ 
            id: p.id, 
            name: p.name, 
            totalServices: p.totalServices,
            categories: p.categories 
          }))
        });
        
        return transformedProviders;
      } catch (error) {
        console.error('Failed to fetch service providers:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useServiceProvider = (id: string) => {
  return useQuery({
    queryKey: ['service-provider', id],
    queryFn: async (): Promise<ProviderWithServices | null> => {
      console.log('Fetching single service provider:', id);
      
      try {
        const { data: providerData, error } = await supabase
          .from('service_providers')
          .select(`
            *,
            services (
              id,
              title,
              category,
              starting_price,
              available,
              rating,
              reviews,
              description,
              duration,
              image,
              images,
              features,
              available_times,
              response_time
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching service provider:', error);
          throw error;
        }

        if (!providerData) {
          console.warn('Service provider not found:', id);
          return null;
        }

        return transformProviderData(providerData);
      } catch (error) {
        console.error('Failed to fetch service provider:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useServiceProviderByName = (providerName: string) => {
  return useQuery({
    queryKey: ['service-provider-by-name', providerName],
    queryFn: async (): Promise<ProviderWithServices | null> => {
      console.log('Fetching service provider by name:', providerName);
      
      try {
        const { data: providerData, error } = await supabase
          .from('service_providers')
          .select(`
            *,
            services (
              id,
              title,
              category,
              starting_price,
              available,
              rating,
              reviews,
              description,
              duration,
              image,
              images,
              features,
              available_times,
              response_time
            )
          `)
          .ilike('name', providerName)
          .single();

        if (error) {
          console.error('Error fetching service provider by name:', error);
          throw error;
        }

        if (!providerData) {
          console.warn('Service provider not found by name:', providerName);
          return null;
        }

        return transformProviderData(providerData);
      } catch (error) {
        console.error('Failed to fetch service provider by name:', error);
        return null;
      }
    },
    enabled: !!providerName,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
