import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import LoadingScreen from "@/components/LoadingScreen";

// Eager: critical routes
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";

// Lazy: less critical routes
const Checkout = lazy(() => import("./pages/Checkout"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const Residential = lazy(() => import("./pages/Residential"));
const Book = lazy(() => import("./pages/Book"));
const Owners = lazy(() => import("./pages/Owners"));
const OwnersEstimate = lazy(() => import("./pages/OwnersEstimate"));
const OwnersStandards = lazy(() => import("./pages/OwnersStandards"));
const OwnersResults = lazy(() => import("./pages/OwnersResults"));
const OwnersPack = lazy(() => import("./pages/OwnersPack"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
