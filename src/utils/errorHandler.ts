/**
 * Centralized error handling system
 * Provides consistent error processing, user feedback, and recovery strategies
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userMessage?: string;
  technicalDetails?: Record<string, unknown>;
}

class ErrorHandler {
  /**
   * Handle errors with appropriate logging and user feedback
   */
  handleError(error: Error | unknown, context?: ErrorContext): {
    userMessage: string;
    shouldRetry: boolean;
    recoveryAction?: () => void;
  } {
    const err = error instanceof Error ? error : new Error(String(error));

    // Log to console
    console.error(
      `❌ [ERROR${context?.component ? `:${context.component}` : ''}${context?.action ? `:${context.action}` : ''}] ${err.message}`,
      err,
      context?.technicalDetails || {}
    );

    // Determine if it's a recoverable error
    const shouldRetry = this.isRecoverableError(err);

    // Create appropriate user message
    const userMessage = context?.userMessage || this.getUserFriendlyMessage(err, context?.action);

    return {
      userMessage,
      shouldRetry,
      recoveryAction: shouldRetry
        ? () => console.info(`🔄 [RETRY${context?.component ? `:${context.component}` : ''}] Retry attempted`)
        : undefined,
    };
  }

  /**
   * Format errors for consistent user presentation
   */
  formatErrorForUser(error: Error | unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Determine if an error is recoverable (network, temporary issues)
   */
  private isRecoverableError(error: Error): boolean {
    const msg = error.message.toLowerCase();
    return ['fetch', 'network', 'timeout', 'pgrst', 'postgrest', 'jwt', 'auth'].some(term => msg.includes(term));
  }

  /**
   * Generate user-friendly error messages based on error type and context
   */
  private getUserFriendlyMessage(error: Error, action?: string): string {
    const msg = error.message.toLowerCase();

    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Problem att ansluta till servern. Kontrollera din internetanslutning och försök igen.';
    }
    if (msg.includes('timeout')) {
      return 'Begäran tog för lång tid. Försök igen senare.';
    }
    if (msg.includes('unauthorized') || msg.includes('jwt')) {
      return 'Din session har gått ut. Logga in igen.';
    }
    if (msg.includes('permission') || msg.includes('access')) {
      return 'Du har inte behörighet att utföra denna åtgärd.';
    }
    if (msg.includes('validation') || msg.includes('invalid')) {
      return action
        ? `Felaktiga uppgifter när ${action}. Kontrollera dina uppgifter och försök igen.`
        : 'Felaktiga uppgifter. Kontrollera och försök igen.';
    }
    if (msg.includes('not found')) {
      return 'Den efterfrågade informationen hittades inte.';
    }
    return action
      ? `Ett fel uppstod när ${action}. Försök igen senare.`
      : 'Ett oväntat fel uppstod. Försök igen senare.';
  }
}

// Export singleton
export const errorHandler = new ErrorHandler();
export const handleError = (error: Error | unknown, context?: ErrorContext) =>
  errorHandler.handleError(error, context);
export const formatErrorForUser = (error: Error | unknown) =>
  errorHandler.formatErrorForUser(error);

export default errorHandler;
