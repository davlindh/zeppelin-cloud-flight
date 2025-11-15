import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  EvaluationTargetType, 
  EvaluationSummaryData,
  EvaluationContextScope 
} from './types';

export const useEvaluationSummary = (
  targetType: EvaluationTargetType | undefined,
  targetId: string | undefined,
  contextScope?: EvaluationContextScope,
  contextId?: string,
) => {
  return useQuery({
    queryKey: ['evaluation-summary', targetType, targetId, contextScope, contextId],
    enabled: !!targetType && !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_target_evaluation_summary',
        {
          p_target_type: targetType,
          p_target_id: targetId,
          p_context_scope: contextScope || null,
          p_context_id: contextId || null,
        } as any, // Type assertion needed until Supabase types are regenerated after migration
      );
      if (error) throw error;
      return data as unknown as EvaluationSummaryData;
    },
    staleTime: 5 * 60 * 1000,
  });
};
