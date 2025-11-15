import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FaveScore {
  user_id: string;
  total_score: number;
  level: string;
  last_recalculated_at: string | null;
}

export const useFaveScore = (userId: string | undefined) => {
  return useQuery<FaveScore | null>({
    queryKey: ['fave-score', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('fave_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no score exists yet, return default
        if (error.code === 'PGRST116') {
          return {
            user_id: userId,
            total_score: 0,
            level: 'seed',
            last_recalculated_at: null,
          };
        }
        throw error;
      }
      
      return data as FaveScore;
    },
  });
};
