import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Donation } from '@/types/funding';

interface UserDonation extends Donation {
  funding_campaigns?: {
    title: string;
    slug: string;
  } | null;
}

export const useUserDonations = (userId: string | undefined) => {
  return useQuery<UserDonation[]>({
    queryKey: ['user-donations', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await (supabase as any)
        .from('donations')
        .select(`
          *,
          funding_campaigns (
            title,
            slug
          )
        `)
        .eq('donor_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserDonation[];
    },
  });
};
