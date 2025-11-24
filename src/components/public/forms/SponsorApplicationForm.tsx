// Helper function to extract first and last name from full name
const extractFirstLastName = (fullName: string) => {
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
};

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { StandardFormField, FieldOption } from '@/components/ui/standard-form-field';
import { useSubmission } from '@/hooks/useSubmission';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

const sponsorFormSchema = z.object({
  // Contact Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  sponsorType: z.enum(['individual', 'company', 'foundation']),
  organization: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Sponsorship Details
  sponsorshipLevel: z.string().optional(),
  motivation: z.string().min(1, 'Motivation is required'),
  interests: z.string().optional(),
  previousSponsorships: z.string().optional(),
  specialRequirements: z.string().optional(),
  experience: z.string().optional(),
  availability: z.string().optional(),

  // Consent
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  acceptMarketing: z.boolean().optional(),
  newsletterSubscription: z.boolean().optional(),
});

export type SponsorFormData = z.infer<typeof sponsorFormSchema>;

interface SponsorApplicationFormProps {
  onClose: () => void;
  className?: string;
}

const sponsorTypeOptions: FieldOption[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'foundation', label: 'Foundation' },
];

const sponsorshipLevelOptions: FieldOption[] = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'custom', label: 'Custom' },
];

export const SponsorApplicationForm: React.FC<SponsorApplicationFormProps> = ({
  onClose,
  className,
}) => {
  const { isSubmitting, error, submitForm } = useSubmission();
  const { data: authenticatedUser } = useAuthenticatedUser();

  const onSubmit = async (data: SponsorFormData) => {
    const payload = {
      type: 'sponsor' as const,
      title: `${data.firstName} ${data.lastName} - ${data.sponsorType} Sponsorship`,
      content: {
        contact_info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          website: data.website,
        },
        sponsor_info: {
          sponsorType: data.sponsorType,
          sponsorshipLevel: data.sponsorshipLevel,
          interests: data.interests,
          previousSponsorships: data.previousSponsorships,
          specialRequirements: data.specialRequirements,
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
        // Link to authenticated user if signed in
        auth_user_id: authenticatedUser?.id || null,
        user_info: authenticatedUser ? {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          full_name: authenticatedUser.full_name,
          phone: authenticatedUser.phone
        } : null
      },
      contact_email: data.email,
      contact_phone: data.phone,
    };

    await submitForm('sponsor', payload, []);
  };

  // Generate default values based on authentication status
  const getDefaultValues = () => {
    if (authenticatedUser) {
      const { firstName, lastName } = extractFirstLastName(authenticatedUser.full_name || '');
      return {
        firstName: firstName || '',
        lastName: lastName || '',
        email: authenticatedUser.email || '',
        phone: authenticatedUser.phone || '',
        acceptTerms: false,
        acceptPrivacy: false,
      };
    }
    return {
      acceptTerms: false,
      acceptPrivacy: false,
    };
  };

  return (
    <FormWrapper
      title="Become a Sponsor"
      icon="sponsor"
      onSubmit={onSubmit}
      onClose={onClose}
      schema={sponsorFormSchema}
      className={className}
      isSubmitting={isSubmitting}
      error={error}
      defaultValues={getDefaultValues()}
    >
      {(form) => (
        <div className="space-y-6">
          {/* Authenticated User Indicator */}
          {authenticatedUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Signed in as {authenticatedUser.email}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Your application will be automatically linked to your account for tracking and follow-up.
              </p>
              <p className="text-xs text-green-700">
                Email field is locked to your account email for security.
              </p>
            </div>
          )}

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

            <div className="relative">
              <StandardFormField
                form={form}
                name="email"
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                required
              />
              {authenticatedUser && (
                <div className="absolute right-3 top-8">
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Locked to your account
                  </span>
                </div>
              )}
            </div>

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
                name="sponsorType"
                label="Sponsor Type"
                type="select"
                placeholder="Select type"
                options={sponsorTypeOptions}
                required
              />
            </div>

            {form.watch('sponsorType') === 'company' && (
              <StandardFormField
                form={form}
                name="organization"
                label="Company/Organization"
                type="text"
                placeholder="Company Name"
                required
              />
            )}

            <StandardFormField
              form={form}
              name="website"
              label="Website"
              type="url"
              placeholder="https://your-website.com"
            />
          </div>

          {/* Sponsorship Details */}
          <div className="space-y-4 border-t pt-4">
            <StandardFormField
              form={form}
              name="sponsorshipLevel"
              label="Sponsorship Level Interest"
              type="select"
              placeholder="Select level (optional)"
              options={sponsorshipLevelOptions}
            />

            <StandardFormField
              form={form}
              name="motivation"
              label="Why do you want to sponsor Zeppel Inn?"
              type="textarea"
              placeholder="Tell us about your interest in sponsoring..."
              rows={3}
              required
            />

            <StandardFormField
              form={form}
              name="interests"
              label="Specific Areas of Interest"
              type="textarea"
              placeholder="Art, technology, sustainability, community development..."
              rows={2}
            />

            <StandardFormField
              form={form}
              name="experience"
              label="Previous Sponsorship Experience"
              type="textarea"
              placeholder="Previous sponsorships or charitable activities..."
              rows={2}
            />

            <StandardFormField
              form={form}
              name="availability"
              label="Availability for Partnership Activities"
              type="textarea"
              placeholder="When are you available to participate in activities?"
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
              placeholder="I agree to the terms of sponsorship and partnership."
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
