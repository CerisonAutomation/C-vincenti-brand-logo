/**
 * GUESTY INTEGRATION ERROR HANDLING SYSTEM
 *
 * Comprehensive error handling for Guesty API integration with:
 * - Guesty-specific error code mapping
 * - User-friendly error messages
 * - Recovery strategies
 * - Retry logic
 * - Error logging and monitoring
 */

// ── Guesty Error Code Mappings ──
export const GUESTY_ERROR_CODES = {
  // Authentication Errors
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  INVALID_SCOPE: 'invalid_scope',

  // Booking Engine API Errors
  LISTING_NOT_FOUND: 'listing_not_found',
  UNAVAILABLE_DATES: 'unavailable_dates',
  INVALID_DATES: 'invalid_dates',
  MINIMUM_STAY: 'minimum_stay_required',
  MAXIMUM_STAY: 'maximum_stay_exceeded',
  INVALID_GUESTS: 'invalid_guest_count',
  QUOTE_EXPIRED: 'quote_expired',
  PAYMENT_FAILED: 'payment_failed',
  BOOKING_CONFLICT: 'booking_conflict',

  // Open API Errors
  CALENDAR_NOT_FOUND: 'calendar_not_found',
  INVALID_CALENDAR_DATA: 'invalid_calendar_data',
  WEBHOOK_VERIFICATION_FAILED: 'webhook_verification_failed',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',

  // System Errors
  INTERNAL_ERROR: 'internal_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout',
  NETWORK_ERROR: 'network_error',
} as const;

