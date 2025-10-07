
// Comprehensive error handling types

// Base error interface
export interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}

// Validation error types
export interface ValidationError extends BaseError {
  readonly type: 'validation';
  readonly field: string;
  readonly value: unknown;
  readonly constraint: string;
}

// Booking error types
export interface BookingError extends BaseError {
  readonly type: 'booking';
  readonly bookingId?: string;
  readonly serviceId: string;
  readonly reason: 'unavailable' | 'invalid_date' | 'invalid_contact' | 'service_not_found' | 'provider_unavailable';
}

// Communication error types
export interface CommunicationError extends BaseError {
  readonly type: 'communication';
  readonly providerId: string;
  readonly reason: 'provider_not_found' | 'invalid_email' | 'rate_limit' | 'service_unavailable';
}

// Network error types
export interface NetworkError extends BaseError {
  readonly type: 'network';
  readonly status?: number;
  readonly endpoint?: string;
  readonly method?: string;
}

// Union type for all errors
export type AppError = ValidationError | BookingError | CommunicationError | NetworkError;

// Result types for operations
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Async state types
export interface AsyncState<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: AppError | null;
}

// Form validation result types
export interface FieldValidationResult {
  readonly isValid: boolean;
  readonly error?: ValidationError;
  readonly warnings?: string[];
}

export interface FormValidationResult {
  readonly isValid: boolean;
  readonly fieldErrors: Record<string, ValidationError>;
  readonly globalErrors: ValidationError[];
}

// Utility functions for creating errors
export const createValidationError = (
  field: string,
  value: unknown,
  constraint: string,
  message: string,
  context?: Record<string, unknown>
): ValidationError => ({
  type: 'validation',
  code: 'VALIDATION_ERROR',
  field,
  value,
  constraint,
  message,
  timestamp: new Date(),
  context
});

export const createBookingError = (
  serviceId: string,
  reason: BookingError['reason'],
  message: string,
  bookingId?: string,
  context?: Record<string, unknown>
): BookingError => ({
  type: 'booking',
  code: 'BOOKING_ERROR',
  serviceId,
  reason,
  message,
  bookingId,
  timestamp: new Date(),
  context
});

export const createCommunicationError = (
  providerId: string,
  reason: CommunicationError['reason'],
  message: string,
  context?: Record<string, unknown>
): CommunicationError => ({
  type: 'communication',
  code: 'COMMUNICATION_ERROR',
  providerId,
  reason,
  message,
  timestamp: new Date(),
  context
});

export const createNetworkError = (
  message: string,
  status?: number,
  endpoint?: string,
  method?: string,
  context?: Record<string, unknown>
): NetworkError => ({
  type: 'network',
  code: 'NETWORK_ERROR',
  message,
  status,
  endpoint,
  method,
  timestamp: new Date(),
  context
});

// Type guards for errors
export const isValidationError = (error: AppError): error is ValidationError =>
  error.type === 'validation';

export const isBookingError = (error: AppError): error is BookingError =>
  error.type === 'booking';

export const isCommunicationError = (error: AppError): error is CommunicationError =>
  error.type === 'communication';

export const isNetworkError = (error: AppError): error is NetworkError =>
  error.type === 'network';
