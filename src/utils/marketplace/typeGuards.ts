import { BookingData, ServiceForBooking, CommunicationRequest } from '@/types/marketplace/unified';
import { 
  ServiceId, Email, PhoneNumber, DateTime, Currency, Rating,
  isServiceId, isEmail, isPhoneNumber, isDateTime, isCurrency, isRating
} from '@/types/marketplace/branded';
import {
  isValidServiceCategory, isValidServiceDuration
} from '@/types/marketplace/enums';
import { createValidationError } from '@/types/marketplace/errors';

// Re-export enhanced type guards
export {
  isCompleteService,
  isCompleteProduct,
  isValidCartVariants,
  isValidCartItem,
  isValidContactFormData,
  isValidBookingFormData,
  isValidBidHistory,
  isCompleteAuction,
  isValidServiceProvider,
  validateStringLength,
  validatePositiveNumber,
  validateArray
} from './enhancedTypeGuards';

// Enhanced type guards with branded types and better error messages

export const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const isValidBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isValidDate = (value: unknown): value is string => {
  if (!isValidString(value)) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

// Enhanced validation with branded types
export const validateServiceId = (value: unknown, fieldName: string): ServiceId => {
  if (!isServiceId(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid service ID',
      `${fieldName} must be a valid non-empty string service ID`
    );
  }
  return value;
};

export const validateEmail = (value: unknown, fieldName: string): Email => {
  if (!isEmail(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid email format',
      `${fieldName} must be a valid email address`
    );
  }
  return value;
};

export const validatePhoneNumber = (value: unknown, fieldName: string, required: boolean = false): PhoneNumber | undefined => {
  if (!required && (value === undefined || value === null || value === '')) {
    return undefined;
  }
  
  if (!isPhoneNumber(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid phone number format',
      `${fieldName} must be a valid phone number`
    );
  }
  return value;
};

export const validateDateTime = (value: unknown, fieldName: string): DateTime => {
  if (!isDateTime(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid ISO date string',
      `${fieldName} must be a valid date time string`
    );
  }
  return value;
};

export const validateCurrency = (value: unknown, fieldName: string): Currency => {
  if (!isCurrency(value)) {
    throw createValidationError(
      fieldName,
      value,
      'positive finite number',
      `${fieldName} must be a positive finite number for currency`
    );
  }
  return value;
};

export const validateRating = (value: unknown, fieldName: string): Rating => {
  if (!isRating(value)) {
    throw createValidationError(
      fieldName,
      value,
      'number between 0 and 5',
      `${fieldName} must be a rating between 0 and 5`
    );
  }
  return value;
};

// Enhanced booking data validation
export const isValidBookingData = (data: unknown): data is BookingData => {
  if (!data || typeof data !== 'object') return false;
  
  const booking = data as BookingData;
  
  try {
    return (
      isValidString(booking.selectedDate) &&
      isValidString(booking.selectedTime) &&
      typeof booking.customizations === 'object' &&
      typeof booking.contactInfo === 'object' &&
      isValidString(booking.contactInfo.name) &&
      isEmail(booking.contactInfo.email) &&
      isValidBoolean(booking.agreedToTerms)
    );
  } catch {
    return false;
  }
};

// Enhanced service validation
export const isValidService = (service: unknown): service is ServiceForBooking => {
  if (!service || typeof service !== 'object') return false;
  
  const s = service as ServiceForBooking;
  
  try {
    return (
      isServiceId(s.id) &&
      isValidString(s.title) &&
      isCurrency(s.startingPrice) &&
      isValidString(s.duration) &&
      isValidString(s.provider) &&
      isEmail(s.providerEmail)
    );
  } catch {
    return false;
  }
};

// Boolean state validators with enhanced error handling
export const validateBooleanState = (value: unknown, fieldName: string): boolean => {
  if (!isValidBoolean(value)) {
    console.warn(`Invalid boolean value for ${fieldName}:`, value);
    return false;
  }
  return value;
};

export const ensureBoolean = (value: unknown): boolean => {
  if (isValidBoolean(value)) return value;
  return Boolean(value);
};

// Enhanced contact info validation
export const validateContactInfo = (contactInfo: BookingData['contactInfo']): boolean => {
  try {
    return !!(
      isValidString(contactInfo.name) && 
      isEmail(contactInfo.email)
    );
  } catch {
    return false;
  }
};

// Enhanced service context validation
export const validateServiceContext = (context: unknown): context is CommunicationRequest['serviceContext'] => {
  if (!context || typeof context !== 'object') return false;
  
  const ctx = context as CommunicationRequest['serviceContext'];
  
  try {
    return (
      (!ctx?.serviceId || isServiceId(ctx.serviceId)) &&
      (!ctx?.serviceName || isValidString(ctx.serviceName)) &&
      (!ctx?.servicePrice || isCurrency(ctx.servicePrice))
    );
  } catch {
    return false;
  }
};

// Enhanced validation with comprehensive error messages
export const validateStringId = (id: unknown, fieldName: string): string => {
  if (!isValidString(id)) {
    throw createValidationError(
      fieldName,
      id,
      'non-empty string',
      `Invalid string ID for ${fieldName}: expected non-empty string, got ${typeof id}`
    );
  }
  return id;
};

export const validateOptionalStringId = (id: unknown): string | undefined => {
  if (id === undefined || id === null) return undefined;
  if (!isValidString(id)) {
    console.warn('Invalid optional string ID:', id);
    return undefined;
  }
  return id;
};

// Enhanced assertion helpers with better error messages
export const assertString = (value: unknown, fieldName: string): string => {
  if (!isValidString(value)) {
    throw createValidationError(
      fieldName,
      value,
      'non-empty string',
      `Expected string for ${fieldName}, got ${typeof value}`
    );
  }
  return value;
};

export const assertBoolean = (value: unknown, fieldName: string): boolean => {
  if (!isValidBoolean(value)) {
    throw createValidationError(
      fieldName,
      value,
      'boolean',
      `Expected boolean for ${fieldName}, got ${typeof value}`
    );
  }
  return value;
};

export const assertNumber = (value: unknown, fieldName: string): number => {
  if (!isValidNumber(value)) {
    throw createValidationError(
      fieldName,
      value,
      'finite number',
      `Expected number for ${fieldName}, got ${typeof value}`
    );
  }
  return value;
};

// Enhanced form validation helpers
export const validateFormField = (value: unknown, fieldName: string, required: boolean = true): string => {
  if (!required && (value === undefined || value === null || value === '')) {
    return '';
  }
  
  if (!isValidString(value)) {
    throw createValidationError(
      fieldName,
      value,
      'non-empty string',
      `${fieldName} is required and must be a non-empty string`
    );
  }
  
  return value;
};

export const validateEmailField = (value: unknown, fieldName: string, required: boolean = true): string => {
  if (!required && (value === undefined || value === null || value === '')) {
    return '';
  }
  
  if (!isEmail(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid email format',
      `${fieldName} must be a valid email address`
    );
  }
  
  return value;
};

// Category and enum validation
export const validateServiceCategory = (value: unknown, fieldName: string): string => {
  if (!isValidString(value) || !isValidServiceCategory(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid service category',
      `${fieldName} must be a valid service category`
    );
  }
  return value;
};

export const validateServiceDuration = (value: unknown, fieldName: string): string => {
  if (!isValidString(value) || !isValidServiceDuration(value)) {
    throw createValidationError(
      fieldName,
      value,
      'valid service duration',
      `${fieldName} must be a valid service duration`
    );
  }
  return value;
};
