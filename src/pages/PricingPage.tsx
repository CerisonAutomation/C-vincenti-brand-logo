import Layout from '@/components/Layout';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Reference pricing image as design guide
const ADDONS = [
  { label: 'Professional photoshoot', price: 'On quotation', note: 'Recommended before going live.' },
  { label: 'Annual deep clean', price: 'On quotation', note: 'Scheduled once per year.' },
  { label: 'MTA licensing', price: '€150 one-time', note: '+ associated authority fees.' },
  { label: 'Procurement & setup works', price: '€25/hr + VAT', note: 'Furniture, fixtures, pre-launch preparation.' },
  { label: 'Mail & bills handling', price: '€10/month', note: 'Full correspondence management.' },
  { label: 'Interior design', price: 'On quotation', note: 'Spatial and aesthetic upgrades.' },
];

export default function PricingPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-14 border-b border-border/30">
        <div className="section-container text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="micro-type text-primary mb-3">Management Plans</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-2">
              One fee.
            </h1>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold gold-text mb-6 italic">
              No surprises.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A single commission on net room revenue. No setup charges, no hidden markups,
              no management fees buried in maintenance invoices.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingSection onOpenWizard={() => {}} />

      {/* Add-ons */}
      <section className="py-14 border-t border-border/30">
        <div className="section-container">
          <div className="text-center mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] mb-2">
              Available on both plans — charged separately
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {ADDONS.map((addon, i) => (
              <motion.div
                key={addon.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="satin-surface rounded-lg p-5"
              >
                <h4 className="text-sm font-semibold text-foreground mb-1">{addon.label}</h4>
                <p className="text-primary text-sm font-medium mb-1">{addon.price}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{addon.note}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-[0.65rem] text-muted-foreground text-center mt-8 max-w-xl mx-auto leading-relaxed">
            Net Room Revenue is calculated on gross rental income, excluding platform commissions, VAT, cleaning fees,
            damage deposits, and optional extras. All agreements are governed by the laws of Malta.
          </p>
        </div>
      </section>

      <FAQSection />

      {/* CTA */}
      <section className="py-14 border-t border-border/30">
        <div className="section-container">
          <div className="satin-surface rounded-2xl p-10 text-center satin-glow max-w-2xl mx-auto">
            <p className="micro-type text-primary mb-3">Ready to get started?</p>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Get a free property estimate
            </h2>
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
