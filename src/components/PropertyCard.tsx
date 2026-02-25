import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Bath, Users, ArrowRight, Heart, Wifi, Car } from 'lucide-react';
import { formatCurrency } from '@/lib/content';
import type { NormalizedListingSummary } from '@/lib/guesty/normalizer';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    city: string;
    heroImage: string;
    basePrice: number;
    rating?: number;
    bedrooms: number;
    bathrooms: number;
    accommodates: number;
    propertyType: string;
    tags: string[];
  };
  index: number;
  prefetch: (id: string) => void;
}

export const PropertyCard = memo<PropertyCardProps>(({
  property,
  index,
  prefetch
}) => {
  // Premium motion values for micro-interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to subtle parallax effect
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);
  const scale = useTransform(mouseX, [-300, 300], [0.98, 1.02]);

  // Memoized animation variants for performance
  const cardVariants = useMemo(() => ({
    initial: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      filter: 'blur(8px)'
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    },
    hover: {
      y: -12,
      scale: 1.03,
      rotateX: 0,
      rotateY: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }), [index]);

  const imageVariants = useMemo(() => ({
    initial: { scale: 1.2, filter: 'brightness(0.8)' },
    animate: {
      scale: 1,
      filter: 'brightness(1)',
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    }
  }), []);

  // Premium build link function
  const buildDetailLink = useMemo(() =>
    (id: string) => `/stays/${id}`,
    []
  );

  // Handle mouse movement for 3D effect
  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Premium Card Container with Glass Effect */}
      <motion.div
        className="relative bg-gradient-to-br from-white via-gray-50/50 to-white
                   backdrop-blur-xl rounded-3xl overflow-hidden
                   shadow-lg shadow-gray-200/20 hover:shadow-2xl hover:shadow-primary/10
                   border border-gray-200/60 hover:border-primary/30
                   transition-all duration-700 ease-out"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Hero Image with Premium Effects */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            variants={imageVariants}
            src={property.heroImage}
            alt={`${property.title} - ${property.city}`}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out
                       group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />

          {/* Premium Gradient Overlay with Animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t
                       from-black/70 via-black/20 to-transparent
                       opacity-60 group-hover:opacity-40
                       transition-opacity duration-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          />

          {/* Premium Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-3">
            {/* Instant Book Badge */}
            {property.tags.includes('Instant Book') && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2
                           bg-gradient-to-r from-emerald-500 to-emerald-600
                           text-white rounded-2xl shadow-lg shadow-emerald-500/30
                           backdrop-blur-md border border-emerald-400/20"
                whileHover={{ scale: 1.05, x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <Zap size={16} className="text-emerald-100" />
                <span className="text-sm font-semibold">Instant Book</span>
              </motion.div>
            )}

            {/* Premium Badge */}
            {property.basePrice > 500 && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2
                           bg-gradient-to-r from-amber-400 to-amber-500
                           text-white rounded-2xl shadow-lg shadow-amber-500/30
                           backdrop-blur-md border border-amber-300/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Crown size={16} className="text-amber-100" />
                <span className="text-sm font-semibold">Premium</span>
              </motion.div>
            )}
          </div>

          {/* Rating Badge */}
          {property.rating && (
            <motion.div
              className="absolute top-4 right-4 flex items-center gap-2
                         px-3 py-2 bg-white/90 backdrop-blur-md
                         rounded-2xl shadow-lg border border-gray-200/50"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-gray-900">
                {property.rating.toFixed(1)}
              </span>
            </motion.div>
          )}

          {/* Favorite Button with Premium Animation */}
          <motion.button
            className="absolute bottom-4 right-4 w-12 h-12
                       bg-white/90 backdrop-blur-md rounded-2xl
                       flex items-center justify-center shadow-lg
                       hover:bg-red-50 border border-gray-200/50
                       transition-all duration-300"
            whileHover={{
              scale: 1.1,
              rotate: 10,
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite logic
            }}
            aria-label={`Add ${property.title} to favorites`}
          >
            <Heart size={20} className="text-gray-600 hover:text-red-500 transition-colors duration-200" />
          </motion.button>
        </div>

        {/* Premium Content Section */}
        <Link
          to={buildDetailLink(property.id)}
          onMouseEnter={() => prefetch(property.id)}
          className="block p-6 group/link"
        >
          {/* Location Header */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin size={18} className="text-primary group-hover/link:text-primary/80 transition-colors" />
            <span className="font-medium text-gray-700 group-hover/link:text-gray-900 transition-colors">
              {property.city}
            </span>
            <motion.div
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: 4 }}
            >
              <ArrowRight size={18} className="text-primary" />
            </motion.div>
          </div>

          {/* Premium Title */}
          <motion.h3
            className="font-serif text-xl font-bold text-gray-900 mb-4
                       group-hover/link:text-primary transition-colors duration-300
                       leading-tight line-clamp-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {property.title}
          </motion.h3>

          {/* Premium Property Features */}
          <div className="flex items-center gap-6 text-gray-600 mb-5">
            <motion.div
              className="flex items-center gap-2 group/feature"
              whileHover={{ scale: 1.05 }}
            >
              <BedDouble size={18} className="text-primary group-hover/feature:text-primary/80" />
              <span className="font-medium">{property.bedrooms}</span>
              <span className="text-sm">bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 group/feature"
              whileHover={{ scale: 1.05 }}
            >
              <Bath size={18} className="text-primary group-hover/feature:text-primary/80" />
              <span className="font-medium">{property.bathrooms}</span>
              <span className="text-sm">bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 group/feature"
              whileHover={{ scale: 1.05 }}
            >
              <Users size={18} className="text-primary group-hover/feature:text-primary/80" />
              <span className="font-medium">{property.accommodates}</span>
              <span className="text-sm">guest{property.accommodates !== 1 ? 's' : ''}</span>
            </motion.div>
          </div>

          {/* Premium Amenities Tags */}
          {property.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {property.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-2
                             bg-gradient-to-r from-gray-50 to-gray-100
                             hover:from-primary/10 hover:to-primary/5
                             rounded-xl text-xs font-semibold text-gray-700
                             hover:text-primary border border-gray-200/50
                             hover:border-primary/20 transition-all duration-300"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  transition={{ delay: tagIndex * 0.05 }}
                >
                  {tag === 'WiFi' && <Wifi size={14} className="text-primary" />}
                  {tag === 'Parking' && <Car size={14} className="text-primary" />}
                  {tag === 'Verified' && <Shield size={14} className="text-emerald-600" />}
                  {tag === 'Award Winner' && <Award size={14} className="text-amber-600" />}
                  {tag}
                </motion.span>
              ))}
              {property.tags.length > 3 && (
                <motion.span
                  className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-500"
                  whileHover={{ scale: 1.05 }}
                >
                  +{property.tags.length - 3} more
                </motion.span>
              )}
            </div>
          )}

          {/* Premium Price Section */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
            >
              {property.basePrice > 0 ? (
                <>
                  <motion.p
                    className="text-2xl font-bold text-gray-900 mb-1"
                    whileHover={{ color: '#0066cc' }}
                  >
                    {formatCurrency(property.basePrice)}
                  </motion.p>
                  <p className="text-sm text-gray-600 font-medium">per night</p>
                </>
              ) : (
                <p className="text-sm text-gray-600 font-medium">Contact for pricing</p>
              )}
            </motion.div>

            {/* Premium CTA Button */}
            <motion.div
              className="flex items-center gap-3 px-5 py-3
                         bg-gradient-to-r from-primary to-primary/90
                         text-white rounded-2xl font-semibold text-sm
                         hover:shadow-lg hover:shadow-primary/30
                         transition-all duration-300"
              whileHover={{
                scale: 1.05,
                x: 4,
                boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>View Details</span>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight size={16} />
              </motion.div>
            </motion.div>
          </div>
        </Link>

        {/* Premium Bottom Glow Effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1
                     bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0
                     scale-x-0 group-hover:scale-x-100 transition-transform duration-700
                     origin-center rounded-b-3xl"
          style={{ transformOrigin: 'center' }}
        />

        {/* Subtle 3D Shadow */}
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent
                     rounded-3xl opacity-0 group-hover:opacity-100
                     transition-opacity duration-500 -z-10"
          style={{ filter: 'blur(8px)' }}
        />
      </motion.div>
    </motion.div>
  );
});

PropertyCard.displayName = 'PropertyCard';
export default PropertyCard;
