import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Do I need an MTA licence to rent short-term in Malta?",
    a: "Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service.",
  },
  {
    q: "What areas do you cover?",
    a: "We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa.",
  },
  {
    q: "How quickly can my property go live?",
    a: "Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup.",
  },
  {
    q: "What happens with maintenance issues?",
    a: "We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold.",
  },
  {
    q: "Can I block dates for personal use?",
    a: "Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties.",
  },
  {
    q: "What's included in the monthly reporting?",
    a: "You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-12 sm:py-16 bg-card/30">
      <div className="section-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="micro-type text-primary mb-3">FAQ</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
            Common <span className="gold-text">questions</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-surface rounded-lg px-5 border border-border/50 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-serif text-sm font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
