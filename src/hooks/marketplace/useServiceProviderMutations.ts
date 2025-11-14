import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

interface CreateServiceProviderData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  experience: string;
  avatar?: string;
  specialties?: string[];
  certifications?: string[];
  responseTime?: string;
}

interface UpdateServiceProviderData extends Partial<CreateServiceProviderData> {
  id: string;
}

export const useServiceProviderMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: CreateServiceProviderData): Promise<ServiceProvider> => {
      const { data: provider, error } = await supabase
        .from('service_providers')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          bio: data.bio,
          location: data.location,
          experience: data.experience,
          avatar: data.avatar || '',
          specialties: data.specialties || [],
          certifications: data.certifications || [],
          response_time: data.responseTime || '24 hours',
          rating: 0,
          reviews: 0,
          completed_projects: 0
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return provider as ServiceProvider;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-providers'] });
      toast({
        title: "Success",
        description: "Service provider created successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create service provider:', error);
      toast({
        title: "Error",
        description: "Failed to create service provider",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateServiceProviderData): Promise<ServiceProvider> => {
      const { id, ...updateData } = data;
      const formattedData: any = {};
      
      if (updateData.name !== undefined) formattedData.name = updateData.name;
      if (updateData.email !== undefined) formattedData.email = updateData.email;
      if (updateData.phone !== undefined) formattedData.phone = updateData.phone;
      if (updateData.bio !== undefined) formattedData.bio = updateData.bio;
      if (updateData.location !== undefined) formattedData.location = updateData.location;
      if (updateData.experience !== undefined) formattedData.experience = updateData.experience;
      if (updateData.avatar !== undefined) formattedData.avatar = updateData.avatar;
      if (updateData.specialties !== undefined) formattedData.specialties = updateData.specialties;
      if (updateData.certifications !== undefined) formattedData.certifications = updateData.certifications;
      if (updateData.responseTime !== undefined) formattedData.response_time = updateData.responseTime;

      const { data: provider, error } = await supabase
        .from('service_providers')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return provider as ServiceProvider;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-providers'] });
      queryClient.invalidateQueries({ queryKey: ['service-provider', variables.id] });
      toast({
        title: "Success",
        description: "Service provider updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update service provider:', error);
      toast({
        title: "Error",
        description: "Failed to update service provider",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['service-providers'] });
      queryClient.removeQueries({ queryKey: ['service-provider', id] });
      toast({
        title: "Success",
        description: "Service provider deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to delete service provider:', error);
      toast({
        title: "Error",
        description: "Failed to delete service provider",
        variant: "destructive",
      });
    }
  });

  return {
    createServiceProvider: createMutation.mutateAsync,
    updateServiceProvider: updateMutation.mutateAsync,
    deleteServiceProvider: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: createMutation.error || updateMutation.error || deleteMutation.error
  };
};
