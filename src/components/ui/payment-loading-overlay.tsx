import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface PaymentLoadingOverlayProps {
  isVisible: boolean;
  paymentMethod: 'stripe' | 'klarna' | 'swish';
  onCancel?: () => void;
}

export const PaymentLoadingOverlay = ({
  isVisible,
  paymentMethod,
  onCancel
}: PaymentLoadingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = paymentMethod === 'stripe' 
    ? [
        { label: 'Processing payment...', icon: CreditCard },
        { label: 'Verifying transaction...', icon: Shield },
        { label: 'Completing order...', icon: CheckCircle }
      ]
    : paymentMethod === 'klarna'
    ? [
        { label: 'Redirecting to Klarna...', icon: CreditCard },
        { label: 'Processing payment...', icon: Shield },
        { label: 'Completing order...', icon: CheckCircle }
      ]
    : [
        { label: 'Sending Swish request...', icon: CreditCard },
        { label: 'Awaiting confirmation...', icon: Shield },
        { label: 'Processing payment...', icon: CheckCircle }
      ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update step based on progress
        const newStep = Math.floor((prev / 100) * steps.length);
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }
        
        return prev + (100 / (steps.length * 30)); // Adjust speed as needed
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, currentStep, steps.length]);

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep]?.icon || Loader2;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CurrentIcon className="h-8 w-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {steps[currentStep]?.label || 'Processing...'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Please don't close this window while we process your payment.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-xs text-muted-foreground">
              Secure payment powered by {paymentMethod === 'stripe' ? 'Stripe' : paymentMethod === 'klarna' ? 'Klarna' : 'Swish'}
            </p>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Cancel payment
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
