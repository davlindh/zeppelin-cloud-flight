// Input sanitization and validation utilities
export class InputSanitizer {
  // Sanitize HTML content to prevent XSS - using regex instead of DOMPurify
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Sanitize plain text (remove HTML, limit length)
  static sanitizeText(input: string, maxLength: number = 1000): string {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .substring(0, maxLength);
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validate phone number (basic international format)
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Sanitize and validate message content
  static sanitizeMessage(message: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!message || message.trim().length < 10) {
      return { isValid: false, sanitized: '', error: 'Message must be at least 10 characters long' };
    }

    if (message.length > 5000) {
      return { isValid: false, sanitized: '', error: 'Message must be less than 5000 characters' };
    }

    const sanitized = this.sanitizeText(message, 5000);
    return { isValid: true, sanitized };
  }

  // Sanitize and validate contact information
  static validateContactInfo(data: {
    name: string;
    email: string;
    phone?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Rate limiting utility for guest operations
export class RateLimiter {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  static canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const existing = this.attempts.get(key);

    if (!existing) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - existing.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if under limit
    if (existing.count < maxAttempts) {
      existing.count++;
      existing.lastAttempt = now;
      return true;
    }

    return false;
  }

  static getRemainingAttempts(key: string, maxAttempts: number = 5): number {
    const existing = this.attempts.get(key);
    if (!existing) return maxAttempts;
    return Math.max(0, maxAttempts - existing.count);
  }
}