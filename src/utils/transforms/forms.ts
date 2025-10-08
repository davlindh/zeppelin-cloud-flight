// Form data transforms and validation
import type { ContactFormData, BidFormData, BookingFormData } from '@/types/formData';

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Sanitize form data
export const sanitizeContactForm = (data: ContactFormData): ContactFormData => {
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim(),
    message: data.message.trim(),
    agreedToTerms: data.agreedToTerms
  };
};

// Transform bid form data for submission
export const transformBidFormData = (data: BidFormData) => {
  return {
    bidder: data.name.trim(),
    amount: data.amount,
    contact_email: data.email.trim().toLowerCase(),
    contact_phone: data.phoneNumber?.trim(),
    agreed_to_terms: data.agreedToTerms,
    timestamp: new Date().toISOString()
  };
};

// Transform booking form data for submission
export const transformBookingFormData = (data: BookingFormData, serviceId: string) => {
  return {
    service_id: serviceId,
    selected_date: data.selectedDate,
    selected_time: data.selectedTime,
    customizations: data.customizations,
    customer_name: data.contactInfo.name.trim(),
    customer_email: data.contactInfo.email.trim().toLowerCase(),
    customer_phone: data.contactInfo.phone?.trim() || '',
    customer_message: data.contactInfo.message.trim(),
    agreed_to_terms: data.contactInfo.agreedToTerms,
    special_requests: data.specialRequests?.trim()
  };
};

// Validate form completeness
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateContactForm = (data: ContactFormData): FormValidationResult => {
  const errors: string[] = [];

  if (!data.name.trim()) errors.push('Name is required');
  if (!data.email.trim()) errors.push('Email is required');
  else if (!isValidEmail(data.email)) errors.push('Invalid email format');
  if (!data.message.trim()) errors.push('Message is required');
  if (!data.agreedToTerms) errors.push('You must agree to the terms');

  return {
    isValid: errors.length === 0,
    errors
  };
};