import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseSubmissionForm, BaseSubmissionData } from './BaseSubmissionForm';
import { useSubmission } from '@/hooks/useSubmission';

export interface SponsorFormData extends BaseSubmissionData {
  // Sponsor-specific fields
  sponsorType: 'individual' | 'company' | 'foundation';
  sponsorshipLevel?: string;
  interests?: string;
  previousSponsorships?: string;
  specialRequirements?: string;
}

interface SponsorApplicationFormProps {
  onClose: () => void;
  className?: string;
}

export const SponsorApplicationForm: React.FC<SponsorApplicationFormProps> = ({
  onClose,
  className,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SponsorFormData>({
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const { isSubmitting, error, submitForm } = useSubmission();

  // Form submission
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
      },
      contact_email: data.email,
      contact_phone: data.phone,
    };

    await submitForm('sponsor', payload, []);
  };

  return (
    <BaseSubmissionForm
      onClose={onClose}
      title="Become a Sponsor"
      icon="sponsor"
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
              <Label htmlFor="sponsorType">Sponsor Type *</Label>
              <Select
                value={watch('sponsorType')}
                onValueChange={(value: SponsorFormData['sponsorType']) => setValue('sponsorType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {watch('sponsorType') === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="organization">Company/Organization *</Label>
              <Input
                id="organization"
                {...register('organization', { required: 'Organization is required for companies' })}
                placeholder="Company Name"
              />
              {errors.organization && (
                <p className="text-sm text-destructive">{errors.organization.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website')}
              placeholder="https://your-website.com"
            />
          </div>
        </div>

        {/* Sponsorship Details */}
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="sponsorshipLevel">Sponsorship Level Interest</Label>
            <Select
              value={watch('sponsorshipLevel')}
              onValueChange={(value) => setValue('sponsorshipLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to sponsor Zeppel Inn? *</Label>
            <Textarea
              id="motivation"
              {...register('motivation', { required: 'Motivation is required' })}
              placeholder="Tell us about your interest in sponsoring..."
              rows={3}
            />
            {errors.motivation && (
              <p className="text-sm text-destructive">{errors.motivation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Specific Areas of Interest</Label>
            <Textarea
              id="interests"
              {...register('interests')}
              placeholder="Art, technology, sustainability, community development..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Previous Sponsorship Experience</Label>
            <Textarea
              id="experience"
              {...register('experience')}
              placeholder="Previous sponsorships or charitable activities..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability for Partnership Activities</Label>
            <Textarea
              id="availability"
              {...register('availability')}
              placeholder="When are you available to participate in activities?"
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
                I agree to the terms of sponsorship and partnership.
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
