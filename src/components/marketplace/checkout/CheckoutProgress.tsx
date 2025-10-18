import { Check } from 'lucide-react';
import type { CheckoutStep } from '@/pages/marketplace/CheckoutPage';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: 'shipping', label: 'Shipping', description: 'Delivery information' },
  { id: 'payment', label: 'Payment', description: 'Payment method' },
  { id: 'review', label: 'Review', description: 'Confirm order' },
];

export const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : ''}
                    ${isCurrent ? 'border-primary text-primary bg-background' : ''}
                    ${isUpcoming ? 'border-muted text-muted-foreground bg-background' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-2 transition-colors
                    ${index < currentIndex ? 'bg-primary' : 'bg-muted'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
