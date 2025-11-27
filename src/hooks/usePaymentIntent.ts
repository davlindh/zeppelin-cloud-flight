import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCreatePaymentIntent() {
  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const { data, error } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: { order_id: orderId },
        }
      );

      if (error) {
        throw new Error(error.message || 'Failed to create payment intent');
      }

      if (!data.clientSecret) {
        throw new Error('No client secret returned from server');
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    },
  });

  async function confirmPayment(clientSecret: string) {
    // This would be called after Stripe confirms the payment
    // The actual confirmation happens in the webhook
    // This is just for UI feedback
  }

  return {
    createPaymentIntent: createPaymentIntentMutation.mutateAsync,
    isCreating: createPaymentIntentMutation.isPending,
    error: createPaymentIntentMutation.error,
    confirmPayment,
  };
}
