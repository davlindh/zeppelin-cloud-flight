import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/admin/FileUpload';
import { BaseSubmissionForm, BaseSubmissionData } from './BaseSubmissionForm';
import { useSubmission, FileSubmission } from '@/hooks/useSubmission';
import { useToast } from '@/hooks/use-toast';

export interface ParticipantFormData extends BaseSubmissionData {
  // Participant-specific fields
  bio?: string;
  description?: string;
  skills?: string;
  roles?: string;
  cv?: File;
  portfolio?: File;
  specialRequirements?: string;
}

interface ParticipantApplicationFormProps {
  onClose: () => void;
  className?: string;
}

export const ParticipantApplicationForm: React.FC<ParticipantApplicationFormProps> = ({
  onClose,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ cv?: File; portfolio?: File }>({});

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<ParticipantFormData>({
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const { isSubmitting, error, submitForm } = useSubmission();
  const { toast } = useToast();

  const totalSteps = 3;

  // File upload handlers
  // File upload handlers
  const handleFileUpload = (fieldName: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Step navigation
  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent any form submission
    
    // Validate only the current step's fields
    let fieldsToValidate: (keyof ParticipantFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['email'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['firstName', 'lastName'];
    }
    
    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate)
      : true;
      
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Helper functions
  const generateSubmissionId = () => {
    const userId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    return { userId, submissionId: `participant-${Date.now()}` };
  };

  const prepareFiles = (userId: string, submissionId: string): FileSubmission[] => {
    const files: FileSubmission[] = [];

    if (uploadedFiles.cv) {
      files.push({
        fieldName: 'cv',
        file: uploadedFiles.cv,
        bucketName: 'documents',
        uploadContext: {
          uploader: 'participant',
          userId,
          submissionId
        }
      });
    }
    if (uploadedFiles.portfolio) {
      files.push({
        fieldName: 'portfolio',
        file: uploadedFiles.portfolio,
        bucketName: 'documents',
        uploadContext: {
          uploader: 'participant',
          userId,
          submissionId
        }
      });
    }

    return files;
  };

  const preparePayload = (data: ParticipantFormData) => {
    return {
      type: 'participant' as const,
      title: `${data.firstName} ${data.lastName} - Participant Application`,
      content: {
        // Top-level fields as expected by database validation
        bio: data.bio,
        description: data.bio || '',
        skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
        roles: data.roles?.split(',').map(r => r.trim()).filter(Boolean) || [],

        // Nested structure as expected by TypeScript interface
        contact_info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          website: data.website,
        },
        additional_info: {
          motivation: data.motivation,
          experience: data.experience,
          availability: data.availability,
          specialRequirements: data.specialRequirements,
        },
        consent: {
          terms: data.acceptTerms,
          privacy: data.acceptPrivacy,
          marketing: data.acceptMarketing,
          newsletter: data.newsletterSubscription,
        },
      },
      contact_email: data.email,
      contact_phone: data.phone,
    };
  };

  // Form submission
  const onSubmit = async (data: ParticipantFormData) => {
    try {
      const { userId, submissionId } = generateSubmissionId();
      const files = prepareFiles(userId, submissionId);
      const payload = preparePayload(data);

      console.log('Submitting participant application:', { payload, fileCount: files.length });

      await submitForm('participant', payload, files);
      
      // Show success message
      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll review it soon.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+46 123 456 789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization/Institution</Label>
              <Input
                id="organization"
                {...register('organization')}
                placeholder="Your organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website/Social Media</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio/About Me *</Label>
              <Textarea
                id="bio"
                {...register('bio', { required: 'Bio is required' })}
                placeholder="Tell us about yourself, your background, and what you're passionate about..."
                rows={4}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated) *</Label>
                <Input
                  id="skills"
                  {...register('skills', { required: 'Skills are required' })}
                  placeholder="e.g., Photography, Video Editing, Project Management"
                />
                {errors.skills && (
                  <p className="text-sm text-destructive">{errors.skills.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roles">Roles/Expertise (comma-separated) *</Label>
                <Input
                  id="roles"
                  {...register('roles', { required: 'Roles/Expertise are required' })}
                  placeholder="e.g., Artist, Technician, Coordinator"
                />
                {errors.roles && (
                  <p className="text-sm text-destructive">{errors.roles.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to participate in the residency? *</Label>
              <Textarea
                id="motivation"
                {...register('motivation', { required: 'Motivation is required' })}
                placeholder="Tell us about your motivation to participate..."
                rows={4}
              />
              {errors.motivation && (
                <p className="text-sm text-destructive">{errors.motivation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Relevant Experience</Label>
              <Textarea
                id="experience"
                {...register('experience')}
                placeholder="Describe your relevant experience..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                {...register('availability')}
                placeholder="When are you available to participate?"
                rows={2}
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <Label>Supporting Documents</Label>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">CV/Resume</Label>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload('cv', file)}
                  bucketName="documents"
                  acceptedTypes=".pdf,.doc,.docx"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Portfolio/Examples</Label>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload('portfolio', file)}
                  bucketName="documents"
                  acceptedTypes="image/*,.pdf"
                />
              </div>
            </div>

            {/* Terms and Consent */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...register('acceptTerms', { required: 'You must accept the terms' })}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none">
                    I accept the Terms and Conditions *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I agree to the terms of participation and code of conduct.
                  </p>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  {...register('acceptPrivacy', { required: 'You must accept the privacy policy' })}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptPrivacy" className="text-sm font-medium leading-none">
                    I accept the Privacy Policy *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I consent to the collection and processing of my personal data.
                  </p>
                </div>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-sm text-destructive">{errors.acceptPrivacy.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptMarketing"
                  {...register('acceptMarketing')}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptMarketing" className="text-sm font-medium leading-none">
                    I agree to receive marketing communications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optional: Receive updates about future events and opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseSubmissionForm
      onClose={onClose}
      title="Join as Participant"
      currentStep={currentStep}
      totalSteps={totalSteps}
      icon="participant"
      className={className}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      error={error}
    >
      {renderStep()}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>

        <div>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-md"
              disabled={isSubmitting}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </BaseSubmissionForm>
  );
};
