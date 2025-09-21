import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { X, User, Building, Lightbulb, Users } from 'lucide-react';

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

export interface SubmissionFormProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  currentStep?: number;
  totalSteps?: number;
  icon?: 'participant' | 'project' | 'sponsor' | 'collaboration';
  className?: string;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export const BaseSubmissionForm: React.FC<SubmissionFormProps> = ({
  onClose,
  children,
  title,
  currentStep = 1,
  totalSteps = 1,
  icon,
  className,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const { toast } = useToast();

  const getIcon = () => {
    switch (icon) {
      case 'participant':
        return <User className="h-5 w-5" />;
      case 'project':
        return <Lightbulb className="h-5 w-5" />;
      case 'sponsor':
        return <Building className="h-5 w-5" />;
      case 'collaboration':
        return <Users className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit();
      toast({
        title: 'Submission Successful!',
        description: 'Thank you for your submission. We will review it and get back to you soon.',
        variant: 'success',
      });
      onClose();
    } catch (err) {
      // Error handled by individual form
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-auto ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getIcon()}
              {title}
            </CardTitle>
            {totalSteps > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {totalSteps > 1 && <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {children}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
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
