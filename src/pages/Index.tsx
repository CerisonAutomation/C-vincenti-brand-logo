import { lazy, Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WizardModal from "@/components/WizardModal";
import { SignedIn, UserButton, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';

// Lazy load Hero for better performance
const Hero = lazy(() => import("@/components/Hero"));

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded z-50">
        Skip to main content
      </a>
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main" role="main">
        <div>
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
          <Hero onOpenWizard={() => setWizardOpen(true)} />
        </Suspense>
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
