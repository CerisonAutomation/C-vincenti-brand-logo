import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Users, BedDouble, Bath, ArrowRight } from "lucide-react";

export default function PortfolioSection() {
  const { data: properties, isLoading, error } = useQuery<Database['public']['Tables']['cms_properties']['Row'][]>({
    queryKey: ['portfolio-properties'],
    queryFn: async (): Promise<Database['public']['Tables']['cms_properties']['Row'][]> => {
      const { data, error } = await supabase
        .from('cms_properties')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: true })
        .limit(6); // Show up to 6 properties

      if (error) throw error;
      return (data as Database['public']['Tables']['cms_properties']['Row'][]) || [];
    },
  });

  if (isLoading) {
    return (
      <section id="portfolio" className="py-16 sm:py-20 bg-card/30">
        <div className="section-container">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="portfolio" className="py-16 sm:py-20 bg-card/30">
        <div className="section-container">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Properties</h3>
              <p className="text-sm text-muted-foreground">Unable to load property information.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
          {properties?.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-surface rounded-lg overflow-hidden hover:border-primary/30 transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={p.image_url || '/api/placeholder/400/300'}
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
                <p className="text-xs text-muted-foreground mb-3">{p.location}</p>
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
