import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onOpenWizard: () => void;
}

const PLANS = [
  {
    name: "Essentials",
    price: "15%",
    subtitle: "of booking revenue",
    desc: "Perfect for owners who want professional listing management with hands-on involvement.",
    features: [
      "Professional photography",
      "Multi-platform listing",
      "Dynamic pricing",
      "Guest communication",
      "Monthly reporting",
      "MTA licence guidance",
    ],
    highlighted: false,
  },
  {
    name: "Complete",
    price: "20%",
    subtitle: "of booking revenue",
    desc: "Full hands-off management. We handle everything so you don't have to lift a finger.",
    features: [
      "Everything in Essentials",
      "Cleaning coordination",
      "Maintenance at cost",
      "Linen & amenities",
      "Direct booking website",
      "Owner dashboard access",
      "Priority 24hr support",
      "Quarterly strategy review",
    ],
    highlighted: true,
  },
];

export default function PricingSection({ onOpenWizard }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-12 sm:py-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="micro-type text-primary mb-3">Pricing</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
            Simple, <span className="gold-text">transparent</span> pricing
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">No setup fees. No hidden costs. You only pay when you earn.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`glass-surface rounded-lg p-6 relative ${
                plan.highlighted ? "border-primary/50 shadow-[var(--shadow-gold)]" : ""
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 micro-type px-3 py-1 bg-primary text-primary-foreground rounded-full text-[0.6rem]">
                  Most Popular
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/owners/estimate"
                className={`block w-full py-3 text-sm font-semibold rounded transition-colors text-center ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                Get Started
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
