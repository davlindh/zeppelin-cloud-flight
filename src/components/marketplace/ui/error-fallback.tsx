
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ExtendedAppError } from '@/types/errorHandling';
import type { ErrorInfo } from '@/types/errorBoundary';

interface ErrorFallbackProps {
  error: Error | ExtendedAppError;
  errorInfo?: ErrorInfo;
  onRetry?: () => void;
  onGoHome?: () => void;
  variant?: 'minimal' | 'detailed' | 'page';
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  variant = 'detailed',
  className = '
}) => {
  const isExtendedError = (err: Error | ExtendedAppError): err is ExtendedAppError => {
    return 'type' in err && typeof err.type === 'string';
  };

  const getErrorTitle = () => {
    if (isExtendedError(error)) {
      switch (error.type) {
        case 'service':
          return 'Service Error';
        case 'auction':
          return 'Auction Error';
        case 'cart':
          return 'Cart Error';
        case 'validation':
          return 'Validation Error';
        case 'booking':
          return 'Booking Error';
        case 'communication':
          return 'Communication Error';
        case 'network':
          return 'Network Error';
        default:
          return 'Application Error';
      }
    }
    return 'Something went wrong';
  };

  const getErrorMessage = () => {
    if (isExtendedError(error)) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  if (variant === 'minimal') {
    return (
      <Alert className={`border-red-200 bg-red-50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {getErrorMessage()}
          {onRetry && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={onRetry}
              className="text-red-600 hover:text-red-700 ml-2 p-0 h-auto"
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'page') {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{getErrorTitle()}</h2>
          <p className="text-slate-600 mb-6">{getErrorMessage()}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <CardTitle className="text-lg text-red-900">{getErrorTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-red-700 text-sm">{getErrorMessage()}</p>
        
        {onRetry && (
          <Button 
            size="sm" 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        
        {import.meta.env.DEV && errorInfo && (
          <Alert>
            <AlertDescription className="text-xs">
              <details>
                <summary className="cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {error.message}
                  {errorInfo.componentStack && 
                    `\n\nComponent Stack:\n${errorInfo.componentStack}`
                  }
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
