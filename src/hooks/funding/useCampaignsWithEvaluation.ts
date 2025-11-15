import { useQuery } from '@tanstack/react-query';
import { useCampaigns } from './useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import type { FundingCampaign } from '@/types/funding';
import type { EvaluationSummaryData } from '@/hooks/evaluation/types';

interface CampaignWithEvaluation extends FundingCampaign {
  evaluation_summary?: EvaluationSummaryData;
}

interface CampaignFilters {
  status?: string[];
  eventId?: string;
  visibility?: string;
  projectId?: string;
}

/**
 * Hook that fetches campaigns with their evaluation summaries merged client-side
 * Used for public discovery pages where ECKT data is needed for sorting/display
 */
export const useCampaignsWithEvaluation = (filters?: CampaignFilters) => {
  const { data: campaigns, isLoading, error } = useCampaigns(filters);

  return useQuery<CampaignWithEvaluation[]>({
    queryKey: ['campaigns-with-evaluation', filters, campaigns?.length],
    enabled: !!campaigns && campaigns.length > 0,
    queryFn: async () => {
      if (!campaigns) return [];

      // Fetch evaluation summaries for all campaigns in parallel
      const campaignsWithEvaluation = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const { data: evaluationSummary, error } = await supabase.rpc(
              'get_target_evaluation_summary',
              {
                p_target_type: 'funding_campaign',
                p_target_id: campaign.id,
                p_context_scope: campaign.event_id ? 'event' : 'global',
                p_context_id: campaign.event_id || null,
              } as any
            );

            if (error) {
              console.error(`Failed to fetch evaluation for campaign ${campaign.id}:`, error);
            }

            return {
              ...campaign,
              evaluation_summary: evaluationSummary as unknown as EvaluationSummaryData | undefined,
            };
          } catch (error) {
            console.error(`Failed to fetch evaluation for campaign ${campaign.id}:`, error);
            return {
              ...campaign,
              evaluation_summary: undefined,
            };
          }
        })
      );

      return campaignsWithEvaluation;
    },
    staleTime: 5 * 60 * 1000,
  });
};
