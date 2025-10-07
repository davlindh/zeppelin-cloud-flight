
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceErrorProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  variant?: 'inline' | 'page' | 'card';
  title?: string;
  message?: string;
}

export const ServiceError: React.FC<ServiceErrorProps> = ({
  error,
  onRetry,
  onGoHome,
  variant = 'inline',
  title = 'Something went wrong',
  message = 'We encountered an error while loading this service. Please try again.'
}) => {
  if (variant === 'page') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          
          {error && (
            <Alert className="mb-6 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-slate-600">
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          
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

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-sm mx-auto border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-lg text-red-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-700 text-sm mb-4">{message}</p>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        {message}
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
};
