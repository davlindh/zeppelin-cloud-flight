import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/marketplace/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckoutProgress } from '@/components/marketplace/checkout/CheckoutProgress';
import { ShippingForm } from '@/components/marketplace/checkout/ShippingForm';
import { PaymentFormStripe } from '@/components/stripe/PaymentFormStripe';
import { useCheckout } from '@/hooks/marketplace/useCheckout';
import { StripeProvider } from '@/components/stripe/StripeProvider';
import { calculateTax, getShippingCost } from '@/config/checkout.config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Separator } from '@/components/ui/separator';

const calculatePricing = (subtotal: number, country: string) => {
  const taxAmount = calculateTax(subtotal, country);
  const shippingAmount = getShippingCost(subtotal);
  const totalAmount = subtotal + taxAmount + shippingAmount;
  return { subtotal, taxAmount, shippingAmount, totalAmount };
};

export type CheckoutStep = 'shipping' | 'payment';

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
  method: 'card';
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
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const { placeOrder } = useCheckout();

  // Redirect if cart is empty
  if (state.items.length === 0) {
    navigate('/marketplace/cart');
    return null;
  }

  const pricing = shippingInfo
    ? calculatePricing(state.total, shippingInfo.country)
    : calculatePricing(state.total, 'SE');

  const handleShippingSubmit = async (data: ShippingInfo) => {
    setShippingInfo(data);
    setIsCreatingPayment(true);

    const p = calculatePricing(state.total, data.country);

    try {
      const orderId = await placeOrder({
        shippingInfo: data,
        paymentInfo: { method: 'card' },
        items: state.items,
        subtotal: p.subtotal,
        taxAmount: p.taxAmount,
        shippingAmount: p.shippingAmount,
        totalAmount: p.totalAmount,
      });

      if (!orderId) throw new Error('Failed to create order');

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

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else {
      navigate('/marketplace/cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Kassa</h1>
          <p className="text-muted-foreground">Slutför din beställning</p>
        </div>

        <CheckoutProgress currentStep={currentStep} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
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
                    <h2 className="text-lg font-semibold">Betalning</h2>
                    {clientSecret ? (
                      <PaymentFormStripe
                        clientSecret={clientSecret}
                        amount={Math.round(pricing.totalAmount * 100)}
                        currency="SEK"
                        onSuccess={() => navigate('/marketplace/order-success?view=success')}
                        onError={(error) => console.error('Payment error:', error)}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Förbereder betalning...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order summary sidebar */}
          <div>
            <Card className="bg-card border-border sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ordersammanfattning</h3>
                <div className="space-y-3 mb-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delsumma</span>
                    <span>{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moms</span>
                    <span>{formatCurrency(pricing.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frakt</span>
                    <span>{pricing.shippingAmount === 0 ? 'Gratis' : formatCurrency(pricing.shippingAmount)}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Totalt</span>
                  <span>{formatCurrency(pricing.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
