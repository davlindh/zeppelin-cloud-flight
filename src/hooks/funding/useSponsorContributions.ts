import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SponsorContribution } from '@/types/funding';

export const useSponsorContributions = (sponsorId: string | undefined) => {
  return useQuery({
    queryKey: ['sponsor-contributions', sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('sponsor_contributions')
        .select(`
          *,
          funding_campaigns(id, title, slug),
          projects(id, title, slug)
        `)
        .eq('sponsor_id', sponsorId)
        .order('contributed_at', { ascending: false });

      if (error) throw error;

      const contributions = data as unknown as SponsorContribution[];
      const total = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      return {
        contributions,
        total,
      };
    },
  });
};
