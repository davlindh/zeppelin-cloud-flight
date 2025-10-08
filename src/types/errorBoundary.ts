
import type { ReactNode } from 'react';
import type { ExtendedAppError } from './errorHandling';

export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | ExtendedAppError | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | ExtendedAppError, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error | ExtendedAppError, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export interface ErrorDisplayProps {
  error: Error | ExtendedAppError;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  isDevelopment?: boolean;
}

export interface ErrorReportData {
  errorId: string;
  message: string;
  stack?: string;
  componentStack: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, unknown>;
}
