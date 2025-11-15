import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Donation } from '@/types/funding';

export const useDonations = (campaignId: string | undefined) => {
  return useQuery<Donation[]>({
    queryKey: ['donations', campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Donation[];
    },
  });
};

interface CreateDonationInput {
  campaign_id: string;
  amount: number;
  currency?: string;
  donor_name?: string;
  donor_email?: string;
  message?: string;
  is_anonymous?: boolean;
}

export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation<Donation, Error, CreateDonationInput>({
    mutationFn: async (input: CreateDonationInput) => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .insert({
          ...input,
          status: 'pending' as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Donation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['donations', data.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast.success('Donation created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create donation: ${error.message}`);
    },
  });
};
