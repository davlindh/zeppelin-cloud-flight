
import React from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import { ErrorFallback } from '@/components/ui/error-fallback';
import type { ExtendedAppError } from '@/types/errorHandling';
import type { ErrorInfo } from '@/types/errorBoundary';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallbackVariant?: 'minimal' | 'detailed' | 'page';
  onError?: (error: Error | ExtendedAppError, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  resetKeys?: Array<string | number>;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallbackVariant = 'detailed',
  onError,
  onRetry,
  resetKeys
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior: reload the page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const fallbackRenderer = (
    error: Error | ExtendedAppError,
    errorInfo: ErrorInfo,
    _retry: () => void
  ) => (
    <ErrorFallback
      error={error}
      errorInfo={errorInfo}
      onRetry={handleRetry}
      onGoHome={handleGoHome}
      variant={fallbackVariant}
    />
  );

  return (
    <ErrorBoundary
      fallback={fallbackRenderer}
      onError={onError}
      resetOnPropsChange={true}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};
