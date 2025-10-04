import { z } from 'zod';

// Base contact information schema used across multiple forms
export const contactInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

// Base consent schema used across multiple forms
export const consentSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  acceptMarketing: z.boolean().optional(),
  newsletterSubscription: z.boolean().optional(),
});

// Sponsor form validation schema
export const sponsorFormSchema = z.object({
  ...contactInfoSchema.shape,
  sponsorType: z.enum(['individual', 'company', 'foundation']),
  organization: z.string().optional(),
  sponsorshipLevel: z.string().optional(),
  motivation: z.string().min(1, 'Motivation is required'),
  interests: z.string().optional(),
  previousSponsorships: z.string().optional(),
  specialRequirements: z.string().optional(),
  experience: z.string().optional(),
  availability: z.string().optional(),
  ...consentSchema.shape,
});

// Project form validation schema
export const projectFormSchema = z.object({
  ...contactInfoSchema.shape,
  projectTitle: z.string().min(1, 'Project title is required'),
  projectDescription: z.string().min(1, 'Project description is required'),
  projectCategory: z.string().min(1, 'Project category is required'),
  expectedImpact: z.string().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  budget: z.string().optional(),
  motivation: z.string().min(1, 'Motivation is required'),
  experience: z.string().optional(),
  availability: z.string().optional(),
  ...consentSchema.shape,
});

// Collaboration form validation schema
export const collaborationFormSchema = z.object({
  ...contactInfoSchema.shape,
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
  ...consentSchema.shape,
});

// Admin form schemas
export const adminProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean().optional(),
  tags: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

export const adminParticipantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  socialMedia: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports for form data
export type SponsorFormData = z.infer<typeof sponsorFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type CollaborationFormData = z.infer<typeof collaborationFormSchema>;
export type AdminProjectData = z.infer<typeof adminProjectSchema>;
export type AdminParticipantData = z.infer<typeof adminParticipantSchema>;

// Field option types for consistent dropdowns
export const SPONSOR_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'foundation', label: 'Foundation' },
] as const;

export const SPONSORSHIP_LEVEL_OPTIONS = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'custom', label: 'Custom' },
] as const;

export const PROJECT_CATEGORY_OPTIONS = [
  { value: 'art', label: 'Art & Culture' },
  { value: 'technology', label: 'Technology' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'education', label: 'Education' },
  { value: 'community', label: 'Community' },
  { value: 'research', label: 'Research' },
  { value: 'innovation', label: 'Innovation' },
] as const;

export const COLLABORATION_TYPE_OPTIONS = [
  { value: 'artist', label: 'Artist/Artistic Project' },
  { value: 'researcher', label: 'Research/Academic' },
  { value: 'community', label: 'Community Project' },
  { value: 'business', label: 'Business/Commercial' },
  { value: 'other', label: 'Other' },
] as const;

export const EXPECTED_DURATION_OPTIONS = [
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6-12 months', label: '6-12 months' },
  { value: '1-2 years', label: '1-2 years' },
  { value: 'long-term', label: 'Long-term partnership' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

export const PARTICIPANT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
] as const;
