import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/marketplace/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckoutProgress } from '@/components/marketplace/checkout/CheckoutProgress';
import { ShippingForm } from '@/components/marketplace/checkout/ShippingForm';
import { PaymentFormStripe } from '@/components/stripe/PaymentFormStripe';
import { PaymentMethodSelector, PaymentMethod } from '@/components/marketplace/checkout/PaymentMethodSelector';
import { OrderReview } from '@/components/marketplace/checkout/OrderReview';
import { useCheckout } from '@/hooks/marketplace/useCheckout';
import { StripeProvider } from '@/components/stripe/StripeProvider';
import { checkoutConfig, getTaxRate, getShippingCost, calculateTax } from '@/config/checkout.config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Utility function to calculate pricing based on configuration
const calculatePricing = (subtotal: number, country: string) => {
  const taxAmount = calculateTax(subtotal, country);
  const shippingAmount = getShippingCost(subtotal);
  const totalAmount = subtotal + taxAmount + shippingAmount;

  return {
    subtotal,
    taxAmount,
    shippingAmount,
    totalAmount
  };
};

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string>('');

  return (
    <StripeProvider clientSecret={clientSecret || undefined}>
      <CheckoutContent clientSecret={clientSecret} setClientSecret={setClientSecret} />
    </StripeProvider>
  );
};

const CheckoutContent = ({ 
  clientSecret, 
  setClientSecret 
}: { 
  clientSecret: string; 
  setClientSecret: (secret: string) => void;
}) => {
  const navigate = useNavigate();
  const { state } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  
  const { placeOrder, isPlacing } = useCheckout();

  // Redirect if cart is empty
  if (state.items.length === 0) {
    navigate('/marketplace/cart');
    return null;
  }

  const handleShippingSubmit = async (data: ShippingInfo) => {
    setShippingInfo(data);
    setIsCreatingPayment(true);
    
    const pricing = calculatePricing(state.total, data.country);

    try {
      // Create order first - returns order ID
      const orderId = await placeOrder({
        shippingInfo: data,
        paymentInfo: { method: paymentMethod },
        items: state.items,
        subtotal: pricing.subtotal,
        taxAmount: pricing.taxAmount,
        shippingAmount: pricing.shippingAmount,
        totalAmount: pricing.totalAmount,
      });

      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Create PaymentIntent for Stripe Elements
      // Pass customer_email for guest order verification
      const { data: paymentResult, error } = await supabase.functions.invoke(
        'create-payment-intent',
        { body: { order_id: orderId, customer_email: data.email } }
      );

      if (error) throw error;

      setClientSecret(paymentResult.clientSecret);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error setting up payment:', error);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!shippingInfo || !clientSecret) return;
    setPaymentInfo({ method: paymentMethod });
    setCurrentStep('review');
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    } else {
      navigate('/marketplace/cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order in just a few steps
          </p>
        </div>

        <CheckoutProgress currentStep={currentStep} />

        <Card className="mt-8 bg-card border-border">
          <CardContent className="p-6">
            {currentStep === 'shipping' && (
              <ShippingForm
                initialData={shippingInfo}
                onSubmit={handleShippingSubmit}
                isLoading={isCreatingPayment}
              />
            )}

            {currentStep === 'payment' && shippingInfo && (
              <div className="space-y-6">
                {/* Payment Method Selector */}
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />

                {/* Stripe Payment Form */}
                {clientSecret ? (
                  <PaymentFormStripe
                    clientSecret={clientSecret}
                    amount={Math.round(state.total * 100)}
                    currency="SEK"
                    onSuccess={() => navigate('/marketplace/order-success?view=success')}
                    onError={(error) => console.error('Payment error:', error)}
                  />
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Setting up payment...</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'review' && shippingInfo && paymentInfo && (() => {
              const pricing = calculatePricing(state.total, shippingInfo.country);
              return (
                <OrderReview
                  shippingInfo={shippingInfo}
                  paymentInfo={paymentInfo}
                  items={state.items}
                  subtotal={pricing.subtotal}
                  taxAmount={pricing.taxAmount}
                  shippingAmount={pricing.shippingAmount}
                  totalAmount={pricing.totalAmount}
                  onPlaceOrder={handlePlaceOrder}
                  isPlacing={isPlacing}
                  onEdit={(step) => setCurrentStep(step)}
                />
              );
            })()}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
