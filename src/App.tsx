import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loaded components for optimal bundle splitting
const Index = lazy(() => import('@/pages/Index'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const Properties = lazy(() => import('@/pages/Properties'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const Owners = lazy(() => import('@/pages/Owners'));
const OwnersEstimate = lazy(() => import('@/pages/OwnersEstimate'));
const OwnersPack = lazy(() => import('@/pages/OwnersPack'));
const OwnersResults = lazy(() => import('@/pages/OwnersResults'));
const OwnersStandards = lazy(() => import('@/pages/OwnersStandards'));
const Book = lazy(() => import('@/pages/Book'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const BookingSuccess = lazy(() => import('@/pages/BookingSuccess'));
const Admin = lazy(() => import('@/pages/Admin'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Residential = lazy(() => import('@/pages/Residential'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const CookiesPage = lazy(() => import('@/pages/CookiesPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const QuotesPage = lazy(() => import('@/pages/QuotesPage'));
const ReservationsPage = lazy(() => import('@/pages/ReservationsPage'));

// GuestPortal component not found - commented out until available
// const GuestPortal = lazy(() => import('@/pages/GuestPortal'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Simple loading fallback for lazy components
const SimpleLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Toaster />
          <Routes>
          <Route path="/" element={<Suspense fallback={<SimpleLoader />}><Index /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<SimpleLoader />}><AboutPage /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<SimpleLoader />}><ContactPage /></Suspense>} />
          <Route path="/properties" element={<Suspense fallback={<SimpleLoader />}><Properties /></Suspense>} />
          <Route path="/properties/:id" element={<Suspense fallback={<SimpleLoader />}><PropertyDetail /></Suspense>} />
          <Route path="/pricing" element={<Suspense fallback={<SimpleLoader />}><PricingPage /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={<SimpleLoader />}><FAQPage /></Suspense>} />
          <Route path="/owners" element={<Suspense fallback={<SimpleLoader />}><Owners /></Suspense>} />
          <Route path="/owners/estimate" element={<Suspense fallback={<SimpleLoader />}><OwnersEstimate /></Suspense>} />
          <Route path="/owners/pack" element={<Suspense fallback={<SimpleLoader />}><OwnersPack /></Suspense>} />
          <Route path="/owners/results" element={<Suspense fallback={<SimpleLoader />}><OwnersResults /></Suspense>} />
          <Route path="/owners/standards" element={<Suspense fallback={<SimpleLoader />}><OwnersStandards /></Suspense>} />
          <Route path="/book" element={<Suspense fallback={<SimpleLoader />}><Book /></Suspense>} />
          <Route path="/checkout" element={<Suspense fallback={<SimpleLoader />}><Checkout /></Suspense>} />
          <Route path="/booking-success" element={<Suspense fallback={<SimpleLoader />}><BookingSuccess /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<SimpleLoader />}><Admin /></Suspense>} />
          <Route path="/admin/quotes" element={<Suspense fallback={<SimpleLoader />}><QuotesPage /></Suspense>} />
          <Route path="/admin/reservations" element={<Suspense fallback={<SimpleLoader />}><ReservationsPage /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<SimpleLoader />}><Analytics /></Suspense>} />
          <Route path="/residential" element={<Suspense fallback={<SimpleLoader />}><Residential /></Suspense>} />
          {/* GuestPortal route commented out until component is available */}
          {/* <Route path="/guest-portal" element={<Suspense fallback={<SimpleLoader />}><GuestPortal /></Suspense>} /> */}
          <Route path="/cookies" element={<Suspense fallback={<SimpleLoader />}><CookiesPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<SimpleLoader />}><PrivacyPage /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<SimpleLoader />}><TermsPage /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<SimpleLoader />}><NotFound /></Suspense>} />
        </Routes>
      </Router>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
