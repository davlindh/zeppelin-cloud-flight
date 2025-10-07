
import type { ErrorInfo, ErrorReportData } from '@/types/errorBoundary';
import type { ExtendedAppError } from '@/types/errorHandling';

// Generate a unique error ID
const generateErrorId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `err_${timestamp}_${randomPart}`;
};

// Type guard to check if error has stack property
const hasStack = (error: Error | ExtendedAppError): error is Error => {
  return 'stack' in error && typeof (error as Error).stack === 'string';
};

// Create error report data
const createErrorReport = (
  error: Error | ExtendedAppError,
  errorInfo: ErrorInfo
): ErrorReportData => {
  const errorId = generateErrorId();
  
  return {
    errorId,
    message: error.message,
    stack: hasStack(error) ? error.stack : undefined,
    componentStack: errorInfo.componentStack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date(),
    additionalContext: {
      errorType: 'type' in error ? error.type : 'javascript',
      isDevelopment: import.meta.env.DEV,
    },
  };
};

// Report error to console and potentially external services
export const reportError = (
  error: Error | ExtendedAppError,
  errorInfo: ErrorInfo
): string => {
  const errorReport = createErrorReport(error, errorInfo);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.group(`🚨 Error Boundary Caught Error [${errorReport.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Full Report:', errorReport);
    console.groupEnd();
  }
  
  // In production, you might want to send to an error reporting service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  if (import.meta.env.PROD) {
    // Example: sendToErrorReportingService(errorReport);
    console.error('Production Error:', errorReport);
  }
  
  return errorReport.errorId;
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (import.meta.env.DEV) {
      console.warn('Unhandled promise rejection prevented from crashing the app');
    }
    
    // Prevent the default behavior (which would crash the app)
    event.preventDefault();
  });
  
  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error handler:', event.error || event.message);
  });
};
