import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Donation } from '@/types/funding';

interface DonationFilters {
  search?: string;
  status?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useDonations = (filters?: DonationFilters) => {
  return useQuery<Donation[]>({
    queryKey: ['admin-donations', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('donations')
        .select(`
          *,
          funding_campaigns:campaign_id (
            id,
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.campaignId) {
        query = query.eq('campaign_id', filters.campaignId);
      }

      if (filters?.search) {
        query = query.or(`donor_name.ilike.%${filters.search}%,donor_email.ilike.%${filters.search}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Donation[];
    },
  });
};
