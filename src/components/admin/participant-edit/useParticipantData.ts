import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/schema';

type ParticipantData = Database['public']['Tables']['participants']['Row'];

interface UseParticipantDataResult {
  data: ParticipantData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useParticipantData = (participantId?: string): UseParticipantDataResult => {
  const [data, setData] = useState<ParticipantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!participantId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: participant, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (fetchError) throw fetchError;

      setData(participant);
    } catch (err) {
      console.error('Error fetching participant data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch participant data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [participantId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
