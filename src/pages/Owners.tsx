import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Camera, Rocket, ArrowRight, TrendingUp, Shield, BarChart3, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import ProofStrip from '@/components/ProofStrip';
import ProcessSection from '@/components/ProcessSection';

const STATS = [
  { value: '€2.4M+', label: 'Revenue Generated' },
  { value: '45+', label: 'Properties Managed' },
  { value: '4.97', label: 'Average Rating' },
  { value: '94%', label: 'Occupancy Rate' },
];

const TRUST = [
  { icon: Shield, label: 'No Hidden Markups', desc: 'Maintenance passed at cost, always.' },
  { icon: BarChart3, label: 'Owner Dashboard', desc: 'Live bookings, revenue & statements.' },
  { icon: Clock, label: '24hr Response', desc: 'Guaranteed reply, every time.' },
  { icon: TrendingUp, label: 'Dynamic Pricing', desc: 'AI-optimised nightly rates.' },
];

export default function Owners() {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="py-20 satin-glow border-b border-border/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl"
          >
            <p className="micro-type text-primary mb-3">For Property Owners</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Turn your property into a{' '}
              <span className="gold-text">performing asset</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-xl mb-10">
              Full-service short-let management across Malta and Gozo.
              We handle everything — you receive monthly payouts and transparent reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/owners/estimate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Get Your Free Estimate <ArrowRight size={14} />
              </Link>
              <Link
                to="/owners/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="satin-surface rounded-lg p-5"
              >
                <p className="font-serif text-3xl font-bold text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <ProofStrip />

      {/* ── How It Works ── */}
      <ProcessSection />

      {/* ── Why Choose Us ── */}
      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="micro-type text-primary mb-3">Why Christiano Vincenti</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              The difference is in the <span className="gold-text">detail</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="satin-surface rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <t.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{t.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <PricingSection onOpenWizard={() => { window.location.href = '/owners/estimate'; }} />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <div className="satin-surface rounded-2xl p-10 text-center satin-glow">
            <p className="micro-type text-primary mb-3">Ready to begin?</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Get a free, no-obligation estimate
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Tell us about your property and we'll provide a detailed rental income projection within 24 hours.
            </p>
            <Link
              to="/owners/estimate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start Free Estimate <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
