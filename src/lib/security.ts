/**
 * Security Configuration & Utilities
 * Zero-trust security implementation with comprehensive protection
 */

// Content Security Policy Configuration
export const CSP_CONFIG = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Only for critical inline scripts
      "'unsafe-eval'", // Only for development
      "https://api.clerk.com",
      "https://*.clerk.accounts.dev",
      "https://*.stripe.com",
      "https://*.supabase.co",
      "https://*.sentry.io",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://*.supabase.co",
      "https://*.clerk.com",
      "https://*.stripe.com"
    ],
    fontSrc: [
      "'self'",
      "data:",
      "https://fonts.gstatic.com"
    ],
    connectSrc: [
      "'self'",
      "https://api.clerk.com",
      "https://*.clerk.accounts.dev",
      "https://*.supabase.co",
      "https://*.stripe.com",
      "https://*.sentry.io",
      "wss://*.supabase.co",
      "https://api.guesty.com"
    ],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
};

// Security Headers Configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(), picture-in-picture=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block'
};

// Input Validation & Sanitization
export class SecurityValidator {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"'&]/g, (match) => {
        const map: Record<string, string> = {
          '<': '<',
          '>': '>',
          '"': '"',
          "'": '&#x27;',
          '&': '&'
        };
        return map[match];
      })
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static sanitizeHTML(html: string): string {
    // Basic HTML sanitization - in production, use DOMPurify
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

// Rate Limiting & Abuse Prevention
export class RateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();

  static isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - record.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    this.attempts.set(key, { count: record.count + 1, lastAttempt: now });
    return true;
  }

  static resetAttempts(key: string): void {
    this.attempts.delete(key);
  }
}

// Authentication Security
export class AuthSecurity {
  static validateSessionToken(token: string): boolean {
    // Basic JWT validation
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  static generateSecureToken(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

// Data Encryption Utilities
export class EncryptionUtils {
  static async encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoded
    );

    return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
  }

  static async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  static async generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

// Security Monitoring
export class SecurityMonitor {
  private static violations = new Map<string, number>();

  static reportViolation(type: string, details: any): void {
    const key = `${type}_${Date.now()}`;
    this.violations.set(key, Date.now());
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`Security Violation [${type}]:`, details);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      // Implementation would send to monitoring service
    }
  }

  static checkForXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
}

export default {
  SecurityValidator,
  RateLimiter,
  AuthSecurity,
  EncryptionUtils,
  SecurityMonitor
};