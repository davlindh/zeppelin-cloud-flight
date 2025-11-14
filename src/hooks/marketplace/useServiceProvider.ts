
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceProvider = (serviceId: string) => {
  return useQuery({
    queryKey: ['service-provider', serviceId],
    queryFn: async () => {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select(`
          *,
          service_providers!provider_id (
            id,
            name,
            email,
            phone,
            avatar,
            bio,
            rating,
            reviews
          )
        `)
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;
      
      return {
        service,
        provider: service.service_providers
      };
    },
    enabled: !!serviceId
  });
};
