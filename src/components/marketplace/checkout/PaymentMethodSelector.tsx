import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'klarna' | 'swish';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: 'card' as PaymentMethod,
    label: 'Credit Card',
    description: 'Visa, Mastercard, Amex',
    icon: CreditCard,
  },
  {
    id: 'klarna' as PaymentMethod,
    label: 'Klarna',
    description: 'Pay later or in installments',
    icon: Wallet,
  },
  {
    id: 'swish' as PaymentMethod,
    label: 'Swish',
    description: 'Pay with your phone',
    icon: Wallet,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onMethodChange(method.id)}
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card'
              )}
            >
              <Icon className={cn(
                'h-6 w-6 mb-2',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'font-medium text-sm',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {method.label}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
