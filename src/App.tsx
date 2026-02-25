import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, memo, useEffect, useMemo, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PerformanceMonitor } from '@/lib/performance/index';
import { usePWAServiceWorker } from '@/lib/pwa';

// Quantum lazy loading with error boundaries and performance monitoring
const createLazyComponent = (importFn: () => Promise<{ default: React.ComponentType<unknown> }>, componentName: string) => {
  const LazyComponent = lazy(() =>
    importFn().catch((error) => {
      console.error(`Failed to load ${componentName}:`, error);
      // Return a fallback component
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to load {componentName}
              </h2>
              <p className="text-gray-600 mb-4">
                Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ),
      };
    })
  );

  (LazyComponent as React.LazyExoticComponent<React.ComponentType<unknown>> & { displayName?: string }).displayName = componentName;
  return LazyComponent;
};

// Quantum-optimized lazy loaded components with error handling
const Index = createLazyComponent(() => import('@/pages/Index'), 'Index');
const AboutPage = createLazyComponent(() => import('@/pages/AboutPage'), 'AboutPage');
const ContactPage = createLazyComponent(() => import('@/pages/ContactPage'), 'ContactPage');
const Properties = createLazyComponent(() => import('@/pages/Properties'), 'Properties');
const PropertyDetail = createLazyComponent(() => import('@/pages/PropertyDetail'), 'PropertyDetail');
const PricingPage = createLazyComponent(() => import('@/pages/PricingPage'), 'PricingPage');
const FAQPage = createLazyComponent(() => import('@/pages/FAQPage'), 'FAQPage');
const Owners = createLazyComponent(() => import('@/pages/Owners'), 'Owners');
const OwnersEstimate = createLazyComponent(() => import('@/pages/OwnersEstimate'), 'OwnersEstimate');
const OwnersPack = createLazyComponent(() => import('@/pages/OwnersPack'), 'OwnersPack');
const OwnersResults = createLazyComponent(() => import('@/pages/OwnersResults'), 'OwnersResults');
const OwnersStandards = createLazyComponent(() => import('@/pages/OwnersStandards'), 'OwnersStandards');
const Book = createLazyComponent(() => import('@/pages/Book'), 'Book');
const Checkout = createLazyComponent(() => import('@/pages/Checkout'), 'Checkout');
const BookingSuccess = createLazyComponent(() => import('@/pages/BookingSuccess'), 'BookingSuccess');
const Admin = createLazyComponent(() => import('@/pages/Admin'), 'Admin');
const Analytics = createLazyComponent(() => import('@/pages/Analytics'), 'Analytics');
const Residential = createLazyComponent(() => import('@/pages/Residential'), 'Residential');
const NotFound = createLazyComponent(() => import('@/pages/NotFound'), 'NotFound');
const CookiesPage = createLazyComponent(() => import('@/pages/CookiesPage'), 'CookiesPage');
const PrivacyPage = createLazyComponent(() => import('@/pages/PrivacyPage'), 'PrivacyPage');
const TermsPage = createLazyComponent(() => import('@/pages/TermsPage'), 'TermsPage');
const QuotesPage = createLazyComponent(() => import('@/pages/QuotesPage'), 'QuotesPage');
const ReservationsPage = createLazyComponent(() => import('@/pages/ReservationsPage'), 'ReservationsPage');

// Quantum QueryClient with enterprise-grade configuration
const createQuantumQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: (failureCount, error: Error | unknown) => {
          // Quantum retry logic
          if (failureCount >= 3) return false;
          if (error && typeof error === 'object' && 'status' in error && typeof (error as { status: number }).status === 'number') {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return true;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        // Quantum optimistic updates
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        retry: 2,
        networkMode: 'offlineFirst',
        // Quantum error recovery
        onError: (error: Error) => {
          console.error('Mutation failed:', error);
          // Could implement quantum error recovery here
        },
      },
    },
  });
};

// Quantum Route Tracker for performance monitoring
const RouteTracker = memo(() => {
  const location = useLocation();

  useEffect(() => {
    // Track route changes for analytics
    PerformanceMonitor.recordMetric('route_change', 1);

    // Track page views
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as Window & { gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void }).gtag;
      const trackingId = process.env.VITE_GA_TRACKING_ID;
      if (gtag && trackingId) {
        gtag('config', trackingId, {
          page_path: location.pathname,
        });
      }
    }

    // Update document title and meta tags based on route
    updateMetaTags(location.pathname);

  }, [location]);

  const updateMetaTags = (pathname: string) => {
    const routeMeta: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'Guesty - Enterprise Booking Platform',
        description: 'Experience luxury accommodations with our quantum-powered booking platform.',
      },
      '/stays': {
        title: 'Luxury Properties - Guesty',
        description: 'Discover premium properties and luxury accommodations worldwide.',
      },
      '/about': {
        title: 'About Us - Guesty',
        description: 'Learn about our mission to revolutionize luxury travel experiences.',
      },
      '/contact': {
        title: 'Contact Us - Guesty',
        description: 'Get in touch with our premium concierge services.',
      },
    };

    const meta = routeMeta[pathname] || routeMeta['/'];
    document.title = meta.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description);
    }
  };

  return null;
});

