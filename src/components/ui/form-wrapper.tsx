import React from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues, Path, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { X, User, Building, Lightbulb, Users, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

export interface FormWrapperProps<T extends FieldValues> {
  title: string;
  icon?: 'participant' | 'project' | 'sponsor' | 'collaboration';
  children: (form: UseFormReturn<T>) => React.ReactNode;
  onSubmit: (data: T) => Promise<void>;
  onClose: () => void;
  schema?: ZodSchema<T>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  isSubmitting?: boolean;
  error?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
  enableAutoSave?: boolean;
  showProgress?: boolean;
  estimatedTime?: string;
  onStepChange?: (step: number) => void;
  lastSaved?: Date | null;
  isSaving?: boolean;
}

export function FormWrapper<T extends FieldValues>({
  title,
  icon,
  children,
  onSubmit,
  onClose,
  schema,
  defaultValues,
  isSubmitting = false,
  error,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  currentStep = 1,
  totalSteps = 1,
  className,
  enableAutoSave = false,
  showProgress = true,
  estimatedTime,
  onStepChange,
  lastSaved,
  isSaving = false,
}: FormWrapperProps<T>) {
  const { toast } = useToast();

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onChange',
  });

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

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Success!',
        description: 'Your submission has been received successfully.',
        variant: 'default',
      });
      onClose();
    } catch (err) {
      // Error is handled by the form's onSubmit function
      console.error('Form submission error:', err);
    }
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-auto ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {getIcon()}
              {title}
            </CardTitle>
            {totalSteps > 1 && (
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                  {estimatedTime && (
                    <span className="ml-2 text-xs">({estimatedTime} remaining)</span>
                  )}
                </p>
                {showProgress && (
                  <Progress value={progressPercentage} className="h-1" />
                )}
              </div>
            )}
            {enableAutoSave && (lastSaved || isSaving) && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Save className="h-3 w-3" />
                {isSaving ? (
                  <span>Saving draft...</span>
                ) : lastSaved ? (
                  <span>Last saved: {format(lastSaved, 'HH:mm:ss')}</span>
                ) : null}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {totalSteps > 1 && <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {children(form)}
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {cancelButtonText}
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? 'Submitting...' : submitButtonText}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}

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
