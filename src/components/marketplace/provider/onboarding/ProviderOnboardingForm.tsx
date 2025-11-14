import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { providerOnboardingSchema, ProviderOnboardingData, step1Schema, step2Schema, step3Schema, step4Schema } from '@/schemas/providerOnboarding';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2ProfessionalDetails } from './Step2ProfessionalDetails';
import { Step3Services } from './Step3Services';
import { Step4Availability } from './Step4Availability';
import { supabase } from '@/integrations/supabase/client';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building } from 'lucide-react';
import { generateSlug } from '@/utils/formUtils';
import { useToast } from '@/hooks/use-toast';
import { FormProvider } from 'react-hook-form';

export const ProviderOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useAuthenticatedUser();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProviderOnboardingData>({
    resolver: zodResolver(providerOnboardingSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      experience: '',
      specialties: [],
      certifications: [],
      services_description: '',
      availability_status: 'available',
      response_time: '24 hours',
      awards: [],
    },
  });
  
  const multiStep = useMultiStepForm({
    totalSteps: 4,
    enableAutoSave: true,
    formType: 'provider' as any,
    form,
  });
  
  const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema];
  
  const handleNext = async () => {
    const currentSchema = stepSchemas[multiStep.currentStep - 1];
    const isValid = await form.trigger(Object.keys(currentSchema.shape) as any);
    
    if (isValid) {
      await multiStep.nextStep();
    }
  };
  
  const handleSubmit = async (data: ProviderOnboardingData) => {
    if (!user?.id) {
      setError('You must be logged in to create a provider profile');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const slug = generateSlug(data.name);
      
      const { error: insertError } = await supabase
        .from('service_providers')
        .insert({
          auth_user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          bio: data.bio,
          experience: data.experience,
          specialties: data.specialties,
          certifications: data.certifications || [],
          years_in_business: data.years_in_business || null,
          portfolio_description: data.portfolio_description || null,
          work_philosophy: data.work_philosophy || null,
          availability_status: data.availability_status,
          response_time: data.response_time,
          avatar: data.avatar || '',
          awards: data.awards || [],
          slug,
          rating: 0,
          reviews: 0,
          completed_projects: 0,
          active: true,
        });
      
      if (insertError) throw insertError;
      
      await multiStep.clearDraft();
      
      toast({
        title: 'Provider Profile Created!',
        description: 'Welcome to the marketplace. Redirecting to your dashboard...',
      });
      
      setTimeout(() => {
        navigate('/marketplace/provider/dashboard');
      }, 1000);
      
    } catch (err: any) {
      console.error('Provider onboarding error:', err);
      setError(err.message || 'Failed to create provider profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (multiStep.currentStep) {
      case 1:
        return <Step1BasicInfo form={form} />;
      case 2:
        return <Step2ProfessionalDetails form={form} />;
      case 3:
        return <Step3Services form={form} />;
      case 4:
        return <Step4Availability form={form} />;
      default:
        return null;
    }
  };
  
  const progressPercentage = Math.round((multiStep.currentStep / multiStep.totalSteps) * 100);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Become a Service Provider</CardTitle>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {multiStep.currentStep} of {multiStep.totalSteps}</span>
              <span>{`${(5 - multiStep.currentStep) * 2} min remaining`}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          {multiStep.lastSaved && (
            <p className="text-xs text-muted-foreground">
              {multiStep.isSaving ? 'Saving draft...' : `Last saved: ${multiStep.lastSaved.toLocaleTimeString()}`}
            </p>
          )}
        </CardHeader>
        
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {renderStep()}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={multiStep.prevStep}
                disabled={multiStep.isFirstStep || isSubmitting}
              >
                Previous
              </Button>
              
              {multiStep.isLastStep ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Profile...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                  Next
                </Button>
              )}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};
