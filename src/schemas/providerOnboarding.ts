import { z } from 'zod';

export const providerOnboardingSchema = z.object({
  // Step 1: Basic Information
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  location: z.string().min(3, 'Location is required'),
  
  // Step 2: Professional Details
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500),
  experience: z.string().min(1, 'Experience level is required'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  certifications: z.array(z.string()).optional(),
  years_in_business: z.number().min(0).max(50).optional(),
  
  // Step 3: Services & Portfolio
  services_description: z.string().min(20, 'Describe your services (min 20 characters)').max(500),
  portfolio_description: z.string().optional(),
  work_philosophy: z.string().optional(),
  
  // Step 4: Availability & Response
  availability_status: z.enum(['available', 'limited', 'unavailable']).default('available'),
  response_time: z.enum(['1 hour', '24 hours', '48 hours', '1 week']).default('24 hours'),
  
  // Optional fields
  avatar: z.string().url().optional().or(z.literal('')),
  awards: z.array(z.string()).optional(),
});

export type ProviderOnboardingData = z.infer<typeof providerOnboardingSchema>;

// Step-specific schemas for validation
export const step1Schema = providerOnboardingSchema.pick({
  name: true,
  email: true,
  phone: true,
  location: true,
});

export const step2Schema = providerOnboardingSchema.pick({
  bio: true,
  experience: true,
  specialties: true,
  certifications: true,
  years_in_business: true,
});

export const step3Schema = providerOnboardingSchema.pick({
  services_description: true,
  portfolio_description: true,
  work_philosophy: true,
});

export const step4Schema = providerOnboardingSchema.pick({
  availability_status: true,
  response_time: true,
  avatar: true,
  awards: true,
});
