import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PaymentInfo } from '@/pages/marketplace/CheckoutPage';
import { CreditCard, Wallet, Smartphone, ArrowRight } from 'lucide-react';

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

  const selectedMethod = watch('method');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        className="space-y-3"
      >
        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex items-center flex-1 cursor-pointer">
            <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-sm text-muted-foreground">
                Visa, Mastercard, American Express
              </p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value="klarna" id="klarna" />
          <Label htmlFor="klarna" className="flex items-center flex-1 cursor-pointer">
            <Wallet className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">Klarna</p>
              <p className="text-sm text-muted-foreground">
                Pay later or in installments
              </p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value="swish" id="swish" />
          <Label htmlFor="swish" className="flex items-center flex-1 cursor-pointer">
            <Smartphone className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="font-medium">Swish</p>
              <p className="text-sm text-muted-foreground">Mobile payment</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {selectedMethod === 'card' && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              {...register('cardNumber')}
              placeholder="1234 5678 9012 3456"
              className="mt-1"
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
              {...register('cardName')}
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
                {...register('cardExpiry')}
                placeholder="MM/YY"
                className="mt-1"
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
                {...register('cardCvv')}
                placeholder="123"
                maxLength={3}
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
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            You will be redirected to Klarna to complete your payment after reviewing
            your order.
          </p>
        </div>
      )}

      {selectedMethod === 'swish' && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            You will receive a Swish payment request on your mobile phone after
            confirming your order.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg">
        Review Order
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};
