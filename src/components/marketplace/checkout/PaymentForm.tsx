import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentLoadingOverlay } from '@/components/ui/payment-loading-overlay';
import { useStockManagement } from '@/hooks/useStockManagement';
import type { PaymentInfo } from '@/pages/marketplace/CheckoutPage';
import { CreditCard, Wallet, Smartphone, ArrowRight, Loader2 } from 'lucide-react';

const paymentSchema = z.object({
  method: z.enum(['card', 'klarna', 'swish']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

interface PaymentFormProps {
  initialData: PaymentInfo | null;
  onSubmit: (data: PaymentInfo) => void;
}

export const PaymentForm = ({ initialData, onSubmit }: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'klarna' | 'swish'>('stripe');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentInfo>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      method: 'card',
    },
  });

  const { checkStock, reserveStock } = useStockManagement();
  const selectedMethod = watch('method');

  const handlePaymentSubmit = async (data: PaymentInfo) => {
    setIsProcessing(true);
    
    // Set loading overlay based on payment method
    const paymentMethodMap = {
      card: 'stripe' as const,
      klarna: 'klarna' as const,
      swish: 'swish' as const,
      revolut: 'stripe' as const, // Will implement Revolut separately
    };
    
    setSelectedPaymentMethod(paymentMethodMap[data.method]);
    
    try {
      // Reserve stock for items before proceeding
      // This is a simplified example - in real implementation, 
      // you'd check each cart item against the database
      const stockChecks = []; // Add your actual stock checks here
      
      if (stockChecks.some(check => !check.available)) {
        throw new Error('Some items are no longer available');
      }
      
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit(data);
    } catch (error) {
      console.error('Payment processing error:', error);
      setIsProcessing(false);
      // Handle error appropriately
      return;
    }
    
    setIsProcessing(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handlePaymentSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          <p className="text-muted-foreground mb-6">
            Select your preferred payment method
          </p>
        </div>

        <RadioGroup
          defaultValue={selectedMethod}
          onValueChange={(value) => {
            const event = {
              target: { name: 'method', value },
            } as any;
            register('method').onChange(event);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center flex-1 cursor-pointer">
              <div className="flex items-center w-full">
                <CreditCard className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">Credit / Debit Card</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Visa, Mastercard, American Express
                  </p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
            <RadioGroupItem value="klarna" id="klarna" />
            <Label htmlFor="klarna" className="flex items-center flex-1 cursor-pointer">
              <div className="flex items-center w-full">
                <Wallet className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">Klarna</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pay later or in installments
                  </p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
            <RadioGroupItem value="swish" id="swish" />
            <Label htmlFor="swish" className="flex items-center flex-1 cursor-pointer">
              <div className="flex items-center w-full">
                <Smartphone className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">Swish</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Mobile payment</p>
                </div>
              </div>
            </Label>
          </div>

        </RadioGroup>

        {selectedMethod === 'card' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Secure:</strong> Your payment is processed securely via Stripe
              </p>
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                {...register('cardNumber', { required: selectedMethod === 'card' })}
                placeholder="1234 5678 9012 3456"
                className="mt-1"
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cardName">Cardholder Name *</Label>
              <Input
                id="cardName"
                {...register('cardName', { required: selectedMethod === 'card' })}
                placeholder="John Doe"
                className="mt-1"
              />
              {errors.cardName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardExpiry">Expiry Date *</Label>
                <Input
                  id="cardExpiry"
                  {...register('cardExpiry', { required: selectedMethod === 'card' })}
                  placeholder="MM/YY"
                  className="mt-1"
                  maxLength={5}
                />
                {errors.cardExpiry && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.cardExpiry.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cardCvv">CVV *</Label>
                <Input
                  id="cardCvv"
                  {...register('cardCvv', { required: selectedMethod === 'card' })}
                  placeholder="123"
                  maxLength={4}
                  className="mt-1"
                />
                {errors.cardCvv && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.cardCvv.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'klarna' && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Wallet className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Klarna Payment
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  You will be redirected to Klarna to complete your payment securely. 
                  Pay later or in installments - no fees if paid on time.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'swish' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Smartphone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Swish Payment
                </p>
                <p className="text-xs text-green-700 mt-1">
                  You will receive a Swish payment request on your mobile phone. 
                  Fast, secure, and instant payment confirmation.
                </p>
              </div>
            </div>
          </div>
        )}


        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Review Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <PaymentLoadingOverlay
        isVisible={isProcessing}
        paymentMethod={selectedPaymentMethod}
        onCancel={() => setIsProcessing(false)}
      />
    </>
  );
};
