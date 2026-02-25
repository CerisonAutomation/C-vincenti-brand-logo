import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Bath, Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/content';
import type { NormalizedListingSummary } from '@/lib/guesty/normalizer';

interface PropertyCardProps {
  property: NormalizedListingSummary;
  index: number;
  prefetch: (id: string) => void;
  buildDetailLink: (id: string) => string;
}

const PropertyCard = memo(({ property, index, prefetch, buildDetailLink }: PropertyCardProps) => (
  <Link
    to={buildDetailLink(property.id)}
    onMouseEnter={() => prefetch(property.id)}
  >
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.heroImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        {property.rating != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star size={12} className="text-primary fill-primary" />
            <span className="text-xs font-semibold text-foreground">{property.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-background/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          {property.propertyType.replace(/_/g, ' ')}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/50 to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <MapPin size={12} className="text-primary" /> {property.city}
        </div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {property.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><BedDouble size={13} /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={13} /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Users size={13} /> {property.accommodates}</span>
        </div>
        {/* Tags */}
        {property.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.tags.slice(0, 3).map((tag, j) => (
              <span key={j} className="text-[9px] text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          {property.basePrice > 0 ? (
            <p className="text-foreground font-semibold">
              {formatCurrency(property.basePrice)}
              <span className="text-xs font-normal text-muted-foreground"> / night</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">View rates</p>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            View <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </motion.article>
  </Link>
));

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
