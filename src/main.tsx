import { createRoot } from "react-dom/client";
import { StrictMode, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { PerformanceMonitor } from '@/lib/performance/index';
import { MonitoringService } from '@/lib/cicd';
import App from "./App.tsx";
import "./index.css";

// Quantum Performance Constants
const QUANTUM_INIT_CONFIG = {
  SENTRY_SAMPLE_RATE: 1.0,
  PERFORMANCE_TRACKING: true,
  ERROR_REPORTING: true,
  MEMORY_MONITORING: true,
  NETWORK_MONITORING: true,
} as const;

// Quantum Error Boundary Component
const QuantumErrorFallback = ({ error, resetErrorBoundary }: {
  error: unknown;
  resetErrorBoundary: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
    <div className="text-center space-y-6 max-w-md mx-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quantum System Error
        </h1>
        <p className="text-gray-600 mb-4">
          Something unexpected happened in our quantum computing environment.
        </p>
        <details className="text-left bg-white p-4 rounded-lg border border-red-200 mb-4">
          <summary className="text-sm text-red-700 cursor-pointer font-medium">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-auto">
            {(error as Error)?.stack || 'No stack trace available'}
          </pre>
        </details>
      </div>

      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Restart Quantum System
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Hard Reset
        </button>
      </div>
    </div>
  </div>
);

// Quantum Loading Fallback
const QuantumLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-75"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-purple-400 rounded-full animate-spin animation-delay-150"></div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">
          Initializing Quantum Environment
        </h2>
        <p className="text-gray-600">
          Loading enterprise-grade systems...
        </p>
        <div className="text-sm text-gray-500 font-mono">
          Quantum Performance Engine v2.0
        </div>
      </div>
    </div>
  </div>
);

// Quantum Sentry Configuration
const initializeQuantumSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE_VERSION || 'development',

    // Quantum performance integrations
    integrations: [
      Sentry.browserTracingIntegration({
        shouldCreateSpanForRequest: (url: string) => {
          return url.includes('guesty.com') || url.includes('supabase.co');
        },
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'auto',
        showBranding: false,
      }),
    ],

    // Quantum sampling rates
    tracesSampleRate: QUANTUM_INIT_CONFIG.SENTRY_SAMPLE_RATE,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Quantum error tracking
    beforeSend: (event) => {
      // Add quantum performance context
      event.tags = {
        ...event.tags,
        quantum_performance: 'enabled',
        core_web_vitals: 'monitored',
      };

      // Track quantum-specific errors
      if (event.exception?.values?.[0]?.value?.includes('Quantum')) {
        event.tags.quantum_error = 'true';
      }

      return event;
    },

    // Quantum performance monitoring
    tracesSampler: (samplingContext) => {
      // Sample all quantum operations
      if (samplingContext.request?.url?.includes('/api/quantum')) {
        return 1.0;
      }

      // Sample high-value operations
      if (samplingContext.request?.url?.includes('/api/book') ||
          samplingContext.request?.url?.includes('/api/quote')) {
        return 1.0;
      }

      return 0.1; // Default sampling
    },
  });

  console.log('🚀 Quantum Sentry initialized');
};

