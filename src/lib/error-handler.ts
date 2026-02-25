import { Logger } from './observability';

/**
 * Centralized error handling utility for consistent error reporting
 */
export class ErrorHandler {
  private static logger = new Logger('ErrorHandler');

  /**
   * Handle API errors with proper logging and user feedback
   */
  static handleApiError(error: unknown, context: string): void {
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : 'An unexpected error occurred';

    this.logger.error(`API Error in ${context}:`, { error, context });
    
    // In development, log full details
    if (import.meta.env.DEV) {
      console.error(`[${context}] API Error:`, error);
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: unknown, context: string): string {
    const message = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : 'Validation failed';

    this.logger.warn(`Validation Error in ${context}:`, { error, context });
    return message;
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: unknown, context: string): void {
    this.logger.error(`Network Error in ${context}:`, { error, context });
    
    if (import.meta.env.DEV) {
      console.error(`[${context}] Network Error:`, error);
    }
  }

  /**
   * Handle async errors with fallback
   */
  static async handleAsyncError<T>(
    operation: () => Promise<T>, 
    fallback: T, 
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleApiError(error, context);
      return fallback;
    }
  }
}
