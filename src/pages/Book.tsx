import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Clock, Star } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Secure Booking', desc: 'All payments encrypted & protected' },
  { icon: CreditCard, title: 'Best Price', desc: 'No markups — direct owner rates' },
  { icon: Clock, title: 'Instant Confirm', desc: 'Get confirmation within minutes' },
  { icon: Star, title: '4.97 Rating', desc: 'Verified guest satisfaction' },
];

export default function Book() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="micro-type text-primary mb-3">Book Direct</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Reserve your <span className="gold-text">stay</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search, select, and book — everything happens right here.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <BookingSearchBar variant="hero" />
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
