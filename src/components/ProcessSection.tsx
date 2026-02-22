import { motion } from "framer-motion";
import { ClipboardCheck, Camera, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Free Assessment",
    desc: "Tell us about your property and goals. We'll analyse your potential income and recommend the right plan.",
  },
  {
    icon: Camera,
    step: "02",
    title: "We Set You Up",
    desc: "Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "You Earn More",
    desc: "We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports.",
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-12 sm:py-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="micro-type text-primary mb-3">How It Works</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
            Three steps to <span className="gold-text">stress-free</span> income
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="glass-surface rounded-lg p-5 relative group hover:border-primary/30 transition-colors"
            >
              <span className="absolute top-4 right-4 font-serif text-4xl font-bold text-border/50 group-hover:text-primary/20 transition-colors">
                {s.step}
              </span>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <s.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
