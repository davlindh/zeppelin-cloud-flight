import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EvaluationTemplate, EvaluationDimensionConfig } from './types';

export const useEvaluationTemplate = (templateKey: string | undefined) => {
  return useQuery({
    queryKey: ['evaluation-template', templateKey],
    enabled: !!templateKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluation_templates')
        .select('id, key, label, description, dimensions')
        .eq('key', templateKey)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        dimensions: data.dimensions as unknown as EvaluationDimensionConfig[],
      } as EvaluationTemplate;
    },
  });
};
