import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Key } from "lucide-react";
import heroMalta from "@/assets/hero-malta.jpg";
import heroResidential from "@/assets/hero-residential.jpg";

interface HeroProps {
  onOpenWizard: () => void;
}

export default function Hero({ onOpenWizard }: HeroProps) {
  return (
    <section aria-label="Hero section with owner and guest services" className="relative min-h-screen flex">
      {/* ── LEFT: Institutional / Owner Services ── */}
      <div aria-label="Owner services section" className="relative w-full md:w-1/2 flex flex-col justify-between bg-background overflow-hidden min-h-[50vh] md:min-h-screen">
        {/* Subtle background image overlay */}
        <div className="absolute inset-0">
          <img src={heroMalta} alt="" className="w-full h-full object-cover opacity-[0.06]" aria-hidden="true" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-20 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center mb-8">
              <FileText size={20} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">Owner Services</p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-2">
              Institutional
            </h1>
            <div className="h-3 w-64 sm:w-80 bg-primary/80 mb-8" />

            <p className="text-muted-foreground leading-relaxed max-w-md mb-10">
              Maximize your asset's performance through our proprietary operational protocols.
              Professional stewardship for Malta's most distinguished portfolios.
            </p>

            <button
              onClick={onOpenWizard}
              className="group inline-flex items-center gap-3 micro-type text-primary hover:text-foreground transition-colors"
            >
              Initialize Management
              <span className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={16} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </button>
          </motion.div>
        </div>

        {/* Bottom proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 border-t border-border/30 px-8 sm:px-12 lg:px-16 py-4 flex items-center gap-8 text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]"
        >
          <span>MTA Licensed Operator</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Securing Malta's Premier Properties</span>
        </motion.div>
      </div>

      {/* ── RIGHT: Residential / Guest Services ── */}
      <div aria-label="Guest services section" className="relative w-full md:w-1/2 flex flex-col justify-between overflow-hidden min-h-[50vh] md:min-h-screen">
        {/* Full background image */}
        <div className="absolute inset-0">
          <img
            src={heroResidential}
            alt="Luxury Mediterranean residence with sea view — Malta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-20 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center mb-8">
              <Key size={20} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">Guest Services</p>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-2">
              Residential
            </h2>
            <div className="h-3 w-64 sm:w-80 bg-primary/80 mb-8" />

            <p className="text-foreground/80 leading-relaxed max-w-md mb-10">
              Access our hand-curated collection of verified luxury residences.
              Defining a new standard for Mediterranean stays.
            </p>

            <Link
              to="/properties"
              className="group inline-flex items-center gap-3 micro-type text-primary hover:text-foreground transition-colors"
            >
              Explore Collection
              <span className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={16} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 border-t border-foreground/10 px-8 sm:px-12 lg:px-16 py-4 flex items-center gap-8 text-[0.6rem] text-foreground/50 uppercase tracking-[0.2em]"
        >
          <span>4.97 Average Rating</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">info@christianopm.com</span>
        </motion.div>
      </div>
    </section>
  );
}
