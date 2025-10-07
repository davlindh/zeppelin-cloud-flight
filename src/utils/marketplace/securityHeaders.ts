// Security headers and CSRF protection utilities

export class SecurityHeaders {
  // Add security headers to fetch requests
  static getSecureHeaders(): HeadersInit {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    };
  }

  // Generate CSRF token for forms
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(');
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 64;
  }

  // Create secure session storage key
  static createSessionKey(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Secure cookie options for authentication
  static getSecureCookieOptions() {
    return {
      secure: window.location.protocol === 'https:',
      sameSite: 'strict' as const,
      httpOnly: false, // Can't set httpOnly from frontend
      path: '/'
    };
  }
}

// Session management with security considerations
export class SecureSession {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static setSecureItem(key: string, value: any): void {
    const item = {
      value,
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_TIMEOUT
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  }

  static getSecureItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > parsed.expires) {
        sessionStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch {
      return null;
    }
  }

  static clearExpiredItems(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.expires && Date.now() > parsed.expires) {
            sessionStorage.removeItem(key);
          }
        }
      } catch {
        // Invalid item, skip
      }
    });
  }
}

// Initialize security cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up expired items on page load
  SecureSession.clearExpiredItems();
  
  // Set up periodic cleanup
  setInterval(() => {
    SecureSession.clearExpiredItems();
  }, 5 * 60 * 1000); // Every 5 minutes
}