// ── User-Friendly Error Messages ──
export const ERROR_MESSAGES = {
  [GUESTY_ERROR_CODES.INVALID_CLIENT]: 'Authentication failed. Please check your API credentials.',
  [GUESTY_ERROR_CODES.INVALID_GRANT]: 'Invalid authentication grant. Please try again.',
  [GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT]: 'Unauthorized API access. Please check your permissions.',
  [GUESTY_ERROR_CODES.INVALID_SCOPE]: 'Invalid API scope requested.',

  [GUESTY_ERROR_CODES.LISTING_NOT_FOUND]: 'The property you selected is no longer available.',
  [GUESTY_ERROR_CODES.UNAVAILABLE_DATES]: 'The selected dates are not available for booking.',
  [GUESTY_ERROR_CODES.INVALID_DATES]: 'Please select valid check-in and check-out dates.',
  [GUESTY_ERROR_CODES.MINIMUM_STAY]: 'This property requires a minimum stay. Please adjust your dates.',
  [GUESTY_ERROR_CODES.MAXIMUM_STAY]: 'This property has a maximum stay limit. Please adjust your dates.',
  [GUESTY_ERROR_CODES.INVALID_GUESTS]: 'The number of guests exceeds the property capacity.',
  [GUESTY_ERROR_CODES.QUOTE_EXPIRED]: 'Your quote has expired. Please request a new one.',
  [GUESTY_ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed. Please try again or contact support.',
  [GUESTY_ERROR_CODES.BOOKING_CONFLICT]: 'Booking conflict detected. Please refresh and try again.',

  [GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND]: 'Calendar information is currently unavailable.',
  [GUESTY_ERROR_CODES.INVALID_CALENDAR_DATA]: 'Calendar data is invalid. Please try again later.',
  [GUESTY_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]: 'Webhook verification failed.',

  [GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [GUESTY_ERROR_CODES.QUOTA_EXCEEDED]: 'API quota exceeded. Please contact support.',

  [GUESTY_ERROR_CODES.INTERNAL_ERROR]: 'A system error occurred. Please try again later.',
  [GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [GUESTY_ERROR_CODES.TIMEOUT]: 'Request timed out. Please check your connection and try again.',
  [GUESTY_ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
} as const;

// ── Recovery Strategies ──
export const RECOVERY_STRATEGIES = {
  [GUESTY_ERROR_CODES.INVALID_CLIENT]: 'CHECK_CREDENTIALS',
  [GUESTY_ERROR_CODES.INVALID_GRANT]: 'RETRY_AUTH',
  [GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT]: 'CHECK_PERMISSIONS',
  [GUESTY_ERROR_CODES.INVALID_SCOPE]: 'CHECK_SCOPES',

  [GUESTY_ERROR_CODES.LISTING_NOT_FOUND]: 'REFRESH_LISTINGS',
  [GUESTY_ERROR_CODES.UNAVAILABLE_DATES]: 'UPDATE_CALENDAR',
  [GUESTY_ERROR_CODES.INVALID_DATES]: 'VALIDATE_DATES',
  [GUESTY_ERROR_CODES.MINIMUM_STAY]: 'ADJUST_DATES',
  [GUESTY_ERROR_CODES.MAXIMUM_STAY]: 'ADJUST_DATES',
  [GUESTY_ERROR_CODES.INVALID_GUESTS]: 'ADJUST_GUESTS',
  [GUESTY_ERROR_CODES.QUOTE_EXPIRED]: 'REFRESH_QUOTE',
  [GUESTY_ERROR_CODES.PAYMENT_FAILED]: 'RETRY_PAYMENT',
  [GUESTY_ERROR_CODES.BOOKING_CONFLICT]: 'REFRESH_DATA',

  [GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND]: 'RETRY_REQUEST',
  [GUESTY_ERROR_CODES.INVALID_CALENDAR_DATA]: 'RETRY_REQUEST',
  [GUESTY_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]: 'CHECK_WEBHOOK_CONFIG',

  [GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'WAIT_AND_RETRY',
  [GUESTY_ERROR_CODES.QUOTA_EXCEEDED]: 'CONTACT_SUPPORT',

  [GUESTY_ERROR_CODES.INTERNAL_ERROR]: 'RETRY_REQUEST',
  [GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE]: 'WAIT_AND_RETRY',
  [GUESTY_ERROR_CODES.TIMEOUT]: 'RETRY_REQUEST',
  [GUESTY_ERROR_CODES.NETWORK_ERROR]: 'CHECK_CONNECTION',
} as const;

// ── Error Classification ──
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ErrorCategory = 'AUTHENTICATION' | 'VALIDATION' | 'AVAILABILITY' | 'PAYMENT' | 'SYSTEM' | 'NETWORK';

export interface GuestyError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  recoveryStrategy?: string;
  context?: Record<string, unknown>;
}

// ── Error Parser and Handler ──
export class GuestyErrorHandler {
  private static instance: GuestyErrorHandler;

  static getInstance(): GuestyErrorHandler {
    if (!GuestyErrorHandler.instance) {
      GuestyErrorHandler.instance = new GuestyErrorHandler();
    }
    return GuestyErrorHandler.instance;
  }

  /**
   * Parse Guesty API error response into structured error
   */
  parseError(error: unknown, context?: Record<string, unknown>): GuestyError {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(GUESTY_ERROR_CODES.NETWORK_ERROR, 'Network request failed', {
        ...context,
        originalError: error.message,
      });
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return this.createError(GUESTY_ERROR_CODES.TIMEOUT, 'Request timed out', {
        ...context,
        originalError: error.message,
      });
    }

    // Handle Guesty API error responses
    if (this.isGuestyApiError(error)) {
      return this.parseGuestyApiError(error, context);
    }

    // Handle generic errors
    if (error instanceof Error) {
      return this.createError(GUESTY_ERROR_CODES.INTERNAL_ERROR, error.message, {
        ...context,
        originalError: error.message,
        stack: error.stack,
      });
    }

    // Handle unknown errors
    return this.createError(GUESTY_ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred', {
      ...context,
      originalError: String(error),
    });
  }

  /**
   * Check if error is from Guesty API
   */
  private isGuestyApiError(error: unknown): error is { status: number; message?: string; error?: string; details?: unknown } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as any).status === 'number'
    );
  }

  /**
   * Parse Guesty API error response
   */
  private parseGuestyApiError(
    error: { status: number; message?: string; error?: string; details?: unknown },
    context?: Record<string, unknown>
  ): GuestyError {
    const { status, message, error: errorCode, details } = error;

    // Map HTTP status codes to Guesty error codes
    switch (status) {
      case 401:
        return this.createError(GUESTY_ERROR_CODES.INVALID_CLIENT, message || 'Unauthorized', {
          ...context,
          details,
        });

      case 403:
        return this.createError(GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT, message || 'Forbidden', {
          ...context,
          details,
        });

      case 404:
        if (context?.endpoint?.includes('listings')) {
          return this.createError(GUESTY_ERROR_CODES.LISTING_NOT_FOUND, message || 'Listing not found', {
            ...context,
            details,
          });
        }
        if (context?.endpoint?.includes('calendar')) {
          return this.createError(GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND, message || 'Calendar not found', {
            ...context,
            details,
          });
        }
        return this.createError(GUESTY_ERROR_CODES.INTERNAL_ERROR, message || 'Resource not found', {
          ...context,
          details,
        });

      case 409:
        return this.createError(GUESTY_ERROR_CODES.BOOKING_CONFLICT, message || 'Booking conflict', {
          ...context,
          details,
        });

      case 422:
        return this.parseValidationError(message || 'Validation error', details, context);

      case 429:
        return this.createError(GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED, message || 'Rate limit exceeded', {
          ...context,
          details,
        });

      case 500:
      case 502:
      case 503:
      case 504:
        return this.createError(GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE, message || 'Service unavailable', {
          ...context,
          details,
        });

      default:
        // Try to map error code from response
        if (errorCode && typeof errorCode === 'string') {
          const mappedCode = this.mapErrorCode(errorCode);
          if (mappedCode) {
            return this.createError(mappedCode, message || errorCode, {
              ...context,
              details,
            });
          }
        }

        return this.createError(GUESTY_ERROR_CODES.INTERNAL_ERROR, message || 'API error', {
          ...context,
          status,
          details,
        });
    }
  }

  /**
   * Parse validation errors from Guesty API
   */
  private parseValidationError(message: string, details: unknown, context?: Record<string, unknown>): GuestyError {
    // Check for common validation error patterns
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('date') || lowerMessage.includes('checkin') || lowerMessage.includes('checkout')) {
      return this.createError(GUESTY_ERROR_CODES.INVALID_DATES, message, { ...context, details });
    }

    if (lowerMessage.includes('guest') || lowerMessage.includes('occupancy')) {
      return this.createError(GUESTY_ERROR_CODES.INVALID_GUESTS, message, { ...context, details });
    }

    if (lowerMessage.includes('minimum') || lowerMessage.includes('min stay')) {
      return this.createError(GUESTY_ERROR_CODES.MINIMUM_STAY, message, { ...context, details });
    }

    if (lowerMessage.includes('maximum') || lowerMessage.includes('max stay')) {
      return this.createError(GUESTY_ERROR_CODES.MAXIMUM_STAY, message, { ...context, details });
    }

    if (lowerMessage.includes('available') || lowerMessage.includes('unavailable')) {
      return this.createError(GUESTY_ERROR_CODES.UNAVAILABLE_DATES, message, { ...context, details });
    }

    if (lowerMessage.includes('quote') && lowerMessage.includes('expired')) {
      return this.createError(GUESTY_ERROR_CODES.QUOTE_EXPIRED, message, { ...context, details });
    }

    if (lowerMessage.includes('payment')) {
      return this.createError(GUESTY_ERROR_CODES.PAYMENT_FAILED, message, { ...context, details });
    }

    return this.createError(GUESTY_ERROR_CODES.INTERNAL_ERROR, message, { ...context, details });
  }

  /**
   * Map string error codes to known Guesty error codes
   */
  private mapErrorCode(errorCode: string): string | null {
    const codeMap: Record<string, string> = {
      'invalid_client': GUESTY_ERROR_CODES.INVALID_CLIENT,
      'invalid_grant': GUESTY_ERROR_CODES.INVALID_GRANT,
      'unauthorized_client': GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT,
      'invalid_scope': GUESTY_ERROR_CODES.INVALID_SCOPE,
      'listing_not_found': GUESTY_ERROR_CODES.LISTING_NOT_FOUND,
      'unavailable_dates': GUESTY_ERROR_CODES.UNAVAILABLE_DATES,
      'invalid_dates': GUESTY_ERROR_CODES.INVALID_DATES,
      'minimum_stay_required': GUESTY_ERROR_CODES.MINIMUM_STAY,
      'maximum_stay_exceeded': GUESTY_ERROR_CODES.MAXIMUM_STAY,
      'invalid_guest_count': GUESTY_ERROR_CODES.INVALID_GUESTS,
      'quote_expired': GUESTY_ERROR_CODES.QUOTE_EXPIRED,
      'payment_failed': GUESTY_ERROR_CODES.PAYMENT_FAILED,
      'booking_conflict': GUESTY_ERROR_CODES.BOOKING_CONFLICT,
      'calendar_not_found': GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND,
      'invalid_calendar_data': GUESTY_ERROR_CODES.INVALID_CALENDAR_DATA,
      'webhook_verification_failed': GUESTY_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED,
      'rate_limit_exceeded': GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'quota_exceeded': GUESTY_ERROR_CODES.QUOTA_EXCEEDED,
    };

    return codeMap[errorCode.toLowerCase()] || null;
  }

  /**
   * Create structured Guesty error
   */
  private createError(code: string, message: string, context?: Record<string, unknown>): GuestyError {
    const userMessage = ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'An error occurred. Please try again.';
    const recoveryStrategy = RECOVERY_STRATEGIES[code as keyof typeof RECOVERY_STRATEGIES];
    const severity = this.getErrorSeverity(code);
    const category = this.getErrorCategory(code);

    return {
      code,
      message,
      severity,
      category,
      recoverable: this.isRecoverable(code),
      retryable: this.isRetryable(code),
      userMessage,
      recoveryStrategy,
      context,
    };
  }

  /**
   * Get error severity
   */
  private getErrorSeverity(code: string): ErrorSeverity {
    const severityMap: Record<string, ErrorSeverity> = {
      [GUESTY_ERROR_CODES.INVALID_CLIENT]: 'CRITICAL',
      [GUESTY_ERROR_CODES.INVALID_GRANT]: 'HIGH',
      [GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT]: 'CRITICAL',
      [GUESTY_ERROR_CODES.INVALID_SCOPE]: 'HIGH',

      [GUESTY_ERROR_CODES.LISTING_NOT_FOUND]: 'MEDIUM',
      [GUESTY_ERROR_CODES.UNAVAILABLE_DATES]: 'LOW',
      [GUESTY_ERROR_CODES.INVALID_DATES]: 'LOW',
      [GUESTY_ERROR_CODES.MINIMUM_STAY]: 'LOW',
      [GUESTY_ERROR_CODES.MAXIMUM_STAY]: 'LOW',
      [GUESTY_ERROR_CODES.INVALID_GUESTS]: 'LOW',
      [GUESTY_ERROR_CODES.QUOTE_EXPIRED]: 'MEDIUM',
      [GUESTY_ERROR_CODES.PAYMENT_FAILED]: 'HIGH',
      [GUESTY_ERROR_CODES.BOOKING_CONFLICT]: 'MEDIUM',

      [GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND]: 'MEDIUM',
      [GUESTY_ERROR_CODES.INVALID_CALENDAR_DATA]: 'MEDIUM',
      [GUESTY_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]: 'HIGH',

      [GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'MEDIUM',
      [GUESTY_ERROR_CODES.QUOTA_EXCEEDED]: 'HIGH',

      [GUESTY_ERROR_CODES.INTERNAL_ERROR]: 'HIGH',
      [GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE]: 'HIGH',
      [GUESTY_ERROR_CODES.TIMEOUT]: 'MEDIUM',
      [GUESTY_ERROR_CODES.NETWORK_ERROR]: 'MEDIUM',
    };

    return severityMap[code] || 'MEDIUM';
  }

  /**
   * Get error category
   */
  private getErrorCategory(code: string): ErrorCategory {
    const categoryMap: Record<string, ErrorCategory> = {
      [GUESTY_ERROR_CODES.INVALID_CLIENT]: 'AUTHENTICATION',
      [GUESTY_ERROR_CODES.INVALID_GRANT]: 'AUTHENTICATION',
      [GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT]: 'AUTHENTICATION',
      [GUESTY_ERROR_CODES.INVALID_SCOPE]: 'AUTHENTICATION',

      [GUESTY_ERROR_CODES.LISTING_NOT_FOUND]: 'VALIDATION',
      [GUESTY_ERROR_CODES.UNAVAILABLE_DATES]: 'AVAILABILITY',
      [GUESTY_ERROR_CODES.INVALID_DATES]: 'VALIDATION',
      [GUESTY_ERROR_CODES.MINIMUM_STAY]: 'VALIDATION',
      [GUESTY_ERROR_CODES.MAXIMUM_STAY]: 'VALIDATION',
      [GUESTY_ERROR_CODES.INVALID_GUESTS]: 'VALIDATION',
      [GUESTY_ERROR_CODES.QUOTE_EXPIRED]: 'VALIDATION',
      [GUESTY_ERROR_CODES.PAYMENT_FAILED]: 'PAYMENT',
      [GUESTY_ERROR_CODES.BOOKING_CONFLICT]: 'AVAILABILITY',

      [GUESTY_ERROR_CODES.CALENDAR_NOT_FOUND]: 'SYSTEM',
      [GUESTY_ERROR_CODES.INVALID_CALENDAR_DATA]: 'SYSTEM',
      [GUESTY_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]: 'SYSTEM',

      [GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'SYSTEM',
      [GUESTY_ERROR_CODES.QUOTA_EXCEEDED]: 'SYSTEM',

      [GUESTY_ERROR_CODES.INTERNAL_ERROR]: 'SYSTEM',
      [GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE]: 'SYSTEM',
      [GUESTY_ERROR_CODES.TIMEOUT]: 'NETWORK',
      [GUESTY_ERROR_CODES.NETWORK_ERROR]: 'NETWORK',
    };

    return categoryMap[code] || 'SYSTEM';
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(code: string): boolean {
    const nonRecoverable = [
      GUESTY_ERROR_CODES.INVALID_CLIENT,
      GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT,
      GUESTY_ERROR_CODES.QUOTA_EXCEEDED,
    ];

    return !nonRecoverable.includes(code as any);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(code: string): boolean {
    const nonRetryable = [
      GUESTY_ERROR_CODES.INVALID_CLIENT,
      GUESTY_ERROR_CODES.INVALID_GRANT,
      GUESTY_ERROR_CODES.UNAUTHORIZED_CLIENT,
      GUESTY_ERROR_CODES.INVALID_SCOPE,
      GUESTY_ERROR_CODES.LISTING_NOT_FOUND,
      GUESTY_ERROR_CODES.INVALID_DATES,
      GUESTY_ERROR_CODES.INVALID_GUESTS,
      GUESTY_ERROR_CODES.QUOTA_EXCEEDED,
    ];

    return !nonRetryable.includes(code as any);
  }

  /**
   * Get retry configuration for error
   */
  getRetryConfig(error: GuestyError): { maxRetries: number; baseDelay: number; maxDelay: number } | null {
    if (!error.retryable) {
      return null;
    }

    switch (error.code) {
      case GUESTY_ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return { maxRetries: 3, baseDelay: 2000, maxDelay: 30000 };

      case GUESTY_ERROR_CODES.SERVICE_UNAVAILABLE:
        return { maxRetries: 5, baseDelay: 1000, maxDelay: 10000 };

      case GUESTY_ERROR_CODES.TIMEOUT:
        return { maxRetries: 3, baseDelay: 1000, maxDelay: 5000 };

      case GUESTY_ERROR_CODES.NETWORK_ERROR:
        return { maxRetries: 3, baseDelay: 500, maxDelay: 2000 };

      default:
        return { maxRetries: 2, baseDelay: 1000, maxDelay: 5000 };
    }
  }

  /**
   * Log error for monitoring
   */
  logError(error: GuestyError, additionalContext?: Record<string, unknown>) {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        code: error.code,
        message: error.message,
        severity: error.severity,
        category: error.category,
        recoverable: error.recoverable,
        retryable: error.retryable,
        recoveryStrategy: error.recoveryStrategy,
        context: { ...error.context, ...additionalContext },
      },
      level: error.severity === 'CRITICAL' ? 'error' : error.severity === 'HIGH' ? 'warn' : 'info',
    };

    console.log(JSON.stringify(logData));
  }
}
