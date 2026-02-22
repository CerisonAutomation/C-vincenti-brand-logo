import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import LoadingScreen from "@/components/LoadingScreen";
import Index from "./pages/Index";
import Residential from "./pages/Residential";
import Properties from "./pages/Properties";
import Book from "./pages/Book";
import Owners from "./pages/Owners";
import OwnersEstimate from "./pages/OwnersEstimate";
import OwnersStandards from "./pages/OwnersStandards";
import OwnersResults from "./pages/OwnersResults";
import OwnersPack from "./pages/OwnersPack";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiesPage from "./pages/CookiesPage";
import TermsPage from "./pages/TermsPage";
import Admin from "./pages/Admin";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

const App = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/residential" element={<Residential />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
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
        </BrowserRouter>
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
