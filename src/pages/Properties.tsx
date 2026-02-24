import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ArrowRight, SlidersHorizontal, X, LayoutGrid } from 'lucide-react';
import { useListings, usePrefetchListing } from '@/lib/guesty';
import { normalizeListingSummary, type NormalizedListingSummary } from '@/lib/guesty/normalizer';
import { formatCurrency } from '@/lib/content';
import { Skeleton } from '@/components/ui/skeleton';

const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Penthouse', 'House', 'Studio', 'Condominium'];
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
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '';

  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [minBeds, setMinBeds] = useState(0);
  const [minGuests, setMinGuests] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  const { data: guestyListings, isLoading } = useListings();
  const prefetch = usePrefetchListing();

  const properties: NormalizedListingSummary[] = useMemo(() => {
    if (!guestyListings || guestyListings.length === 0) return [];
    return guestyListings.map(l => normalizeListingSummary(l));
  }, [guestyListings]);

  const filtered = useMemo(() => {
    let result = properties;
    if (activeLocation) {
      result = result.filter(p => p.city.toLowerCase().includes(activeLocation.toLowerCase()) || p.title.toLowerCase().includes(activeLocation.toLowerCase()));
    }
    if (typeFilter !== 'All') {
      result = result.filter(p => p.propertyType.toLowerCase().includes(typeFilter.toLowerCase()));
    }
    const range = PRICE_RANGES[priceRange];
    result = result.filter(p => p.basePrice >= range.min && p.basePrice < range.max);
    if (minBeds > 0) result = result.filter(p => p.bedrooms >= minBeds);
    if (minGuests > 0) result = result.filter(p => p.accommodates >= minGuests);

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [properties, activeLocation, typeFilter, priceRange, minBeds, minGuests, sortBy]);

  const activeFilters = [typeFilter !== 'All', priceRange > 0, minBeds > 0, minGuests > 0].filter(Boolean).length;

  // Build query string for deep-linking into property detail
  const buildDetailLink = (id: string) => {
    const sp = new URLSearchParams();
    if (checkIn) sp.set('checkIn', checkIn);
    if (checkOut) sp.set('checkOut', checkOut);
    if (guestsParam) sp.set('guests', guestsParam);
    const qs = sp.toString();
    return `/properties/${id}${qs ? '?' + qs : ''}`;
  };

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
                {activeLocation ? `Properties in ${activeLocation}` : 'Our Collection'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? 'Loading properties...' : `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} available`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeLocation && (
                <button onClick={() => setActiveLocation('')} className="text-xs text-primary hover:underline">Clear location</button>
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
                      <button key={t} onClick={() => setTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Price Range</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map((r, i) => (
                      <button key={i} onClick={() => setPriceRange(i)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          priceRange === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >{r.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Bedrooms</label>
                  <div className="flex gap-1.5">
                    {BED_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setMinBeds(o.value)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          minBeds === o.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Guests</label>
                  <div className="flex gap-1.5">
                    {GUEST_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setMinGuests(o.value)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          minGuests === o.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                  <Skeleton className="aspect-[4/3]" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((property, i) => (
                <Link
                  to={buildDetailLink(property.id)}
                  key={property.id}
                  onMouseEnter={() => prefetch(property.id)}
                >
                  <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
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
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && properties.length > 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-3">No properties match your filters</p>
              <button
                onClick={() => { setActiveLocation(''); setTypeFilter('All'); setPriceRange(0); setMinBeds(0); setMinGuests(0); }}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!isLoading && properties.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-foreground mb-2">Properties coming soon</p>
              <p className="text-sm text-muted-foreground">Our collection is being curated. Please check back shortly.</p>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Free Estimate <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
