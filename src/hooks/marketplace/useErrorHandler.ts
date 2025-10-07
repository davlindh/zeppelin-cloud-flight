
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ExtendedAppError } from '@/types/errorHandling';
import type { AppError } from '@/types/errors';

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error | ExtendedAppError | AppError) => {
    console.error('Error handled:', error);
    
    // Determine error message based on error type
    const getErrorMessage = () => {
      if ('type' in error) {
        switch (error.type) {
          case 'network':
            return 'Network error occurred. Please check your connection.';
          case 'validation':
            return error.message || 'Please check your input and try again.';
          case 'service':
            return 'Service temporarily unavailable. Please try again later.';
          case 'auction':
            return 'Auction operation failed. Please try again.';
          case 'cart':
            return 'Cart operation failed. Please try again.';
          case 'booking':
            return 'Booking operation failed. Please try again.';
          case 'communication':
            return 'Communication failed. Please try again.';
          default:
            return (error as any).message || 'An unexpected error occurred.';
        }
      }
      return error.message || 'An unexpected error occurred.';
    };

    const getErrorTitle = () => {
      if ('type' in error) {
        switch (error.type) {
          case 'network':
            return 'Connection Error';
          case 'validation':
            return 'Invalid Input';
          case 'service':
            return 'Service Error';
          case 'auction':
            return 'Auction Error';
          case 'cart':
            return 'Cart Error';
          case 'booking':
            return 'Booking Error';
          case 'communication':
            return 'Communication Error';
          default:
            return 'Error';
        }
      }
      return 'Error';
    };

    // Show toast notification
    toast({
      title: getErrorTitle(),
      description: getErrorMessage(),
      variant: 'destructive',
      duration: 5000,
    });
  }, [toast]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error | ExtendedAppError);
      return fallbackValue;
    }
  }, [handleError]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    fallbackValue?: R
  ) => {
    return (...args: T): R | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        handleError(error as Error | ExtendedAppError);
        return fallbackValue;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    withErrorHandling
  };
};
