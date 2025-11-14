import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProviderValidation = (providerId?: string) => {
  return useQuery({
    queryKey: ['provider-validation', providerId],
    queryFn: async () => {
      if (!providerId) return null;

      const { data: provider } = await supabase
        .from('service_providers')
        .select('*, services(count)')
        .eq('id', providerId)
        .single();

      if (!provider) return null;

      const warnings: string[] = [];
      
      if (!provider.email && !provider.phone) {
        warnings.push('Missing contact information');
      }
      
      if (provider.rating === 0 || provider.reviews === 0) {
        warnings.push('No customer feedback yet');
      }
      
      const servicesCount = provider.services?.[0]?.count || 0;
      if (servicesCount === 0) {
        warnings.push('No services assigned to this provider');
      }
      
      if (provider.bio && provider.bio.includes('Auto-created')) {
        warnings.push('Profile needs manual review and update');
      }

      return {
        isValid: warnings.length === 0,
        warnings,
        provider
      };
    },
    enabled: !!providerId
  });
};
