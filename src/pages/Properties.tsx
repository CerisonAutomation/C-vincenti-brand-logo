import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import MaltaMap, { MALTA_LOCALITIES_COORDS, type MapLocation } from '@/components/MaltaMap';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ExternalLink, Map, LayoutGrid } from 'lucide-react';
import { useListings } from '@/lib/guesty';
import { getSiteConfig } from '@/lib/site-config';
import propertyFives from '@/assets/property-fives.jpg';
import propertyPenthouse from '@/assets/property-penthouse.jpg';
import propertyUrsula from '@/assets/property-ursula.jpg';

const config = getSiteConfig();

// Static fallback properties using site config
const STATIC_PROPERTIES = config.properties.map((p, i) => ({
  id: p.id,
  title: p.title,
  location: p.location,
  beds: p.beds,
  baths: p.baths,
  guests: p.guests,
  rating: 4.97,
  price: parseInt(p.pricePerNight.replace(/[^0-9]/g, '')) || 150,
  image: [propertyFives, propertyUrsula, propertyPenthouse][i % 3],
  bookingUrl: p.bookingUrl,
  type: p.type,
}));

// Only show real properties from site config — no fake extras
const ALL_PROPERTIES = STATIC_PROPERTIES;

// Map locations with prices from static properties
const MAP_LOCATIONS: MapLocation[] = MALTA_LOCALITIES_COORDS.map(loc => {
  const match = ALL_PROPERTIES.find(p =>
    p.location.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]) ||
    loc.name.toLowerCase().includes(p.location.toLowerCase().split(' ')[0])
  );
  return { ...loc, price: match?.price, count: match ? 1 : undefined };
});

export default function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Try Guesty live data; fall back to static
  const { data: guestyListings, isError } = useListings();
  const hasGuesty = !!import.meta.env.VITE_GUESTY_CLIENT_ID && guestyListings && guestyListings.length > 0;

  const properties = hasGuesty
    ? guestyListings!.map(l => ({
        id: l._id,
        title: l.title,
        location: l.address.city || l.address.neighborhood || l.address.full,
        beds: l.bedrooms,
        baths: l.bathrooms,
        guests: l.accommodates,
        rating: l.rating || 4.97,
        price: l.prices.basePrice,
        image: l.featuredPicture?.large || l.pictures?.[0]?.large || propertyFives,
        bookingUrl: `https://malta.guestybookings.com/en/properties/${l._id}`,
        type: l.propertyType,
      }))
    : ALL_PROPERTIES;

  const filtered = activeLocation
    ? properties.filter((p) => p.location.toLowerCase().includes(activeLocation.toLowerCase()))
    : properties;

  const handleMapClick = (loc: MapLocation) => {
    setActiveLocation(loc.name === activeLocation ? '' : loc.name.split(' ')[0]);
    setViewMode('grid');
  };

  return (
    <Layout>
      {/* Search bar */}
      <section className="py-8 border-b border-border/30">
        <div className="section-container">
          <BookingSearchBar
            variant="page"
            onSearch={(params) => setActiveLocation(params.location)}
          />
        </div>
      </section>

      <section className="py-10">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {activeLocation ? `Properties in ${activeLocation}` : 'All Properties'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} properties available</p>
            </div>
            <div className="flex items-center gap-2">
              {activeLocation && (
                <button
                  onClick={() => setActiveLocation('')}
                  className="text-xs text-primary hover:underline mr-2"
                >
                  Clear filter
                </button>
              )}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid size={13} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Map size={13} /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Map view */}
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <MaltaMap
                locations={MAP_LOCATIONS.filter(l => l.count || l.price)}
                onLocationClick={handleMapClick}
                className="h-[400px]"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click a pin to filter properties by area
              </p>
            </motion.div>
          )}

          {/* Grid view */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <Link to={`/properties/${property.id}`} key={property.id}>
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={typeof property.image === 'string' ? property.image : property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star size={12} className="text-primary fill-primary" />
                    <span className="text-xs font-semibold text-foreground">{property.rating}</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-background/70 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {property.type}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin size={12} className="text-primary" />
                    {property.location}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BedDouble size={13} /> {property.beds} bed{property.beds > 1 && 's'}</span>
                    <span className="flex items-center gap-1"><Bath size={13} /> {property.baths} bath{property.baths > 1 && 's'}</span>
                    <span className="flex items-center gap-1"><Users size={13} /> {property.guests} guests</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <p className="text-foreground font-semibold">
                      €{property.price}<span className="text-xs font-normal text-muted-foreground"> / night</span>
                    </p>
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </motion.article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No properties found for "{activeLocation}"</p>
              <button onClick={() => setActiveLocation('')} className="mt-3 text-sm text-primary hover:underline">
                Show all properties
              </button>
            </div>
          )}

          {/* Owner CTA */}
          <div className="mt-16 satin-surface rounded-2xl p-8 text-center satin-glow">
            <p className="micro-type text-primary mb-3">Own a property in Malta?</p>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              List your property with us
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Join our curated portfolio and maximise your rental income with full-service management.
            </p>
            <Link
              to="/owners/estimate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Free Estimate
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
