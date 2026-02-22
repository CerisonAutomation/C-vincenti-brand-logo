import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WizardModal from "@/components/WizardModal";

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main">
        <Hero onOpenWizard={() => setWizardOpen(true)} />
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
