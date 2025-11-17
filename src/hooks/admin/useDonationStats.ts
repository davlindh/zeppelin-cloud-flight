import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DonationStats {
  total: {
    count: number;
    amount: number;
  };
  pending: {
    count: number;
    amount: number;
  };
  succeeded: {
    count: number;
    amount: number;
  };
  failed: {
    count: number;
  };
  average: number;
}

export const useDonationStats = () => {
  return useQuery<DonationStats>({
    queryKey: ['admin-donation-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .select('status, amount');

      if (error) throw error;

      const stats = {
        total: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
        succeeded: { count: 0, amount: 0 },
        failed: { count: 0 },
        average: 0,
      };

      data.forEach((donation: any) => {
        stats.total.count++;
        stats.total.amount += Number(donation.amount);

        if (donation.status === 'pending') {
          stats.pending.count++;
          stats.pending.amount += Number(donation.amount);
        } else if (donation.status === 'succeeded') {
          stats.succeeded.count++;
          stats.succeeded.amount += Number(donation.amount);
        } else if (donation.status === 'failed') {
          stats.failed.count++;
        }
      });

      stats.average = stats.total.count > 0 ? stats.total.amount / stats.total.count : 0;

      return stats;
    },
  });
};
