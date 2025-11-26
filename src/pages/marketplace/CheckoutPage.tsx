import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/marketplace/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckoutProgress } from '@/components/marketplace/checkout/CheckoutProgress';
import { ShippingForm } from '@/components/marketplace/checkout/ShippingForm';
import { PaymentForm } from '@/components/marketplace/checkout/PaymentForm';
import { OrderReview } from '@/components/marketplace/checkout/OrderReview';
import { useCheckout } from '@/hooks/marketplace/useCheckout';
import { checkoutConfig, getTaxRate, getShippingCost, calculateTax } from '@/config/checkout.config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  method: 'card' | 'klarna' | 'swish' | 'revolut';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { state } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  const { placeOrder, isPlacing } = useCheckout();

  // Redirect if cart is empty
  if (state.items.length === 0) {
    navigate('/marketplace/cart');
    return null;
  }

  const handleShippingSubmit = (data: ShippingInfo) => {
    setShippingInfo(data);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (data: PaymentInfo) => {
    setPaymentInfo(data);
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!shippingInfo || !paymentInfo) return;

    const pricing = calculatePricing(state.total, shippingInfo.country);

    const success = await placeOrder({
      shippingInfo,
      paymentInfo,
      items: state.items,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      shippingAmount: pricing.shippingAmount,
      totalAmount: pricing.totalAmount,
    });

    if (success) {
      navigate('/order-confirmation');
    }
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
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order in just a few steps
          </p>
        </div>

        <CheckoutProgress currentStep={currentStep} />

        <Card className="mt-8">
          <CardContent className="p-6">
            {currentStep === 'shipping' && (
              <ShippingForm
                initialData={shippingInfo}
                onSubmit={handleShippingSubmit}
              />
            )}

            {currentStep === 'payment' && shippingInfo && (
              <PaymentForm
                initialData={paymentInfo}
                onSubmit={handlePaymentSubmit}
              />
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
