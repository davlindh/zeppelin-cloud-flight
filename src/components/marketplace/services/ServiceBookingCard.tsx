
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, MessageSquare, CheckCircle } from 'lucide-react';
import { EnhancedDateTimeSelection } from './booking/EnhancedDateTimeSelection';
import { ServiceCustomization } from './booking/ServiceCustomization';
import { ContactInformation } from './booking/ContactInformation';
import { BookingReview } from './booking/BookingReview';
import { BookingProgressSteps } from './booking/BookingProgressSteps';
import { BookingNavigation } from './booking/BookingNavigation';
import { CommunicationTracker } from '@/components/communication/CommunicationTracker';
import { useService } from '@/hooks/useService';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useAvailableTimes } from '@/hooks/useAvailableTimes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { bookingFormSchema, stepValidationSchemas, type BookingFormData } from '@/schemas/booking.schema';
import { z } from 'zod';

interface ServiceBookingCardProps {
  serviceId: string;
}

export const ServiceBookingCard: React.FC<ServiceBookingCardProps> = ({
  serviceId
}) => {
  const { data: service } = useService(serviceId);
  const { data: authenticatedUser } = useAuthenticatedUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    selectedDate: '',
    selectedTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerMessage: '',
    customizations: {},
    agreedToTerms: false
  });

  // Fetch available times based on selected date
  const { data: availableTimes = [] } = useAvailableTimes({
    serviceId,
    selectedDate: bookingData.selectedDate
  });

  // Auto-fill user information when authenticated user data is available
  useEffect(() => {
    if (authenticatedUser && !bookingData.customerName && !bookingData.customerEmail) {
      console.log('Auto-filling user information:', authenticatedUser);
      setBookingData(prev => ({
        ...prev,
        customerName: authenticatedUser.full_name || '',
        customerEmail: authenticatedUser.email || '',
        customerPhone: authenticatedUser.phone || ''
      }));
    }
  }, [authenticatedUser, bookingData.customerName, bookingData.customerEmail]);

  // Reset selected time when date changes (available times might be different)
  useEffect(() => {
    if (bookingData.selectedTime && availableTimes.length > 0) {
      const isTimeStillAvailable = availableTimes.includes(bookingData.selectedTime);
      if (!isTimeStillAvailable) {
        console.log('Previously selected time no longer available, clearing selection');
        setBookingData(prev => ({ ...prev, selectedTime: '' }));
      }
    }
  }, [availableTimes, bookingData.selectedTime]);

  if (!service) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    { number: 1, title: 'Date & Time', description: 'Choose your preferred slot', icon: Calendar },
    { number: 2, title: 'Customize', description: 'Tailor the service', icon: CheckCircle },
    { number: 3, title: 'Contact Info', description: 'Your details', icon: User },
    { number: 4, title: 'Review', description: 'Confirm booking', icon: MessageSquare }
  ];

  const validateCurrentStep = (): boolean => {
    const stepSchemas = {
      1: stepValidationSchemas.step1,
      2: stepValidationSchemas.step2,
      3: stepValidationSchemas.step3,
      4: stepValidationSchemas.step4
    };

    const schema = stepSchemas[currentStep as keyof typeof stepSchemas];
    if (!schema) return true;

    try {
      schema.parse(bookingData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = <K extends keyof BookingFormData>(
    field: K, 
    value: BookingFormData[K]
  ) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async () => {
    try {
      // Final validation
      const validatedData = bookingFormSchema.parse(bookingData);
      setIsSubmitting(true);

      const { error } = await supabase
        .from('bookings')
        .insert({
          service_id: serviceId,
          user_id: authenticatedUser?.id || null, // Include user_id if authenticated
          selected_date: validatedData.selectedDate,
          selected_time: validatedData.selectedTime,
          customer_name: validatedData.customerName,
          customer_email: validatedData.customerEmail,
          customer_phone: validatedData.customerPhone,
          customer_message: validatedData.customerMessage || '',
          customizations: validatedData.customizations || {},
          agreed_to_terms: validatedData.agreedToTerms,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Successful! 🎉",
        description: `Your booking for ${service.title} has been submitted. You'll receive a confirmation email shortly.`,
      });

      // Reset form
      setBookingData({
        selectedDate: '',
        selectedTime: '',
        customerName: authenticatedUser?.full_name || '',
        customerEmail: authenticatedUser?.email || '',
        customerPhone: authenticatedUser?.phone || '',
        customerMessage: '',
        customizations: {},
        agreedToTerms: false
      });
      setCurrentStep(1);
      setValidationErrors({});

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors and try again.",
          variant: "destructive"
        });
      } else {
        console.error('Booking submission error:', error);
        toast({
          title: "Booking Failed",
          description: error.message || "There was an error submitting your booking. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = React.useMemo(() => {
    const stepSchemas = {
      1: stepValidationSchemas.step1,
      2: stepValidationSchemas.step2,
      3: stepValidationSchemas.step3,
      4: stepValidationSchemas.step4
    } as const;
    const schema = stepSchemas[currentStep as keyof typeof stepSchemas];
    if (!schema) return true;
    return schema.safeParse(bookingData).success;
  }, [bookingData, currentStep]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EnhancedDateTimeSelection
            serviceId={serviceId}
            selectedDate={bookingData.selectedDate}
            selectedTime={bookingData.selectedTime}
            availableTimes={availableTimes}
            onDateChange={(date) => handleInputChange('selectedDate', date)}
            onTimeChange={(time) => handleInputChange('selectedTime', time)}
            errors={{
              selectedDate: validationErrors.selectedDate,
              selectedTime: validationErrors.selectedTime
            }}
          />
        );
      
      case 2:
        return (
          <ServiceCustomization
            customizationOptions={service.customizationOptions || []}
            customizations={bookingData.customizations || {}}
            onCustomizationChange={(field, value) => {
              handleInputChange('customizations', { 
                ...bookingData.customizations, 
                [field]: value 
              });
            }}
          />
        );
      
      case 3:
        return (
          <ContactInformation
            contactInfo={{
              name: bookingData.customerName,
              email: bookingData.customerEmail,
              phone: bookingData.customerPhone,
              message: bookingData.customerMessage || ''
            }}
            onContactInfoChange={(field, value) => {
              const fieldMap = {
                name: 'customerName',
                email: 'customerEmail',
                phone: 'customerPhone',
                message: 'customerMessage'
              } as const;
              
              const mappedField = fieldMap[field as keyof typeof fieldMap];
              if (mappedField) {
                handleInputChange(mappedField, value);
              }
            }}
            errors={{
              name: validationErrors.customerName,
              email: validationErrors.customerEmail,
              phone: validationErrors.customerPhone,
              message: validationErrors.customerMessage
            }}
          />
        );
      
      case 4:
        return (
          <BookingReview
            service={{
              title: service.title,
              provider: service.provider,
              duration: service.duration,
              startingPrice: service.startingPrice
            }}
            selectedDate={bookingData.selectedDate}
            selectedTime={bookingData.selectedTime}
            customizations={bookingData.customizations || {}}
            contactInfo={{
              name: bookingData.customerName,
              email: bookingData.customerEmail,
              phone: bookingData.customerPhone,
              message: bookingData.customerMessage || ''
            }}
            agreedToTerms={bookingData.agreedToTerms}
            onTermsChange={(agreed) => handleInputChange('agreedToTerms', agreed)}
            errors={{
              agreedToTerms: validationErrors.agreedToTerms || ''
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Book {service.title}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Complete your booking in {steps.length} simple steps
              {authenticatedUser && (
                <span className="ml-2 text-primary font-medium">
                  • Signed in as {authenticatedUser.email}
                </span>
              )}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Progress Steps */}
        <BookingProgressSteps
          steps={steps}
          currentStep={currentStep}
        />

        {/* Current Step Content */}
        <div className="min-h-[400px] bg-gradient-to-br from-background to-muted/20 rounded-lg p-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <BookingNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          canProceed={canProceed}
          agreedToTerms={bookingData.agreedToTerms}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onConfirm={handleSubmitBooking}
        />

        {/* Communication Tracker */}
        <div className="border-t pt-6">
          <CommunicationTracker />
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceBookingCard;
