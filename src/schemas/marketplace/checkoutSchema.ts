
import { z } from 'zod';

export const checkoutFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete address'),
  city: z.string().min(2, 'Please enter a valid city'),
  postalCode: z.string().min(3, 'Please enter a valid postal code'),
  country: z.string().min(2, 'Please select a country'),
  phone: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
