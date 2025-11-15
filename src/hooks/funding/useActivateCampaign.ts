import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useActivateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      // Validate before activating
      const { data: campaign, error: fetchError } = await (supabase as any)
        .from('funding_campaigns')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) throw fetchError;

      if (!campaign.target_amount || campaign.target_amount <= 0) {
        throw new Error('Target amount must be set before activating');
      }

      if (!campaign.deadline) {
        throw new Error('Deadline must be set before activating');
      }

      const { data, error } = await (supabase as any)
        .from('funding_campaigns')
        .update({ status: 'active' })
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign activated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate campaign: ${error.message}`);
    },
  });
};
