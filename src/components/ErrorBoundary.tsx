/**
 * Production-Grade Error Boundary System
 * Hierarchical error boundaries with automatic recovery and monitoring
 * Integrates with logger utility and performance monitoring
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  component?: string;
  level?: 'root' | 'route' | 'component' | 'async';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, component, level = 'component' } = this.props;

    // Log error with structured context
    log.error('Error boundary triggered', {
      error: error.message,
      stack: error.stack,
      component,
      level,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendErrorToMonitoring(error, errorInfo);
    }
  }

  private async sendErrorToMonitoring(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          component: this.props.component,
          level: this.props.level,
          retryCount: this.state.retryCount,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (monitoringError) {
      // Fail silently to avoid infinite loops
      log.warn('Failed to send error to monitoring', { error: monitoringError });
    }
  }

  private handleRetry = async (): Promise<void> => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      log.warn('Max retries reached for error boundary', {
        component: this.props.component,
        retryCount,
        maxRetries,
      });
      return;
    }

    this.setState({ isRecovering: true });

    // Wait before retry
    await new Promise<void>(resolve => {
      this.retryTimeoutId = window.setTimeout(resolve, retryDelay * Math.pow(2, retryCount));
    });

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
    }));

    log.info('Error boundary retry attempted', {
      component: this.props.component,
      retryCount: retryCount + 1,
    });
  };

  override componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  override render(): ReactNode {
    const { hasError, error, isRecovering } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default fallback based on level
      switch (level) {
        case 'root':
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Application Error</h1>
                <p className="text-gray-600 mb-4">
                  We're sorry, but something went wrong. Our team has been notified.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={this.handleRetry}
                    disabled={isRecovering}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRecovering ? 'Recovering...' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Reload Page
                  </button>
                </div>
                {import.meta.env.DEV && error && (
                  <details className="mt-4 text-left">
                    <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );

        case 'route':
          return (
            <div className="flex flex-col items-center justify-center min-h-96 bg-gray-50 rounded-lg p-8">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Page Error</h2>
              <p className="text-gray-600 text-center mb-4">
                This page encountered an error. You can try refreshing or navigating to another page.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  disabled={isRecovering}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecovering ? 'Recovering...' : 'Retry'}
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Go Back
                </button>
              </div>
            </div>
          );

        case 'async':
          return (
            <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800">Loading failed. </span>
                <button
                  onClick={this.handleRetry}
                  disabled={isRecovering}
                  className="text-yellow-600 underline hover:no-underline disabled:opacity-50"
                >
                  {isRecovering ? 'Retrying...' : 'Try again'}
                </button>
              </div>
            </div>
          );

        default:
          return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800">Something went wrong.</span>
                <button
                  onClick={this.handleRetry}
                  disabled={isRecovering}
                  className="text-red-600 underline hover:no-underline disabled:opacity-50"
                >
                  {isRecovering ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          );
      }
    }

    return children;
  }
}

// Specialized error boundaries for different levels
export const RootErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="root" component="App" maxRetries={3}>
    {children}
  </ErrorBoundary>
);

export const RouteErrorBoundary: React.FC<{ children: ReactNode; route?: string }> = ({ 
  children, 
  route = 'unknown' 
}) => (
  <ErrorBoundary level="route" component={`Route: ${route}`} maxRetries={2}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode; 
  component?: string 
}> = ({ children, component = 'Unknown' }) => (
  <ErrorBoundary level="component" component={component} maxRetries={1}>
    {children}
  </ErrorBoundary>
);

export const AsyncErrorBoundary: React.FC<{ 
  children: ReactNode; 
  component?: string 
}> = ({ children, component = 'AsyncComponent' }) => (
  <ErrorBoundary level="async" component={component} maxRetries={3} retryDelay={500}>
    {children}
  </ErrorBoundary>
);

// Hook for programmatic error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: Record<string, unknown>) => {
    log.error('Manual error handled', { error: error.message, context });
  };

  const reportError = (error: Error, context?: Record<string, unknown>) => {
    log.error('Error reported', { error: error.message, context });
    
    if (import.meta.env.PROD) {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Fail silently
      });
    }
  };

  return { handleError, reportError };
};

export default ErrorBoundary;
