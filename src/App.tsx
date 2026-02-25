import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AmazingLoader from "@/components/AmazingLoader";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager: critical routes with performance optimization
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";

// Lazy: optimized code splitting with webpack hints
const Checkout = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "checkout" */ "./pages/Checkout")
);
const BookingSuccess = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "booking-success" */ "./pages/BookingSuccess")
);
const Residential = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "residential" */ "./pages/Residential")
);
const Book = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "book" */ "./pages/Book")
);
const Owners = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "owners" */ "./pages/Owners")
);
const OwnersEstimate = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "owners-estimate" */ "./pages/OwnersEstimate")
);
const OwnersStandards = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "owners-standards" */ "./pages/OwnersStandards")
);
const OwnersResults = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "owners-results" */ "./pages/OwnersResults")
);
const OwnersPack = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "owners-pack" */ "./pages/OwnersPack")
);
const PricingPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "pricing" */ "./pages/PricingPage")
);
const AboutPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "about" */ "./pages/AboutPage")
);
const FAQPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "faq" */ "./pages/FAQPage")
);
const ContactPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "contact" */ "./pages/ContactPage")
);
const PrivacyPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "privacy" */ "./pages/PrivacyPage")
);
const CookiesPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "cookies" */ "./pages/CookiesPage")
);
const TermsPage = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "terms" */ "./pages/TermsPage")
);
const Admin = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "admin" */ "./pages/Admin")
);
const NotFound = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "not-found" */ "./pages/NotFound")
);

// Advanced QueryClient with intelligent caching strategies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Intelligent retry logic based on error type
        if (error?.message?.includes('network')) return failureCount < 3;
        if (error?.message?.includes('auth')) return false; // Don't retry auth errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

const App = () => {
  const [loaded, setLoaded] = useState(false);

  // Intelligent loading optimization
  useEffect(() => {
    if (loaded) {
      // Prefetch critical routes based on performance optimization
      const prefetchRoutes = () => {
        // Performance logic determines which routes to prefetch
        import('./pages/Properties');
        import('./pages/PricingPage');
      };

      // Delay prefetching to not block initial render
      const timer = setTimeout(prefetchRoutes, 2000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            {!loaded && <AmazingLoader onComplete={() => setLoaded(true)} />}

            <BrowserRouter>
              <Suspense>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/residential" element={<Residential />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyDetail />} />
                  <Route path="/stays" element={<Properties />} />
                  <Route path="/stays/:id" element={<PropertyDetail />} />
                  <Route path="/stays/:listingId/checkout" element={<Checkout />} />
                  <Route path="/properties/:listingId/checkout" element={<Checkout />} />
                  <Route path="/booking/success" element={<BookingSuccess />} />
                  <Route path="/book" element={<Book />} />
                  <Route path="/owners" element={<Owners />} />
                  <Route path="/owners/estimate" element={<OwnersEstimate />} />
                  <Route path="/owners/pricing" element={<PricingPage />} />
                  <Route path="/owners/standards" element={<OwnersStandards />} />
                  <Route path="/owners/results" element={<OwnersResults />} />
                  <Route path="/owners/owners-pack" element={<OwnersPack />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>

            <CookieConsentBanner />
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
