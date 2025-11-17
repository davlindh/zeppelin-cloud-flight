import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopDonor {
  donor_user_id: string | null;
  donor_name: string;
  total_donated: number;
  currency: string;
  fave_score: number;
  fave_level: string;
}

export const useTopDonors = (campaignId: string | undefined) => {
  return useQuery<TopDonor[]>({
    queryKey: ['top-donors', campaignId],
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_campaign_top_donors', {
        p_campaign_id: campaignId
      });

      if (error) {
        console.error('Error fetching top donors:', error);
        throw error;
      }

      return (data || []) as TopDonor[];
    },
  });
};
