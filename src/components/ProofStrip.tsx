import { motion } from "framer-motion";
import { Shield, BarChart3, Clock, Star } from "lucide-react";

const PROOFS = [
  { icon: Shield, label: "No Hidden Markups", desc: "Maintenance at cost" },
  { icon: BarChart3, label: "Owner Dashboard", desc: "Monthly statements" },
  { icon: Clock, label: "24hr Response", desc: "Guaranteed reply" },
  { icon: Star, label: "5-Star Reviews", desc: "Guest satisfaction" },
];

export default function ProofStrip() {
  return (
    <section className="py-8 border-y border-border bg-card/50">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {PROOFS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <p.icon size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
