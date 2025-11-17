import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateCampaignInput {
  slug: string;
  title?: string;
  short_description?: string;
  description?: string;
  target_amount?: number;
  deadline?: string;
  visibility?: string;
  project_id?: string | null;
  collaboration_project_id?: string | null;
  event_id?: string | null;
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, ...updates }: UpdateCampaignInput) => {
      const { data, error } = await (supabase as any)
        .from('funding_campaigns')
        .update(updates)
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });
};
