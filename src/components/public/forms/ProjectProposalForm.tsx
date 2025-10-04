import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { StandardFormField, FieldOption } from '@/components/ui/standard-form-field';
import { useSubmission, FileSubmission } from '@/hooks/useSubmission';

const projectFormSchema = z.object({
  // Contact Information
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Project Information
  projectTitle: z.string().min(1, 'Project title is required'),
  projectDescription: z.string().min(1, 'Project description is required'),
  projectCategory: z.string().min(1, 'Project category is required'),
  expectedImpact: z.string().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  budget: z.string().optional(),

  // Additional Information
  motivation: z.string().min(1, 'Motivation is required'),
  experience: z.string().optional(),
  availability: z.string().optional(),

  // Consent
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  acceptMarketing: z.boolean().optional(),
  newsletterSubscription: z.boolean().optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectProposalFormProps {
  onClose: () => void;
  className?: string;
}

const projectCategoryOptions: FieldOption[] = [
  { value: 'art', label: 'Art & Culture' },
  { value: 'technology', label: 'Technology' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'education', label: 'Education' },
  { value: 'community', label: 'Community' },
  { value: 'research', label: 'Research' },
  { value: 'innovation', label: 'Innovation' },
];

export const ProjectProposalForm: React.FC<ProjectProposalFormProps> = ({
  onClose,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ portfolio?: File; references?: File }>({});

  const { isSubmitting, error, submitForm } = useSubmission();

  const totalSteps = 4;

  // File upload handlers
  const handleFileUpload = (fieldName: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Step navigation
  const nextStep = async (form: any) => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (data: ProjectFormData) => {
    const userId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`; // Temporary ID until we have proper user auth
    const submissionId = `project-${Date.now()}`;

    const files: FileSubmission[] = [];

    if (uploadedFiles.portfolio) {
      files.push({
        fieldName: 'portfolio',
        file: uploadedFiles.portfolio,
        bucketName: 'documents',
        uploadContext: {
          uploader: 'project-owner',
          userId,
          submissionId
        }
      });
    }
    if (uploadedFiles.references) {
      files.push({
        fieldName: 'references',
        file: uploadedFiles.references,
        bucketName: 'documents',
        uploadContext: {
          uploader: 'project-owner',
          userId,
          submissionId
        }
      });
    }

    const payload = {
      type: 'project' as const,
      title: data.projectTitle,
      content: {
        contact_info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          website: data.website,
        },
        project_info: {
          title: data.projectTitle,
          description: data.projectDescription,
          category: data.projectCategory,
          expectedImpact: data.expectedImpact,
          timeline: data.timeline,
          budget: data.budget,
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

    await submitForm('project', payload, files);
  };

  const renderStepContent = (form: any) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <StandardFormField
              form={form}
              name="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              required
            />
          </div>
        );

      case 2:
        return (
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

            <StandardFormField
              form={form}
              name="website"
              label="Website/Social Media"
              type="url"
              placeholder="https://your-website.com"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <StandardFormField
              form={form}
              name="projectTitle"
              label="Project Title"
              type="text"
              placeholder="Enter your project title"
              required
            />

            <StandardFormField
              form={form}
              name="projectDescription"
              label="Project Description"
              type="textarea"
              placeholder="Describe your project in detail..."
              rows={5}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandardFormField
                form={form}
                name="projectCategory"
                label="Project Category"
                type="select"
                placeholder="Select category"
                options={projectCategoryOptions}
                required
              />

              <StandardFormField
                form={form}
                name="timeline"
                label="Timeline"
                type="text"
                placeholder="e.g., 3-6 months"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandardFormField
                form={form}
                name="budget"
                label="Budget Estimate"
                type="text"
                placeholder="e.g., €50,000"
              />

              <StandardFormField
                form={form}
                name="expectedImpact"
                label="Expected Impact"
                type="text"
                placeholder="Impact on community/regions"
              />
            </div>

            <StandardFormField
              form={form}
              name="motivation"
              label="Project Motivation"
              type="textarea"
              placeholder="Why do you want to develop this project at Zeppel Inn?"
              rows={3}
              required
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <StandardFormField
              form={form}
              name="experience"
              label="Relevant Experience"
              type="textarea"
              placeholder="Describe your relevant experience..."
              rows={3}
            />

            <StandardFormField
              form={form}
              name="availability"
              label="Team/Project Availability"
              type="textarea"
              placeholder="When is your team available to participate?"
              rows={2}
            />

            {/* Terms and Consent */}
            <div className="space-y-3 border-t pt-4">
              <StandardFormField
                form={form}
                name="acceptTerms"
                label="I accept the Terms and Conditions"
                type="checkbox"
                placeholder="I agree to the terms of participation and code of conduct."
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
                placeholder="Optional: Receive updates about future events and opportunities."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormWrapper
      title="Submit Project Proposal"
      icon="project"
      onSubmit={onSubmit}
      onClose={onClose}
      schema={projectFormSchema}
      className={className}
      isSubmitting={isSubmitting}
      error={error}
      currentStep={currentStep}
      totalSteps={totalSteps}
      defaultValues={{
        acceptTerms: false,
        acceptPrivacy: false,
      }}
    >
      {(form) => (
        <>
          {renderStepContent(form)}

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
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={() => nextStep(form)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  disabled={isSubmitting}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </FormWrapper>
  );
};
