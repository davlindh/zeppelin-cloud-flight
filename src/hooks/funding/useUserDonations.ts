import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

export const useUserDonations = () => {
  const { data: user } = useAuthenticatedUser();

  return useQuery({
    queryKey: ['user-donations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .select(`
          *,
          funding_campaigns:campaign_id (
            title,
            slug
          ),
          donation_subscriptions:subscription_id (
            *,
            funding_campaigns:campaign_id (
              title,
              slug
            )
          )
        `)
        .eq('donor_user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
