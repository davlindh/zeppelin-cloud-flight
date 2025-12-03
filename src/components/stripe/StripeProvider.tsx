import { loadStripe } from '@stripe/stripe-js';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

// Initialize Stripe outside of a component's render to avoid
// recreating the object on every render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe integration will not work.');
}

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (clientSecret) {
      return {
        clientSecret,
        appearance: {
          theme: 'stripe' as const,
        },
      };
    }
    return undefined;
  }, [clientSecret]);

  // Only render Elements when we have a clientSecret
  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
}

// Convenience hook to access Stripe and Elements
export function useStripeElements() {
  return ElementsConsumer;
}

// Export the stripePromise for use in hooks
export { stripePromise as stripePromise };
