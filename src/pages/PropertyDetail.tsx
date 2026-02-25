import { useState, useMemo, lazy, Suspense, memo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight,
  Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake,
  Check, Calendar, Quote as QuoteIcon, Shield, X, ArrowRight,
  Clock, Baby, PawPrint, CigaretteOff, Info, Grid3X3, ChevronDown,
  ExternalLink, MessageSquare
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useListing, useListingCalendar, useReviews } from '@/lib/guesty';
import { normalizeListingDetail, type NormalizedListingDetail } from '@/lib/guesty/normalizer';
import { BRAND_FULL } from '@/lib/brand';
import { formatCurrency } from '@/lib/content';
import { Skeleton } from '@/components/ui/skeleton';

// ── Amenity config ──
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WIRELESS_INTERNET: <Wifi size={16} />, INTERNET: <Wifi size={16} />,
  FREE_PARKING_ON_PREMISES: <Car size={16} />, HOT_TUB: <Waves size={16} />,
  AIR_CONDITIONING: <Snowflake size={16} />, HEATING: <Flame size={16} />,
  COFFEE_MAKER: <Coffee size={16} />, TV: <Tv size={16} />, CABLE_TV: <Tv size={16} />,
  KITCHEN: <Utensils size={16} />, WASHER: <Shirt size={16} />, DRYER: <Wind size={16} />,
};

