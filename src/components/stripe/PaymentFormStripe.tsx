import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface PaymentFormStripeProps {
  clientSecret?: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentFormStripe({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError
}: PaymentFormStripeProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/marketplace/order-success?view=success`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        onError?.(new Error(submitError.message));
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = !stripe || !elements || isProcessing;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Information</h3>
          <div className="text-sm text-muted-foreground">
            Amount: <span className="font-medium">{(amount / 100).toFixed(2)} {currency.toUpperCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isDisabled}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay {(amount / 100).toFixed(2)} {currency.toUpperCase()}
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Your payment information is secure and encrypted.</p>
        <p>Powered by Stripe • All major credit cards accepted</p>
      </div>
    </div>
  );
}
