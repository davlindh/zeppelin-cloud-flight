import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSendParticipantWelcome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.functions.invoke('send-participant-welcome', {
        body: { submissionId },
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send welcome email');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email skickat!",
        description: "Välkomstmail har skickats till deltagaren.",
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fel vid email-utskick",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
