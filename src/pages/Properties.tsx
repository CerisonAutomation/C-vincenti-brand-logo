import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import MaltaMap, { MALTA_LOCALITIES_COORDS, type MapLocation } from '@/components/MaltaMap';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ExternalLink, Map, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { useListings, usePrefetchListing } from '@/lib/guesty';
import { getSiteConfig } from '@/lib/site-config';
import { formatCurrency } from '@/lib/content';
import propertyFives from '@/assets/property-fives.jpg';
import propertyPenthouse from '@/assets/property-penthouse.jpg';
import propertyUrsula from '@/assets/property-ursula.jpg';

const config = getSiteConfig();

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
  type: p.type,
}));

const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Penthouse', 'House', 'Studio'];
const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under €100', min: 0, max: 100 },
  { label: '€100 – €200', min: 100, max: 200 },
  { label: '€200 – €350', min: 200, max: 350 },
  { label: '€350+', min: 350, max: Infinity },
];
const BED_OPTIONS = [{ label: 'Any', value: 0 }, { label: '1+', value: 1 }, { label: '2+', value: 2 }, { label: '3+', value: 3 }];
const GUEST_OPTIONS = [{ label: 'Any', value: 0 }, { label: '2+', value: 2 }, { label: '4+', value: 4 }, { label: '6+', value: 6 }];

export default function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [minBeds, setMinBeds] = useState(0);
  const [minGuests, setMinGuests] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  const { data: guestyListings } = useListings();
  const prefetch = usePrefetchListing();
  const hasGuesty = guestyListings && guestyListings.length > 0;

  const properties = useMemo(() => {
    if (hasGuesty) {
      return guestyListings!.map(l => ({
        id: l._id,
        title: l.title,
        location: l.address.city || l.address.neighborhood || l.address.full,
        beds: l.bedrooms,
        baths: l.bathrooms,
        guests: l.accommodates,
        rating: l.rating || 4.97,
        price: l.prices.basePrice,
        image: l.featuredPicture?.large || l.pictures?.[0]?.large || propertyFives,
        type: l.propertyType?.charAt(0) + l.propertyType?.slice(1).toLowerCase() || 'Apartment',
      }));
    }
    return STATIC_PROPERTIES;
  }, [hasGuesty, guestyListings]);

  const filtered = useMemo(() => {
    let result = properties;

    if (activeLocation) {
      result = result.filter(p => p.location.toLowerCase().includes(activeLocation.toLowerCase()));
    }
    if (typeFilter !== 'All') {
      result = result.filter(p => p.type.toLowerCase() === typeFilter.toLowerCase());
    }
    const range = PRICE_RANGES[priceRange];
    result = result.filter(p => p.price >= range.min && p.price < range.max);
    if (minBeds > 0) result = result.filter(p => p.beds >= minBeds);
    if (minGuests > 0) result = result.filter(p => p.guests >= minGuests);

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [properties, activeLocation, typeFilter, priceRange, minBeds, minGuests, sortBy]);

  const activeFilters = [typeFilter !== 'All', priceRange > 0, minBeds > 0, minGuests > 0].filter(Boolean).length;

  const MAP_LOCATIONS: MapLocation[] = MALTA_LOCALITIES_COORDS.map(loc => {
    const match = properties.find(p =>
      p.location.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]) ||
      loc.name.toLowerCase().includes(p.location.toLowerCase().split(' ')[0])
    );
    return { ...loc, price: match?.price, count: match ? 1 : undefined };
  });

  return (
    <Layout>
      <section className="py-8 border-b border-border/30">
        <div className="section-container">
          <BookingSearchBar variant="page" onSearch={(params) => setActiveLocation(params.location)} />
        </div>
      </section>

      <section className="py-10">
        <div className="section-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {activeLocation ? `Properties in ${activeLocation}` : 'All Properties'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} properties available</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeLocation && (
                <button onClick={() => setActiveLocation('')} className="text-xs text-primary hover:underline">
                  Clear location
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg transition-colors ${
                  showFilters || activeFilters > 0 ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal size={13} /> Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs border border-border rounded-lg px-3 py-2 bg-card text-foreground"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
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

          {/* Filters panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 satin-surface rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Filter Properties</h3>
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setTypeFilter('All'); setPriceRange(0); setMinBeds(0); setMinGuests(0); }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Property Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPERTY_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Price Range</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceRange(i)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          priceRange === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Bedrooms</label>
                  <div className="flex gap-1.5">
                    {BED_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setMinBeds(o.value)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          minBeds === o.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Guests</label>
                  <div className="flex gap-1.5">
                    {GUEST_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setMinGuests(o.value)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          minGuests === o.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Map view */}
          {viewMode === 'map' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <MaltaMap
                locations={MAP_LOCATIONS.filter(l => l.count || l.price)}
                onLocationClick={(loc) => {
                  setActiveLocation(loc.name === activeLocation ? '' : loc.name.split(' ')[0]);
                  setViewMode('grid');
                }}
                className="h-[400px]"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">Click a pin to filter properties by area</p>
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <Link
                to={`/properties/${property.id}`}
                key={property.id}
                onMouseEnter={() => prefetch(property.id)}
              >
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.image}
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

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin size={12} className="text-primary" /> {property.location}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><BedDouble size={13} /> {property.beds}</span>
                      <span className="flex items-center gap-1"><Bath size={13} /> {property.baths}</span>
                      <span className="flex items-center gap-1"><Users size={13} /> {property.guests}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <p className="text-foreground font-semibold">
                        {formatCurrency(property.price)}<span className="text-xs font-normal text-muted-foreground"> / night</span>
                      </p>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        View <ExternalLink size={11} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No properties match your filters</p>
              <button
                onClick={() => { setActiveLocation(''); setTypeFilter('All'); setPriceRange(0); setMinBeds(0); setMinGuests(0); }}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Owner CTA */}
          <div className="mt-16 satin-surface rounded-2xl p-8 text-center satin-glow">
            <p className="micro-type text-primary mb-3">Own a property in Malta?</p>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">List your property with us</h2>
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
