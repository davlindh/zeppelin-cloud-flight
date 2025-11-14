import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from '@/utils/formUtils';
import type { Service } from '@/types/unified';

// Database service type and transformation function
interface DatabaseService {
  id: string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
  duration: string;
  location: string;
  available: boolean;
  image: string;
  images: string[];
  features: string[];
  provider: string;
  provider_id: string | null;
  rating: number;
  reviews: number;
  available_times: string[];
  response_time: string | null;
  provider_rating: number | null;
  created_at: string;
  updated_at: string;
}

const transformDatabaseService = (dbService: DatabaseService): Service => {
  // ⚠️ Log warning if no valid provider_id
  if (!dbService.provider_id) {
    console.warn(`⚠️ Service ${dbService.id} "${dbService.title}" has no valid provider_id`);
  }

  return {
    id: dbService.id,
    title: dbService.title,
    provider: dbService.provider,
    rating: dbService.rating,
    reviews: dbService.reviews,
    startingPrice: dbService.starting_price,
    duration: dbService.duration,
    category: dbService.category,
    location: dbService.location,
    available: dbService.available,
    image: dbService.image,
    description: dbService.description,
    features: dbService.features,
    images: dbService.images,
    providerDetails: {
      id: dbService.provider_id ?? '', // Use actual provider_id or empty string
      name: dbService.provider,
      avatar: '',
      rating: dbService.provider_rating ?? dbService.rating,
      reviews: dbService.reviews,
      experience: '0 years',
      location: dbService.location,
      phone: '',
      email: '',
      bio: '',
      specialties: [],
      certifications: [],
      responseTime: dbService.response_time ?? '24 hours',
      completedProjects: 0,
      portfolio: [],
      recentReviews: []
    },
    availableTimes: dbService.available_times,
    providerRating: dbService.provider_rating ?? dbService.rating,
    responseTime: dbService.response_time ?? '24 hours'
  };
};

interface CreateServiceData {
  title: string;
  description: string;
  category: string;
  starting_price: number;
  duration: string;
  location: string;
  image: string;
  images?: string[];
  features?: string[];
  provider: string;
  provider_id?: string;
  available_times?: string[];
  response_time?: string;
}

interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
  available?: boolean;
}

export const useServiceMutations = () => {
  const queryClient = useQueryClient();

  const createService = useMutation({
    mutationFn: async (serviceData: CreateServiceData): Promise<Service | null> => {
      console.log('Creating service:', serviceData);
      
      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          starting_price: serviceData.starting_price,
          duration: serviceData.duration,
          location: serviceData.location,
          image: serviceData.image,
          images: serviceData.images ?? [],
          features: serviceData.features ?? [],
          provider: serviceData.provider,
          provider_id: serviceData.provider_id || null,
          slug: generateSlug(serviceData.title),
          available: true,
          available_times: serviceData.available_times ?? [],
          response_time: serviceData.response_time || '24 hours',
          rating: 0,
          reviews: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }

      console.log('Service created successfully:', data);
      return transformDatabaseService(data as DatabaseService);
    },
    onSuccess: () => {
      // Invalidate services queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const updateService = useMutation({
    mutationFn: async (serviceData: UpdateServiceData): Promise<Service | null> => {
      console.log('Updating service:', serviceData);
      
      const { id, ...updateData } = serviceData;
      
      const updatePayload = {
        ...updateData,
        slug: serviceData.title ? generateSlug(serviceData.title) : undefined,
      };
      
      const { data, error } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }

      console.log('Service updated successfully:', data);
      return transformDatabaseService(data as DatabaseService);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      console.log('Deleting service:', id);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }

      console.log('Service deleted successfully');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const toggleServiceAvailability = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }): Promise<Service | null> => {
      console.log('Toggling service availability:', { id, available });
      
      const { data, error } = await supabase
        .from('services')
        .update({ available })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling service availability:', error);
        throw error;
      }

      console.log('Service availability toggled successfully:', data);
      return transformDatabaseService(data as DatabaseService);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    createService: createService.mutateAsync,
    updateService: updateService.mutateAsync,
    deleteService: deleteService.mutateAsync,
    toggleServiceAvailability: toggleServiceAvailability.mutateAsync,
    isCreating: createService.isPending,
    isUpdating: updateService.isPending,
    isDeleting: deleteService.isPending,
    isToggling: toggleServiceAvailability.isPending,
    error: createService.error || updateService.error || deleteService.error || toggleServiceAvailability.error,
  };
};
