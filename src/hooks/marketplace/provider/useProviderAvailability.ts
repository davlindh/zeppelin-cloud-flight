import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProviderAvailability = (providerId: string) => {
  const queryClient = useQueryClient();
  
  const { data: availability, isLoading } = useQuery({
    queryKey: ['provider-availability', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('availability_status, next_available_at')
        .eq('id', providerId)
        .single();
      
      if (error) throw error;
      
      return {
        status: data.availability_status || 'available',
        nextAvailableAt: data.next_available_at,
      };
    },
    enabled: !!providerId,
    staleTime: 60000, // 1 minute
  });
  
  const updateAvailability = useMutation({
    mutationFn: async ({ status, nextAvailableAt }: { status: string; nextAvailableAt?: string | null }) => {
      const { error } = await supabase
        .from('service_providers')
        .update({
          availability_status: status,
          next_available_at: nextAvailableAt,
        })
        .eq('id', providerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-availability', providerId] });
      toast.success('Availability updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update availability: ' + error.message);
    },
  });
  
  return {
    availability,
    isLoading,
    updateAvailability: updateAvailability.mutate,
    isUpdating: updateAvailability.isPending,
  };
};
