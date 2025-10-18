import React from 'react';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { FieldValues } from 'react-hook-form';

export interface BaseSubmissionData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organization?: string;
  website?: string;
  motivation: string;
  experience?: string;
  availability?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
  newsletterSubscription?: boolean;
}

export interface SubmissionFormProps<T extends FieldValues> {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  currentStep?: number;
  totalSteps?: number;
  icon?: 'participant' | 'project' | 'sponsor' | 'collaboration';
  className?: string;
  onSubmit: (data: T) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * @deprecated Use FormWrapper directly instead of BaseSubmissionForm.
 * This component is kept for backward compatibility but should be replaced
 * with FormWrapper for new implementations.
 */
export const BaseSubmissionForm = <T extends FieldValues>({
  onClose,
  children,
  title,
  currentStep = 1,
  totalSteps = 1,
  icon,
  className,
  onSubmit,
  isSubmitting = false,
  error,
}: SubmissionFormProps<T>) => {
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only submit on the last step
    if (currentStep === totalSteps) {
      try {
        // Call the onSubmit handler which is already wrapped by react-hook-form's handleSubmit
        // It will extract form data and call the actual submission handler
        const submitHandler = onSubmit as unknown as (e: React.FormEvent) => Promise<void>;
        await submitHandler(e);
        // Close the form after successful submission
        onClose();
      } catch (error) {
        // Error is already handled by the form component, don't close
        console.error('Submission failed:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form 
        onSubmit={handleFormSubmit}
        className={`w-full max-w-2xl max-h-[90vh] overflow-auto bg-background rounded-lg border ${className}`}
      >
        <div className="flex flex-row items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {totalSteps > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {totalSteps > 1 && <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />}

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 border border-destructive/50 text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          {children}
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input hover:bg-accent hover:text-accent-foreground disabled:opacity-50 rounded-md"
          >
            Cancel
          </button>
          {currentStep === totalSteps && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i + 1 <= currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-colors ${
                i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);
