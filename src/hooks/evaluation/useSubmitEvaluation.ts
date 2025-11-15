import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EvaluationTargetType } from './types';
import { useToast } from '@/hooks/use-toast';

interface SubmitEvaluationInput {
  targetType: EvaluationTargetType;
  targetId: string;
  templateId: string;
  rating?: number | null;
  ecktValue: number;
  dimensions: Record<string, number>;
  comment?: string;
}

export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: SubmitEvaluationInput) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          evaluator_id: user.id,
          target_type: input.targetType,
          target_id: input.targetId,
          template_id: input.templateId,
          rating: input.rating ?? null,
          eckt_value: input.ecktValue,
          dimensions: input.dimensions,
          comment: input.comment ?? null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluation-summary', variables.targetType, variables.targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.targetType, variables.targetId],
      });

      toast({
        title: 'Thanks for your evaluation',
        description: 'Your input has been recorded and will influence the project\'s standing.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit evaluation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