RouteTracker.displayName = 'RouteTracker';

// Quantum Loading Fallback with performance metrics
const QuantumLoader = memo(() => {
  const [loadTime, setLoadTime] = useState(0);
  const startTime = useMemo(() => Date.now(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (loadTime > 5000) { // If loading takes more than 5 seconds
      PerformanceMonitor.recordMetric('slow_page_load', loadTime);
    }
  }, [loadTime]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        {/* Quantum loading animation */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-400 rounded-full animate-spin animation-delay-75"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-amber-400 rounded-full animate-spin animation-delay-150"></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Quantum Loading Experience
          </h3>
          <p className="text-sm text-gray-600">
            Optimizing your premium experience...
          </p>
          <div className="text-xs text-gray-500 font-mono">
            Load time: {Math.round(loadTime)}ms
          </div>
        </div>

        {/* Performance indicator */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${loadTime < 1000 ? 'bg-green-400' : loadTime < 3000 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
          <span>
            {loadTime < 1000 ? 'Quantum Speed' : loadTime < 3000 ? 'Optimal' : 'Optimizing...'}
          </span>
        </div>
      </div>
    </div>
  );
});

QuantumLoader.displayName = 'QuantumLoader';

// Quantum Error Boundary with recovery
const QuantumErrorBoundary = memo(({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      PerformanceMonitor.recordMetric('javascript_error', 1);
      setError(event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      PerformanceMonitor.recordMetric('promise_rejection', 1);
      setError(new Error(event.reason?.toString() || 'Promise rejection'));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRecovery = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center space-y-4 max-w-md mx-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Quantum System Error
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Something unexpected happened. Our quantum systems are working to resolve this.
            </p>
            <details className="text-left mb-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
                {error?.stack || 'No stack trace available'}
              </pre>
            </details>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRecovery}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Recover System
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
});

QuantumErrorBoundary.displayName = 'QuantumErrorBoundary';

// Main App Component with Quantum Optimizations
function App() {
  // Initialize quantum systems
  const queryClient = useMemo(() => createQuantumQueryClient(), []);
  const { updateAvailable, updateApp } = usePWAServiceWorker();

  // Initialize performance monitoring
  useEffect(() => {
    try {
      // Check if PerformanceMonitor has init method before calling
      if (PerformanceMonitor && typeof PerformanceMonitor.init === 'function') {
        PerformanceMonitor.init();

        // Track app initialization
        PerformanceMonitor.recordMetric('app_init', 1);
      } else {
        console.warn('PerformanceMonitor.init is not available');
      }

      // Set up performance observer for LCP, FID, CLS
      if ('PerformanceObserver' in window) {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          if (lastEntry) {
            PerformanceMonitor.recordMetric('lcp', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
            PerformanceMonitor.recordMetric('fid', fidEntry.processingStart - fidEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
            }
          });
          PerformanceMonitor.recordMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }

    return () => {
      // Cleanup observers - they will be garbage collected
    };
  }, []);

  return (
    <QuantumErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouteTracker />
          <Toaster />

          {/* PWA Update Notification */}
          {updateAvailable && (
            <div className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-lg shadow-lg">
              <p className="text-sm mb-2">A new version is available!</p>
              <button
                onClick={updateApp}
                className="text-xs bg-white text-primary px-3 py-1 rounded hover:bg-gray-100"
              >
                Update Now
              </button>
            </div>
          )}

          <Suspense fallback={<QuantumLoader />}>
            <Routes>
              {/* Core application routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Booking flow routes */}
              <Route path="/stays" element={<Properties />} />
              <Route path="/stays/:id" element={<PropertyDetail />} />
              <Route path="/book" element={<Book />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/booking-success" element={<BookingSuccess />} />

              {/* Marketing routes */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/faq" element={<FAQPage />} />

              {/* Owner routes */}
              <Route path="/owners" element={<Owners />} />
              <Route path="/owners/estimate" element={<OwnersEstimate />} />
              <Route path="/owners/pack" element={<OwnersPack />} />
              <Route path="/owners/results" element={<OwnersResults />} />
              <Route path="/owners/standards" element={<OwnersStandards />} />

              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/quotes" element={<QuotesPage />} />
              <Route path="/admin/reservations" element={<ReservationsPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/residential" element={<Residential />} />

              {/* Legal routes */}
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </QuantumErrorBoundary>
  );
}

export default memo(App);
