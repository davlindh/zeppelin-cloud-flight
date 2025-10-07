import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed?: boolean;
  agreedToTerms?: boolean;
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onConfirm?: () => Promise<void>;
}

export const BookingNavigation: React.FC<BookingNavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed = true,
  agreedToTerms = false,
  isSubmitting = false,
  onNext,
  onPrevious,
  onConfirm
}) => {
  const isLastStep = currentStep === totalSteps;
  
  return (
    <div className="flex justify-between items-center mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="text-sm text-slate-600">
        Step {currentStep} of {totalSteps}
      </div>

      {isLastStep ? (
        <Button
          onClick={onConfirm}
          disabled={!canProceed || !agreedToTerms || isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

