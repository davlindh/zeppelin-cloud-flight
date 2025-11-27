import { loadStripe } from '@stripe/stripe-js';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

// Initialize Stripe outside of a component's render to avoid
// recreating the object on every render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
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