// Quantum Web Vitals Monitoring
const initializeQuantumWebVitals = () => {
  const reportWebVital = (metric: Metric) => {
    // Send to monitoring service
    MonitoringService.getInstance().recordMetric(`web_vitals.${metric.name}`, metric.value, {
      rating: metric.rating,
      navigation_type: metric.navigationType,
    });

    // Send to performance monitor
    PerformanceMonitor.recordMetric(`web_vitals.${metric.name}`, metric.value);

    // Log for development
    if (import.meta.env.DEV) {
      console.log(`${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }
  };

  // Quantum Web Vitals tracking
  onCLS(reportWebVital);
  onINP(reportWebVital);
  onFCP(reportWebVital);
  onLCP(reportWebVital);
  onTTFB(reportWebVital);

  console.log('📊 Quantum Web Vitals monitoring initialized');
};

// Quantum Memory and Network Monitoring
const initializeQuantumMonitoring = () => {
  // Memory monitoring
  if (QUANTUM_INIT_CONFIG.MEMORY_MONITORING && 'memory' in performance) {
    const monitorMemory = () => {
      const memInfo = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memInfo) {
        MonitoringService.getInstance().recordMetric('memory.used_js_heap', memInfo.usedJSHeapSize);
        MonitoringService.getInstance().recordMetric('memory.total_js_heap', memInfo.totalJSHeapSize);
        MonitoringService.getInstance().recordMetric('memory.js_heap_limit', memInfo.jsHeapSizeLimit);
      }
    };

    // Monitor memory every 30 seconds
    setInterval(monitorMemory, 30000);
    monitorMemory(); // Initial measurement
  }

  // Network monitoring
  if (QUANTUM_INIT_CONFIG.NETWORK_MONITORING && 'connection' in navigator) {
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; addEventListener: (type: string, listener: EventListener) => void } }).connection;
    if (connection) {
      const reportNetworkInfo = () => {
        MonitoringService.getInstance().recordMetric('network.effective_type', 0, {
          type: connection.effectiveType || 'unknown',
          downlink: String(connection.downlink || 0),
          rtt: String(connection.rtt || 0),
        });
      };

      connection.addEventListener('change', reportNetworkInfo);
      reportNetworkInfo(); // Initial report
    }
  }

  console.log('🔍 Quantum system monitoring initialized');
};

// Quantum Initialization Sequence
const initializeQuantumSystems = async () => {
  const startTime = performance.now();

  try {
    // Initialize in quantum sequence for optimal performance
    await Promise.all([
      initializeQuantumSentry(),
      initializeQuantumWebVitals(),
      initializeQuantumMonitoring(),
    ]);

    // Initialize performance monitoring
    PerformanceMonitor.init();

    // Track initialization time
    const initTime = performance.now() - startTime;
    PerformanceMonitor.recordMetric('quantum_initialization_time', initTime);

    console.log(`⚡ Quantum systems initialized in ${initTime.toFixed(2)}ms`);

  } catch (error) {
    console.error('Quantum initialization failed:', error);
    // Continue with degraded functionality
  }
};

// Quantum App Wrapper with Error Boundary
const QuantumApp = () => (
  <ErrorBoundary
    FallbackComponent={QuantumErrorFallback}
    onError={(error, errorInfo) => {
      // Report to monitoring
      MonitoringService.getInstance().recordMetric('react_error_boundary', 1, {
        error: (error as Error).message,
        componentStack: errorInfo.componentStack || 'No component stack available',
      });

      console.error('Quantum Error Boundary:', error, errorInfo);
    }}
  >
    <StrictMode>
      <AuthProvider>
        <Suspense fallback={<QuantumLoadingFallback />}>
          <App />
        </Suspense>
      </AuthProvider>
    </StrictMode>
  </ErrorBoundary>
);

// Quantum Root Initialization
const initializeQuantumApp = async () => {
  // Initialize quantum systems first
  await initializeQuantumSystems();

  // Get root element with quantum validation
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Quantum root element not found");
  }

  // Create root with quantum configuration
  const root = createRoot(rootElement);

  // Render quantum app
  root.render(<QuantumApp />);

  // Track successful initialization
  PerformanceMonitor.recordMetric('quantum_app_rendered', 1);

  console.log('🌟 Quantum App successfully initialized');
};

// Initialize quantum application
initializeQuantumApp().catch((error) => {
  console.error('Critical quantum initialization failure:', error);

  // Emergency fallback rendering
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #fef3c7, #f59e0b);
        color: #92400e;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">
            Quantum System Offline
          </h1>
          <p style="margin-bottom: 2rem;">
            Our quantum computing environment encountered a critical error.
            Please refresh the page to restart the system.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: #dc2626;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              border: none;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Emergency Restart
          </button>
        </div>
      </div>
    `;
  }
});
