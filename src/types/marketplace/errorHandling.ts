
// Enhanced error handling types

import type { AppError, BaseError } from './errors';

export interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface NetworkErrorDetails {
  status: number;
  statusText: string;
  url: string;
  method: string;
  timeout?: number;
}

// Enhanced error types extending the existing base
export interface ServiceError extends BaseError {
  readonly type: 'service';
  readonly serviceId?: string;
  readonly operation: 'fetch' | 'create' | 'update' | 'delete';
}

export interface AuctionError extends BaseError {
  readonly type: 'auction';
  readonly auctionId?: string;
  readonly operation: 'bid' | 'fetch' | 'watch';
}

export interface CartError extends BaseError {
  readonly type: 'cart';
  readonly productId?: string;
  readonly operation: 'add' | 'remove' | 'update' | 'checkout';
}

// Union type including all error types
export type ExtendedAppError = AppError | ServiceError | AuctionError | CartError;

// Error factory functions
export const createServiceError = (
  serviceId: string | undefined,
  operation: ServiceError['operation'],
  message: string,
  context?: Record<string, unknown>
): ServiceError => ({
  type: 'service',
  code: 'SERVICE_ERROR',
  serviceId,
  operation,
  message,
  timestamp: new Date(),
  context
});

export const createAuctionError = (
  auctionId: string | undefined,
  operation: AuctionError['operation'],
  message: string,
  context?: Record<string, unknown>
): AuctionError => ({
  type: 'auction',
  code: 'AUCTION_ERROR',
  auctionId,
  operation,
  message,
  timestamp: new Date(),
  context
});

export const createCartError = (
  productId: string | undefined,
  operation: CartError['operation'],
  message: string,
  context?: Record<string, unknown>
): CartError => ({
  type: 'cart',
  code: 'CART_ERROR',
  productId,
  operation,
  message,
  timestamp: new Date(),
  context
});

// Type guards for enhanced errors
export const isServiceError = (error: ExtendedAppError): error is ServiceError =>
  error.type === 'service';

export const isAuctionError = (error: ExtendedAppError): error is AuctionError =>
  error.type === 'auction';

export const isCartError = (error: ExtendedAppError): error is CartError =>
  error.type === 'cart';
