import { useState } from 'react';
import { InputSanitizer, RateLimiter } from '@/utils/marketplace/inputSanitization';
import { useToast } from '@/hooks/use-toast';

interface SecureSubmissionOptions {
  maxAttempts?: number;
  rateLimitWindow?: number;
  requireValidation?: boolean;
}

export const useSecureSubmission = (options: SecureSubmissionOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const { toast } = useToast();

  const {
    maxAttempts = 5,
    rateLimitWindow = 300000, // 5 minutes
    requireValidation = true
  } = options;

  const secureSubmit = async (
    data: any,
    submitFn: (sanitizedData: any) => Promise<any>,
    rateLimitKey?: string
  ) => {
    if (isSubmitting) return;

    // Rate limiting check
    const limitKey = rateLimitKey || `submission_${Date.now()}`;
    if (!RateLimiter.canAttempt(limitKey, maxAttempts, rateLimitWindow)) {
      const remaining = RateLimiter.getRemainingAttempts(limitKey, maxAttempts);
      toast({
        title: "Rate Limit Exceeded",
        description: `Too many attempts. Try again later. Remaining: ${remaining}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionCount(prev => prev + 1);

    try {
      // Input validation and sanitization
      const sanitizedData = { ...data };

      if (requireValidation) {
        // Sanitize common fields
        if (data.message) {
          const messageResult = InputSanitizer.sanitizeMessage(data.message);
          if (!messageResult.isValid) {
            throw new Error(messageResult.error);
          }
          sanitizedData.message = messageResult.sanitized;
        }

        if (data.subject) {
          sanitizedData.subject = InputSanitizer.sanitizeText(data.subject, 200);
        }

        if (data.customerName || data.customer_name) {
          const name = data.customerName || data.customer_name;
          sanitizedData.customerName = InputSanitizer.sanitizeText(name, 100);
          sanitizedData.customer_name = sanitizedData.customerName;
        }

        // Validate contact information
        if (data.customerEmail || data.customer_email) {
          const email = data.customerEmail || data.customer_email;
          if (!InputSanitizer.validateEmail(email)) {
            throw new Error('Invalid email format');
          }
          sanitizedData.customerEmail = email;
          sanitizedData.customer_email = email;
        }

        if (data.customerPhone || data.customer_phone) {
          const phone = data.customerPhone || data.customer_phone;
          if (phone && !InputSanitizer.validatePhone(phone)) {
            throw new Error('Invalid phone number format');
          }
          sanitizedData.customerPhone = phone;
          sanitizedData.customer_phone = phone;
        }
      }

      // Add security metadata
      sanitizedData.ip_address = await getUserIP();
      sanitizedData.user_agent = navigator.userAgent;
      sanitizedData.timestamp = new Date().toISOString();

      const result = await submitFn(sanitizedData);

      toast({
        title: "Success",
        description: "Your request has been submitted successfully."
      });

      return result;
    } catch (error) {
      console.error('Secure submission error:', error);
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    secureSubmit,
    isSubmitting,
    submissionCount,
    remainingAttempts: (rateLimitKey: string) => 
      RateLimiter.getRemainingAttempts(rateLimitKey, maxAttempts)
  };
};

// Get user IP (fallback for rate limiting)
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}