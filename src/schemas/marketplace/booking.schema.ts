import { z } from 'zod';

export const bookingFormSchema = z.object({
  selectedDate: z.string().min(1, 'Please select a date'),
  selectedTime: z.string().min(1, 'Please select a time'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(10, 'Please enter a valid phone number'),
  customerMessage: z.string().optional(),
  customizations: z.record(z.any()).optional().default({}),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const stepValidationSchemas = {
  step1: bookingFormSchema.pick({ selectedDate: true, selectedTime: true }),
  step2: bookingFormSchema.pick({ customizations: true }),
  step3: bookingFormSchema.pick({ 
    customerName: true, 
    customerEmail: true, 
    customerPhone: true, 
    customerMessage: true 
  }),
  step4: bookingFormSchema.pick({ agreedToTerms: true })
};
