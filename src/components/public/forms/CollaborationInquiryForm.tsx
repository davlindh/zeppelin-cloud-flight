import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { StandardFormField, FieldOption } from '@/components/ui/standard-form-field';
import { useSubmission, FileSubmission } from '@/hooks/useSubmission';

const collaborationFormSchema = z.object({
  // Contact Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Collaboration Details
  collaborationType: z.enum(['artist', 'researcher', 'community', 'business', 'other']),
  collaborationTitle: z.string().min(1, 'Collaboration title is required'),
  collaborationDescription: z.string().min(1, 'Collaboration description is required'),
  expectedDuration: z.string().min(1, 'Expected duration is required'),
  proposedCollaboration: z.string().optional(),
  resourcesNeeded: z.string().optional(),
  outcomes: z.string().optional(),
  motivation: z.string().min(1, 'Motivation is required'),
  experience: z.string().optional(),
  availability: z.string().optional(),

  // Consent
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  acceptMarketing: z.boolean().optional(),
  newsletterSubscription: z.boolean().optional(),
});

export type CollaborationFormData = z.infer<typeof collaborationFormSchema>;

interface CollaborationInquiryFormProps {
  onClose: () => void;
  className?: string;
}

const collaborationTypeOptions: FieldOption[] = [
  { value: 'artist', label: 'Artist/Artistic Project' },
  { value: 'researcher', label: 'Research/Academic' },
  { value: 'community', label: 'Community Project' },
  { value: 'business', label: 'Business/Commercial' },
  { value: 'other', label: 'Other' },
];

const expectedDurationOptions: FieldOption[] = [
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6-12 months', label: '6-12 months' },
  { value: '1-2 years', label: '1-2 years' },
  { value: 'long-term', label: 'Long-term partnership' },
  { value: 'flexible', label: 'Flexible' },
];

export const CollaborationInquiryForm: React.FC<CollaborationInquiryFormProps> = ({
  onClose,
  className,
}) => {
  const { isSubmitting, error, submitForm } = useSubmission();
  const [uploadedFiles, setUploadedFiles] = useState<{ references?: File }>({});

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
    <FormWrapper
      title="Propose Collaboration"
      icon="collaboration"
      onSubmit={onSubmit}
      onClose={onClose}
      schema={collaborationFormSchema}
      className={className}
      isSubmitting={isSubmitting}
      error={error}
      defaultValues={{
        acceptTerms: false,
        acceptPrivacy: false,
      }}
    >
      {(form) => (
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandardFormField
                form={form}
                name="firstName"
                label="First Name"
                type="text"
                placeholder="John"
                required
              />

              <StandardFormField
                form={form}
                name="lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                required
              />
            </div>

            <StandardFormField
              form={form}
              name="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandardFormField
                form={form}
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+46 123 456 789"
              />

              <StandardFormField
                form={form}
                name="organization"
                label="Organization/Institution"
                type="text"
                placeholder="Your organization"
              />
            </div>

            <StandardFormField
              form={form}
              name="website"
              label="Website/Social Media"
              type="url"
              placeholder="https://your-website.com"
            />
          </div>

          {/* Collaboration Details */}
          <div className="space-y-4 border-t pt-4">
            <StandardFormField
              form={form}
              name="collaborationType"
              label="Collaboration Type"
              type="select"
              placeholder="Select collaboration type"
              options={collaborationTypeOptions}
              required
            />

            <StandardFormField
              form={form}
              name="collaborationTitle"
              label="Collaboration Title"
              type="text"
              placeholder="Enter collaboration title"
              required
            />

            <StandardFormField
              form={form}
              name="collaborationDescription"
              label="Collaboration Description"
              type="textarea"
              placeholder="Describe your proposed collaboration..."
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandardFormField
                form={form}
                name="expectedDuration"
                label="Expected Duration"
                type="select"
                placeholder="Select duration"
                options={expectedDurationOptions}
                required
              />

              <StandardFormField
                form={form}
                name="experience"
                label="Your Relevant Experience"
                type="textarea"
                placeholder="Relevant experience or background..."
                rows={2}
              />
            </div>

            <StandardFormField
              form={form}
              name="motivation"
              label="Why do you want to collaborate with Zeppel Inn?"
              type="textarea"
              placeholder="What interests you about collaborating with us?"
              rows={3}
              required
            />

            <StandardFormField
              form={form}
              name="proposedCollaboration"
              label="Proposed Collaboration Details"
              type="textarea"
              placeholder="Specific ideas for how we might collaborate..."
              rows={3}
            />

            <StandardFormField
              form={form}
              name="resourcesNeeded"
              label="Resources/Support Needed"
              type="textarea"
              placeholder="What resources or support do you need?"
              rows={2}
            />

            <StandardFormField
              form={form}
              name="outcomes"
              label="Expected Outcomes"
              type="textarea"
              placeholder="What outcomes do you hope to achieve?"
              rows={2}
            />

            <StandardFormField
              form={form}
              name="availability"
              label="Availability"
              type="textarea"
              placeholder="When are you available to begin and participate?"
              rows={2}
            />
          </div>

          {/* Terms and Consent */}
          <div className="space-y-3 border-t pt-4">
            <StandardFormField
              form={form}
              name="acceptTerms"
              label="I accept the Terms and Conditions"
              type="checkbox"
              placeholder="I agree to the terms of collaboration and partnership."
              required
            />

            <StandardFormField
              form={form}
              name="acceptPrivacy"
              label="I accept the Privacy Policy"
              type="checkbox"
              placeholder="I consent to the collection and processing of my personal data."
              required
            />

            <StandardFormField
              form={form}
              name="acceptMarketing"
              label="I agree to receive marketing communications"
              type="checkbox"
              placeholder="Optional: Receive updates about Zeppel Inn activities."
            />

            <StandardFormField
              form={form}
              name="newsletterSubscription"
              label="Subscribe to our newsletter"
              type="checkbox"
              placeholder="Optional: Stay updated with our latest news and announcements."
            />
          </div>
        </div>
      )}
    </FormWrapper>
  );
};
