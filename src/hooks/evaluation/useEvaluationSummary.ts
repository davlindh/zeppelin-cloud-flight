import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EvaluationTargetType, EvaluationSummaryData } from './types';

export const useEvaluationSummary = (
  targetType: EvaluationTargetType | undefined,
  targetId: string | undefined,
) => {
  return useQuery({
    queryKey: ['evaluation-summary', targetType, targetId],
    enabled: !!targetType && !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_target_evaluation_summary',
        {
          p_target_type: targetType,
          p_target_id: targetId,
        },
      );
      if (error) throw error;
      return data as unknown as EvaluationSummaryData;
    },
    staleTime: 5 * 60 * 1000,
  });
};
