import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectData {
  id: string;
  title: string;
  slug?: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  image_path?: string;
  contact_email?: string;
  contact_phone?: string;
  auth_user_id?: string;
  claimed_at?: string;
  match_confidence?: number;
  match_criteria?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

interface UseProjectDataResult {
  data: ProjectData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProjectData = (projectId?: string): UseProjectDataResult => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!projectId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      setData(project as ProjectData);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch project data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
