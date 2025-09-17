import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '../admin/FileUpload';
import { X, Plus, Upload, User, Building, Lightbulb } from 'lucide-react';

// Comprehensive Submission Form Component with Context7 Best Practices
// Features: Multi-step form, validation, file uploads, accessibility, progress tracking

interface SubmissionFormData {
  type: 'participant' | 'project' | 'sponsor' | 'collaboration';
  // Personal/Contact Information
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  organization?: string;
  website?: string;
  // Project Information
  projectTitle?: string;
  projectDescription?: string;
  projectCategory?: string;
  expectedImpact?: string;
  timeline?: string;
  budget?: string;
  // Additional Information
  motivation?: string;
  experience?: string;
  availability?: string;
  specialRequirements?: string;
  // Media and Files
  portfolio?: string;
  cv?: string;
  references?: string;
  // Terms and Consent
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
  newsletterSubscription?: boolean;
}

interface ComprehensiveSubmissionFormProps {
  onClose: () => void;
  initialType?: 'participant' | 'project' | 'sponsor' | 'collaboration';
  className?: string;
}

const ComprehensiveSubmissionForm: React.FC<ComprehensiveSubmissionFormProps> = ({
  onClose,
  initialType = 'participant',
  className,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<SubmissionFormData>({
    defaultValues: {
      type: initialType,
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const selectedType = watch('type');
  const totalSteps = selectedType === 'participant' ? 4 : selectedType === 'project' ? 5 : 3;

  // File upload handlers
  const handleFileUpload = (fieldName: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const uploadFile = async (file: File, bucketName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  // Step navigation
  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (data: SubmissionFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Upload files
      const fileUploads = await Promise.all(
        Object.entries(uploadedFiles).map(async ([fieldName, file]) => {
          const bucketName = fieldName === 'cv' ? 'cvs' : fieldName === 'portfolio' ? 'portfolios' : 'documents';
          const url = await uploadFile(file, bucketName);
          return { fieldName, url };
        })
      );

      // Prepare submission data according to Supabase schema
      const submissionData = {
        type: data.type,
        title: data.type === 'project' ? data.projectTitle : `${data.type} submission`,
        content: {
          contact_info: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            organization: data.organization,
            website: data.website,
          },
          project_info: data.type === 'project' ? {
            title: data.projectTitle,
            description: data.projectDescription,
            category: data.projectCategory,
            expectedImpact: data.expectedImpact,
            timeline: data.timeline,
            budget: data.budget,
          } : null,
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
        contact_phone: data.phone || null,
        session_id: sessionStorage.getItem('session_id'),
        user_agent: navigator.userAgent,
        language_preference: navigator.language,
        how_found_us: 'website',
        publication_permission: data.acceptMarketing || false,
        files: fileUploads.reduce((acc, { fieldName, url }) => {
          if (url) acc[fieldName] = url;
          return acc;
        }, {} as Record<string, string>),
      };

      // Submit to Supabase
      const { error: submitError } = await supabase
        .from('submissions')
        .insert(submissionData);

      if (submitError) throw submitError;

      toast({
        title: 'Submission Successful!',
        description: 'Thank you for your submission. We will review it and get back to you soon.',
        variant: 'success',
      });

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      setError(errorMessage);

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const ProgressIndicator = () => (
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-auto ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedType === 'participant' && <User className="h-5 w-5" />}
              {selectedType === 'project' && <Lightbulb className="h-5 w-5" />}
              {selectedType === 'sponsor' && <Building className="h-5 w-5" />}
              {selectedType === 'collaboration' && <Plus className="h-5 w-5" />}
              {selectedType === 'participant' && 'Join as Participant'}
              {selectedType === 'project' && 'Submit Project Proposal'}
              {selectedType === 'sponsor' && 'Become a Sponsor'}
              {selectedType === 'collaboration' && 'Propose Collaboration'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <ProgressIndicator />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">What would you like to submit?</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value: SubmissionFormData['type']) => setValue('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Join as Participant
                        </div>
                      </SelectItem>
                      <SelectItem value="project">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Submit Project Proposal
                        </div>
                      </SelectItem>
                      <SelectItem value="sponsor">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Become a Sponsor
                        </div>
                      </SelectItem>
                      <SelectItem value="collaboration">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Propose Collaboration
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
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
                  <Label htmlFor="organization">Organization/Company</Label>
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
            )}

            {/* Step 3: Project Information (for project submissions) */}
            {currentStep === 3 && selectedType === 'project' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    {...register('projectTitle', { required: 'Project title is required' })}
                    placeholder="Enter your project title"
                  />
                  {errors.projectTitle && (
                    <p className="text-sm text-destructive">{errors.projectTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description *</Label>
                  <Textarea
                    id="projectDescription"
                    {...register('projectDescription', { required: 'Project description is required' })}
                    placeholder="Describe your project in detail..."
                    rows={4}
                  />
                  {errors.projectDescription && (
                    <p className="text-sm text-destructive">{errors.projectDescription.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectCategory">Category</Label>
                    <Select onValueChange={(value) => setValue('projectCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="sustainability">Sustainability</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      {...register('timeline')}
                      placeholder="e.g., 3-6 months"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {(currentStep === 3 || (currentStep === 4 && selectedType === 'project')) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivation *</Label>
                  <Textarea
                    id="motivation"
                    {...register('motivation', { required: 'Motivation is required' })}
                    placeholder="Why do you want to participate/join this project?"
                    rows={3}
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
                    placeholder="Tell us about your relevant experience..."
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
                  <Label>File Uploads</Label>

                  {selectedType === 'participant' && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">CV/Resume</Label>
                      <FileUpload
                        onFileSelect={(file) => handleFileUpload('cv', file)}
                        bucketName="cvs"
                        acceptedTypes=".pdf,.doc,.docx"
                      />
                    </div>
                  )}

                  {(selectedType === 'participant' || selectedType === 'project') && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Portfolio/Examples</Label>
                      <FileUpload
                        onFileSelect={(file) => handleFileUpload('portfolio', file)}
                        bucketName="portfolios"
                        acceptedTypes="image/*,.pdf"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Terms and Consent */}
            {((currentStep === 4 && selectedType !== 'project') || (currentStep === 5 && selectedType === 'project')) && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      {...register('acceptTerms', { required: 'You must accept the terms' })}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                      <Label htmlFor="acceptPrivacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                      <Label htmlFor="acceptMarketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I agree to receive marketing communications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Optional: Receive updates about future events and opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="newsletterSubscription"
                      {...register('newsletterSubscription')}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="newsletterSubscription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Subscribe to our newsletter
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Optional: Stay updated with our latest news and announcements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export { ComprehensiveSubmissionForm };
export type { SubmissionFormData, ComprehensiveSubmissionFormProps };