const AMENITY_CATEGORIES: Record<string, string[]> = {
  'Essentials': ['WIRELESS_INTERNET', 'INTERNET', 'AIR_CONDITIONING', 'HEATING', 'HOT_WATER', 'ESSENTIALS', 'BED_LINENS', 'EXTRA_PILLOWS_AND_BLANKETS'],
  'Kitchen & Dining': ['KITCHEN', 'COOKING_BASICS', 'DISHES_AND_SILVERWARE', 'OVEN', 'STOVE', 'MICROWAVE', 'REFRIGERATOR', 'DISHWASHER', 'COFFEE_MAKER'],
  'Bathroom': ['HAIR_DRYER', 'SHAMPOO', 'BATHTUB'],
  'Entertainment': ['TV', 'CABLE_TV', 'GAME_CONSOLE'],
  'Outdoor': ['PATIO_OR_BALCONY', 'GARDEN_OR_BACKYARD', 'BBQ_GRILL', 'HOT_TUB'],
  'Facilities': ['FREE_PARKING_ON_PREMISES', 'ELEVATOR_IN_BUILDING', 'GYM', 'PRIVATE_ENTRANCE', 'DOORMAN', 'EV_CHARGER'],
  'Laundry': ['WASHER', 'DRYER', 'IRON', 'HANGERS'],
  'Safety': ['SMOKE_DETECTOR', 'CARBON_MONOXIDE_DETECTOR', 'FIRE_EXTINGUISHER', 'FIRST_AID_KIT'],
  'Family': ['SUITABLE_FOR_CHILDREN', 'SUITABLE_FOR_INFANTS', 'HIGH_CHAIR', 'BABY_BATH', 'BABY_MONITOR', 'PACK_N_PLAY_TRAVEL_CRIB', 'CHILDREN_BOOKS_AND_TOYS'],
  'Work': ['LAPTOP_FRIENDLY_WORKSPACE'],
};

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const urlCheckIn = searchParams.get('checkIn') || '';
  const urlCheckOut = searchParams.get('checkOut') || '';
  const urlGuests = parseInt(searchParams.get('guests') || '2') || 2;

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(urlCheckIn);
  const [checkOut, setCheckOut] = useState(urlCheckOut);
  const [guests, setGuests] = useState(urlGuests);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const { data: rawListing, isLoading, error } = useListing(id);
  const today = new Date().toISOString().split('T')[0];

  // Calendar - 3 months ahead
  const calFrom = today;
  const calTo = useMemo(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; }, []);
  const listingId = rawListing?._id || id;
  const { data: calendarDays } = useListingCalendar(listingId, calFrom, calTo);

  // Reviews
  const { data: reviews } = useReviews({ listingId: listingId, limit: 20 });

  // Normalize listing
  const property: NormalizedListingDetail | null = useMemo(() => {
    if (!rawListing) return null;
    return normalizeListingDetail(rawListing);
  }, [rawListing]);

  // Grouped amenities
  const groupedAmenities = useMemo(() => {
    if (!property) return {};
    const groups: Record<string, string[]> = {};
    const assigned = new Set<string>();
    Object.entries(AMENITY_CATEGORIES).forEach(([cat, codes]) => {
      const matching = codes.filter(c => property.amenities.includes(c));
      if (matching.length > 0) {
        groups[cat] = matching;
        matching.forEach(c => assigned.add(c));
      }
    });
    const ungrouped = property.amenities.filter(a => !assigned.has(a));
    if (ungrouped.length > 0) groups['Other'] = ungrouped;
    return groups;
  }, [property]);

  // ── Error / Not found ──
  if (!property) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">This property doesn't exist or is no longer available.</p>
          <Link to="/properties" className="text-primary hover:underline text-sm">← Back to Properties</Link>
        </div>
      </Layout>
    );
  }

  const images = property.images.length > 0 ? property.images : [{ id: 'fallback', thumbnail: '/placeholder.svg', regular: '/placeholder.svg', large: '/placeholder.svg', original: '/placeholder.svg' }];
  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const totalAmenities = property.amenities.length;

  // Calendar
  const availabilityMap = new Map<string, { status: string; price: number; minNights: number }>();
  calendarDays?.forEach(day => {
    availabilityMap.set(day.date, { status: day.status, price: day.price, minNights: day.minNights });
  });

  return (
    <Layout>
      <div className="section-container py-8">
        <Link
          to={`/properties${searchParams.toString() ? '?' + searchParams.toString() : ''}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to Properties
        </Link>

        {/* ══════════════════════════════════════════════
            GALLERY — Mosaic layout
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8">
          <div
            className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto cursor-pointer group"
            onClick={() => { setCurrentImageIdx(0); setLightboxOpen(true); }}
          >
            <img
              src={images[0]?.large || images[0]?.original}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {property.propertyType.replace(/_/g, ' ')}
              </span>
              {property.rating != null && (
                <span className="flex items-center gap-1 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-foreground font-semibold">
                  <Star size={12} className="text-primary fill-primary" /> {property.rating.toFixed(1)}
                  {property.reviewsCount != null && <span className="text-muted-foreground font-normal">({property.reviewsCount})</span>}
                </span>
              )}
            </div>
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div
              key={img.id}
              className="hidden md:block relative aspect-[4/3] overflow-hidden cursor-pointer group"
              onClick={() => { setCurrentImageIdx(i + 1); setLightboxOpen(true); }}
            >
              <img
                src={img.regular || img.large}
                alt={`${property.title} ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
          {images.length > 5 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="hidden md:flex absolute bottom-4 right-4 items-center gap-1.5 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground hover:bg-background transition-colors shadow-lg"
            >
              <Grid3X3 size={14} /> Show all {images.length} photos
            </button>
          )}
        </div>

        {/* Mobile thumb strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden scrollbar-none">
            {images.slice(0, 12).map((img, i) => (
              <button
                key={img.id}
                onClick={() => { setCurrentImageIdx(i); setLightboxOpen(true); }}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImageIdx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            LIGHTBOX
        ══════════════════════════════════════════════ */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <img
                src={images[currentImageIdx]?.original || images[currentImageIdx]?.large}
                alt=""
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors z-10"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/90 backdrop-blur-sm border border-border rounded-full text-sm text-foreground font-medium">
                {currentImageIdx + 1} / {images.length}
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════
            CONTENT GRID
        ══════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Hero facts */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin size={14} className="text-primary" />
                {[property.address.city, property.address.country].filter(Boolean).join(', ') || 'Malta'}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4 leading-tight">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users size={15} className="text-primary/70" /> {property.accommodates} guest{property.accommodates !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><BedDouble size={15} className="text-primary/70" /> {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Bath size={15} className="text-primary/70" /> {property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                {property.beds > 0 && <span className="flex items-center gap-1.5">🛏️ {property.beds} bed{property.beds !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            {/* Highlights / Tags */}
            {property.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {property.highlights.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-border/30" />

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">About this property</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Space */}
            {property.space && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">The space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.space}</p>
              </div>
            )}

            {/* Sleeping arrangements */}
            {property.bedrooms_detail.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Sleeping arrangements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.bedrooms_detail.map((room, i) => (
                    <div key={i} className="satin-surface rounded-xl p-4 satin-glow">
                      <p className="text-xs font-semibold text-foreground mb-2">{room.name}</p>
                      {room.beds.map((bed, j) => (
                        <p key={j} className="text-xs text-muted-foreground">{bed.count}× {bed.type}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Amenities (grouped) ── */}
            {totalAmenities > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Amenities <span className="text-sm font-normal text-muted-foreground">({totalAmenities})</span>
                </h2>
                <div className="space-y-5">
                  {Object.entries(groupedAmenities)
                    .slice(0, showAllAmenities ? undefined : 3)
                    .map(([category, codes]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">{category}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {codes.map(amenity => (
                            <div key={amenity} className="flex items-center gap-2.5 text-sm text-foreground/80">
                              <span className="text-primary/70">{AMENITY_ICONS[amenity] || <Check size={14} />}</span>
                              {amenity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bAnd\b/g, '&')}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
                {Object.keys(groupedAmenities).length > 3 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${totalAmenities} amenities`}
                    <ChevronDown size={14} className={`transition-transform ${showAllAmenities ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}

            {/* ── Availability Calendar ── */}
            {calendarDays && calendarDays.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Availability
                </h2>
                <div className="satin-surface rounded-xl p-5">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
                    ))}
                    {(() => {
                      const days = calendarDays.slice(0, 42);
                      const firstDay = new Date(days[0].date);
                      const offset = (firstDay.getDay() + 6) % 7;
                      const cells: React.ReactNode[] = [];
                      for (let i = 0; i < offset; i++) cells.push(<div key={`e-${i}`} />);
                      days.forEach(day => {
                        const isAvailable = day.status === 'available';
                        const isSelected = day.date === checkIn || day.date === checkOut;
                        const isInRange = checkIn && checkOut && day.date > checkIn && day.date < checkOut;
                        cells.push(
                          <button
                            key={day.date}
                            onClick={() => {
                              if (!isAvailable) return;
                              if (!checkIn || (checkIn && checkOut)) {
                                setCheckIn(day.date);
                                setCheckOut('');
                              } else if (day.date > checkIn) {
                                setCheckOut(day.date);
                              } else {
                                setCheckIn(day.date);
                                setCheckOut('');
                              }
                            }}
                            disabled={!isAvailable}
                            className={`py-1.5 rounded text-xs transition-colors ${
                              isSelected ? 'bg-primary text-primary-foreground font-semibold' :
                              isInRange ? 'bg-primary/10 text-primary' :
                              isAvailable ? 'text-foreground hover:bg-accent cursor-pointer' :
                              'text-muted-foreground/30 line-through cursor-not-allowed'
                            }`}
                            title={isAvailable ? `€${day.price}/night · min ${day.minNights} nights` : 'Unavailable'}
                          >
                            {new Date(day.date).getDate()}
                          </button>
                        );
                      });
                      return cells;
                    })()}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Selected</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/10" /> Range</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted" /> Unavailable</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Policies ── */}
            {(property.policies.houseRules || property.policies.checkInTime || property.policies.cancellation) && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Policies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.policies.checkInTime && (
                    <div className="satin-surface rounded-xl p-4 flex items-start gap-3">
                      <Clock size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Check-in / Check-out</p>
                        <p className="text-xs text-muted-foreground">Check-in: {property.policies.checkInTime}</p>
                        {property.policies.checkOutTime && (
                          <p className="text-xs text-muted-foreground">Check-out: {property.policies.checkOutTime}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {property.policies.allowsChildren != null && (
                    <div className="satin-surface rounded-xl p-4 flex items-start gap-3">
                      <Baby size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Children</p>
                        <p className="text-xs text-muted-foreground">{property.policies.allowsChildren ? 'Children welcome' : 'Not suitable for children'}</p>
                      </div>
                    </div>
                  )}
                  {property.policies.allowsPets != null && (
                    <div className="satin-surface rounded-xl p-4 flex items-start gap-3">
                      <PawPrint size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Pets</p>
                        <p className="text-xs text-muted-foreground">{property.policies.allowsPets ? 'Pets allowed' : 'No pets'}</p>
                      </div>
                    </div>
                  )}
                  {property.policies.allowsSmoking != null && (
                    <div className="satin-surface rounded-xl p-4 flex items-start gap-3">
                      <CigaretteOff size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Smoking</p>
                        <p className="text-xs text-muted-foreground">{property.policies.allowsSmoking ? 'Smoking allowed' : 'No smoking'}</p>
                      </div>
                    </div>
                  )}
                </div>
                {property.policies.houseRules && (
                  <div className="mt-4 satin-surface rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Shield size={14} className="text-primary" /> House Rules</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{property.policies.houseRules}</p>
                  </div>
                )}
                {property.policies.cancellation && (
                  <div className="mt-3 satin-surface rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Cancellation Policy</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{property.policies.cancellation}</p>
                  </div>
                )}
                {property.policies.checkInInstructions && (
                  <div className="mt-3 satin-surface rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Access & Check-in Instructions</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{property.policies.checkInInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Neighbourhood */}
            {property.neighborhood && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">The neighbourhood</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.neighborhood}</p>
              </div>
            )}

            {/* Transit */}
            {property.transit && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Getting around</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.transit}</p>
              </div>
            )}

            {/* ── Reviews ── */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <QuoteIcon size={18} className="text-primary" /> Guest Reviews
                  <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="satin-surface rounded-xl p-5 satin-glow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {review.guestName?.[0]?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{review.guestName || 'Guest'}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.round(review.rating) ? 'text-primary fill-primary' : 'text-border'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.publicReview}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Map ── */}
            {property.address.lat != null && property.address.lng != null && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Location
                </h2>
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <iframe
                    title="Property location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.address.lat},${property.address.lng}&zoom=15`}
                    width="100%" height="320"
                    style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                {property.address.full && (
                  <p className="text-xs text-muted-foreground mt-2">{property.address.full}</p>
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              BOOKING SIDEBAR (sticky)
          ══════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="satin-surface rounded-2xl p-6 space-y-5 satin-glow">
                {/* Price */}
                <div className="flex items-baseline justify-between">
                  {property.pricing.basePrice > 0 ? (
                    <p className="font-serif text-2xl font-semibold text-foreground">
                      {formatCurrency(property.pricing.basePrice)}
                      <span className="text-sm font-normal text-muted-foreground"> / night</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">View rates at checkout</p>
                  )}
                  {property.rating != null && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star size={13} className="text-primary fill-primary" /> {property.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Date & guest inputs */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Check-in</label>
                      <input
                        type="date" value={checkIn} min={today}
                        onChange={e => {
                          setCheckIn(e.target.value);
                          if (!checkOut || e.target.value >= checkOut) {
                            const d = new Date(e.target.value); d.setDate(d.getDate() + 3);
                            setCheckOut(d.toISOString().split('T')[0]);
                          }
                        }}
                        className="form-input text-xs [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Check-out</label>
                      <input
                        type="date" value={checkOut} min={checkIn || today}
                        onChange={e => setCheckOut(e.target.value)}
                        className="form-input text-xs [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Guests</label>
                    <select
                      value={guests}
                      onChange={e => setGuests(Number(e.target.value))}
                      className="form-input text-xs"
                    >
                      {Array.from({ length: Math.max(property.accommodates, 1) }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price estimate */}
                {checkIn && checkOut && nights > 0 && property.pricing.basePrice > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t border-border/30">
                    <div className="flex justify-between">
                      <span>{formatCurrency(property.pricing.basePrice)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span>{formatCurrency(property.pricing.basePrice * nights)}</span>
                    </div>
                    {property.pricing.cleaningFee != null && (
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span>{formatCurrency(property.pricing.cleaningFee)}</span>
                      </div>
                    )}
                    {property.taxes.length > 0 && (
                      <div className="flex justify-between text-muted-foreground/70">
                        <span>Taxes & fees</span>
                        <span className="text-[10px]">calculated at checkout</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/30">
                      <span>Estimated total</span>
                      <span className="text-primary">
                        {formatCurrency(property.pricing.basePrice * nights + (property.pricing.cleaningFee || 0))}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA — In-app checkout */}
                <Link
                  to={checkIn && checkOut ? `/properties/${property.id}/checkout?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : '#'}
                  onClick={(e) => {
                    if (!checkIn || !checkOut) { e.preventDefault(); }
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-lg transition-all ${
                    checkIn && checkOut
                      ? 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
                      : 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed'
                  }`}
                >
                  {checkIn && checkOut ? (
                    <>Proceed to secure checkout <ArrowRight size={16} /></>
                  ) : (
                    'Select dates to book'
                  )}
                </Link>

                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Shield size={10} /> Secure booking · No charge until confirmed
                </p>
              </div>

              {/* Enquiry fallback */}
              <div className="satin-surface rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Have questions about this property?</p>
                <a
                  href={`mailto:info@christianopm.com?subject=Enquiry: ${property.title}&body=Hi,%0A%0AI'm interested in ${property.title}.%0A%0ACheck-in: ${checkIn || 'Flexible'}%0ACheck-out: ${checkOut || 'Flexible'}%0AGuests: ${guests}%0A%0APlease send me more information.`}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                >
                  <MessageSquare size={13} /> Send enquiry
                </a>
              </div>

              {/* Trust strip */}
              <div className="text-center text-[10px] text-muted-foreground/60 space-y-1">
                <p>Managed by {BRAND_FULL}</p>
                <p>MTA Licensed Operator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── All Photos Modal ── */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-foreground">{property.title} — All Photos</h3>
              <button onClick={() => setShowAllPhotos(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="section-container-wide py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => { setCurrentImageIdx(i); setShowAllPhotos(false); setLightboxOpen(true); }}
                >
                  <img src={img.regular || img.large} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default memo(PropertyDetail);
