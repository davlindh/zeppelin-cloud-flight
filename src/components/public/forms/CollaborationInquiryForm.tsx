import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseSubmissionForm, BaseSubmissionData } from './BaseSubmissionForm';
import { useSubmission, FileSubmission } from '@/hooks/useSubmission';

export interface CollaborationFormData extends BaseSubmissionData {
  // Collaboration-specific fields
  collaborationType: 'artist' | 'researcher' | 'community' | 'business' | 'other';
  collaborationTitle: string;
  collaborationDescription: string;
  expectedDuration: string;
  proposedCollaboration?: string;
  resourcesNeeded?: string;
  outcomes?: string;
  references?: File;
}

interface CollaborationInquiryFormProps {
  onClose: () => void;
  className?: string;
}

export const CollaborationInquiryForm: React.FC<CollaborationInquiryFormProps> = ({
  onClose,
  className,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CollaborationFormData>({
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const { isSubmitting, error, submitForm } = useSubmission();
  const [uploadedFiles, setUploadedFiles] = React.useState<{ references?: File }>({});

  // File upload handlers
  const handleFileUpload = (fieldName: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Form submission
  const onSubmit = async (data: CollaborationFormData) => {
    const userId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`; // Temporary ID until we have proper user auth
    const submissionId = `collab-${Date.now()}`;

    const files: FileSubmission[] = [];

    if (uploadedFiles.references) {
      files.push({
        fieldName: 'references',
        file: uploadedFiles.references,
        bucketName: 'documents',
        uploadContext: {
          uploader: 'user',
          userId,
          submissionId
        }
      });
    }

    const payload = {
      type: 'collaboration' as const,
      title: `${data.collaborationTitle} - ${data.collaborationType} Collaboration`,
      content: {
        // Required fields for database constraint
        collaboration_type: data.collaborationType,
        availability: data.availability,
        // Contact info
        contact_info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          website: data.website,
        },
        collaboration_info: {
          collaborationType: data.collaborationType,
          title: data.collaborationTitle,
          description: data.collaborationDescription,
          expectedDuration: data.expectedDuration,
          proposedCollaboration: data.proposedCollaboration,
          resourcesNeeded: data.resourcesNeeded,
          outcomes: data.outcomes,
        },
        additional_info: {
          motivation: data.motivation,
          experience: data.experience,
          availability: data.availability,
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

    await submitForm('collaboration', payload, files);
  };

  return (
    <BaseSubmissionForm
      onClose={onClose}
      title="Propose Collaboration"
      icon="collaboration"
      className={className}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      error={error}
    >
      <div className="space-y-6">
        {/* Contact Information */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Collaboration Details */}
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="collaborationType">Collaboration Type *</Label>
            <Select
              value={watch('collaborationType')}
              onValueChange={(value: CollaborationFormData['collaborationType']) => setValue('collaborationType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collaboration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artist">Artist/Artistic Project</SelectItem>
                <SelectItem value="researcher">Research/Academic</SelectItem>
                <SelectItem value="community">Community Project</SelectItem>
                <SelectItem value="business">Business/Commercial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborationTitle">Collaboration Title *</Label>
            <Input
              id="collaborationTitle"
              {...register('collaborationTitle', { required: 'Title is required' })}
              placeholder="Enter collaboration title"
            />
            {errors.collaborationTitle && (
              <p className="text-sm text-destructive">{errors.collaborationTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborationDescription">Collaboration Description *</Label>
            <Textarea
              id="collaborationDescription"
              {...register('collaborationDescription', { required: 'Description is required' })}
              placeholder="Describe your proposed collaboration..."
              rows={4}
            />
            {errors.collaborationDescription && (
              <p className="text-sm text-destructive">{errors.collaborationDescription.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDuration">Expected Duration</Label>
              <Select
                value={watch('expectedDuration')}
                onValueChange={(value) => setValue('expectedDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="long-term">Long-term partnership</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Your Relevant Experience</Label>
              <Textarea
                id="experience"
                {...register('experience')}
                placeholder="Relevant experience or background..."
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to collaborate with Zeppel Inn? *</Label>
            <Textarea
              id="motivation"
              {...register('motivation', { required: 'Motivation is required' })}
              placeholder="What interests you about collaborating with us?"
              rows={3}
            />
            {errors.motivation && (
              <p className="text-sm text-destructive">{errors.motivation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedCollaboration">Proposed Collaboration Details</Label>
            <Textarea
              id="proposedCollaboration"
              {...register('proposedCollaboration')}
              placeholder="Specific ideas for how we might collaborate..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourcesNeeded">Resources/Support Needed</Label>
            <Textarea
              id="resourcesNeeded"
              {...register('resourcesNeeded')}
              placeholder="What resources or support do you need?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcomes">Expected Outcomes</Label>
            <Textarea
              id="outcomes"
              {...register('outcomes')}
              placeholder="What outcomes do you hope to achieve?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Textarea
              id="availability"
              {...register('availability')}
              placeholder="When are you available to begin and participate?"
              rows={2}
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
                I agree to the terms of collaboration and partnership.
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
                Optional: Receive updates about Zeppel Inn activities.
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
              <Label htmlFor="newsletterSubscription" className="text-sm font-medium leading-none">
                Subscribe to our newsletter
              </Label>
              <p className="text-xs text-muted-foreground">
                Optional: Stay updated with our latest news and announcements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseSubmissionForm>
  );
};
