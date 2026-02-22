import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, BedDouble, Bath, ArrowRight } from "lucide-react";
import propertyFives from "@/assets/property-fives.jpg";
import propertyUrsula from "@/assets/property-ursula.jpg";
import propertyPenthouse from "@/assets/property-penthouse.jpg";

const PROPERTIES = [
  {
    img: propertyFives,
    title: "The Fives Apartments",
    location: "St Julian's, Malta",
    type: "Apartment",
    guests: 6,
    beds: 3,
    baths: 3,
    price: "€180",
  },
  {
    img: propertyUrsula,
    title: "123 St Ursula Street",
    location: "Valletta, Malta",
    type: "Apartment",
    guests: 4,
    beds: 1,
    baths: 2,
    price: "€150",
  },
  {
    img: propertyPenthouse,
    title: "St. Julian's Penthouse",
    location: "San Ġiljan, Malta",
    type: "Penthouse",
    guests: 4,
    beds: 2,
    baths: 2,
    price: "€155",
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-16 sm:py-20 bg-card/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="micro-type text-primary mb-3">Our Properties</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
            Currently <span className="gold-text">managed</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Each property is styled and managed to five-star standards. Book directly on our platform.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROPERTIES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-surface rounded-lg overflow-hidden hover:border-primary/30 transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 text-[0.65rem] font-semibold bg-primary text-primary-foreground rounded-full">
                  from {p.price}/night
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {p.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{p.location} · {p.type}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={12} /> {p.guests}</span>
                  <span className="flex items-center gap-1"><BedDouble size={12} /> {p.beds} Bed</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> {p.baths} Bath</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border text-foreground rounded hover:border-primary hover:text-primary transition-colors"
          >
            View All Properties <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
