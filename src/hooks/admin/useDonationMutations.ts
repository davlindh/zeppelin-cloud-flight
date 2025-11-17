import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDonationMutations = () => {
  const queryClient = useQueryClient();

  const approveDonation = useMutation({
    mutationFn: async (donationId: string) => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .update({ status: 'succeeded' })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-donation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast.success('Donation approved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve donation: ${error.message}`);
    },
  });

  const rejectDonation = useMutation({
    mutationFn: async (donationId: string) => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .update({ status: 'failed' })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-donation-stats'] });
      toast.success('Donation rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject donation: ${error.message}`);
    },
  });

  const refundDonation = useMutation({
    mutationFn: async (donationId: string) => {
      const { data, error } = await (supabase as any)
        .from('donations')
        .update({ status: 'refunded' })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-donation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast.success('Donation refunded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to refund donation: ${error.message}`);
    },
  });

  return {
    approveDonation,
    rejectDonation,
    refundDonation,
  };
};
