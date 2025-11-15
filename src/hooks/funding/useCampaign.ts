import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEvaluationSummary } from '@/hooks/evaluation/useEvaluationSummary';
import type { FundingCampaign } from '@/types/funding';

export const useCampaign = (slug: string | undefined) => {
  const campaignQuery = useQuery<FundingCampaign>({
    queryKey: ['campaign', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('funding_campaigns')
        .select(`
          *,
          projects(id, title, slug, auth_user_id),
          collaboration_projects(id, title, slug),
          events(id, title, slug),
          project_budget(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as unknown as FundingCampaign;
    },
  });

  const evaluationSummary = useEvaluationSummary(
    'funding_campaign',
    campaignQuery.data?.id,
    campaignQuery.data?.event_id ? 'event' : 'global',
    campaignQuery.data?.event_id || undefined
  );

  return {
    ...campaignQuery,
    evaluationSummary: evaluationSummary.data,
    isLoadingEvaluation: evaluationSummary.isLoading,
  };
};
