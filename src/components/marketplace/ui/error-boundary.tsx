
import React, { Component} from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ErrorInfo,
  ErrorDisplayProps
} from '@/types/errorBoundary';
import type { ExtendedAppError } from '@/types/errorHandling';
import { reportError } from '@/utils/marketplace/errorReporting';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = reportError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.resetErrorBoundary
        );
      }

      return (
        <ErrorDisplay
          error={this.state.error!}
          errorInfo={this.state.errorInfo || { componentStack: "" }}
          onRetry={this.resetErrorBoundary}
          isDevelopment={import.meta.env.DEV}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorInfo,
  onRetry,
  isDevelopment = false,
}) => {
  const isExtendedError = (err: Error | ExtendedAppError): err is ExtendedAppError => {
    return 'type' in err && typeof err.type === 'string';
  };

  const hasStack = (err: Error | ExtendedAppError): err is Error => {
    return 'stack' in err && typeof (err as Error).stack === 'string';
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

  const getErrorDescription = () => {
    if (isExtendedError(error)) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {getErrorTitle()}
          </CardTitle>
          <CardDescription>
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          {isDevelopment && (
            <Alert>
              <AlertDescription className="text-xs">
                <details>
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {error.message}
                    {hasStack(error) && error.stack && `\n\nStack:\n${error.stack}`}
                    {errorInfo?.componentStack && 
                      `\n\nComponent Stack:\n${errorInfo.componentStack}`
                    }
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
