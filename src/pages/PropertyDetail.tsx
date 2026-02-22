import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, Calendar, Quote as QuoteIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import BookingFlow from '@/components/BookingFlow';
import { useListing, useListingCalendar, useReviews } from '@/lib/guesty';
import { getSiteConfig } from '@/lib/site-config';
import { formatCurrency } from '@/lib/content';
import propertyFives from '@/assets/property-fives.jpg';
import propertyUrsula from '@/assets/property-ursula.jpg';
import propertyPenthouse from '@/assets/property-penthouse.jpg';

const config = getSiteConfig();

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WIRELESS_INTERNET: <Wifi size={16} />, INTERNET: <Wifi size={16} />,
  FREE_PARKING_ON_PREMISES: <Car size={16} />, HOT_TUB: <Waves size={16} />,
  AIR_CONDITIONING: <Snowflake size={16} />, HEATING: <Flame size={16} />,
  COFFEE_MAKER: <Coffee size={16} />, TV: <Tv size={16} />, CABLE_TV: <Tv size={16} />,
  KITCHEN: <Utensils size={16} />, WASHER: <Shirt size={16} />, DRYER: <Wind size={16} />,
};

const AMENITY_LABELS: Record<string, string> = {
  WIRELESS_INTERNET: 'Wi-Fi', INTERNET: 'Internet', FREE_PARKING_ON_PREMISES: 'Free Parking',
  HOT_TUB: 'Hot Tub', AIR_CONDITIONING: 'Air Conditioning', HEATING: 'Heating',
  COFFEE_MAKER: 'Coffee Maker', TV: 'TV', CABLE_TV: 'Cable TV', KITCHEN: 'Kitchen',
  WASHER: 'Washer', DRYER: 'Dryer', HAIR_DRYER: 'Hair Dryer', IRON: 'Iron',
  ESSENTIALS: 'Essentials', SHAMPOO: 'Shampoo', HANGERS: 'Hangers', BED_LINENS: 'Bed Linens',
  EXTRA_PILLOWS_AND_BLANKETS: 'Extra Pillows', FIRE_EXTINGUISHER: 'Fire Extinguisher',
  FIRST_AID_KIT: 'First Aid Kit', SMOKE_DETECTOR: 'Smoke Detector',
  CARBON_MONOXIDE_DETECTOR: 'CO Detector', ELEVATOR_IN_BUILDING: 'Elevator',
  PATIO_OR_BALCONY: 'Balcony/Patio', DISHWASHER: 'Dishwasher', REFRIGERATOR: 'Refrigerator',
  OVEN: 'Oven', STOVE: 'Stove', MICROWAVE: 'Microwave', COOKING_BASICS: 'Cooking Basics',
  DISHES_AND_SILVERWARE: 'Dishes & Silverware', BBQ_GRILL: 'BBQ Grill',
  GARDEN_OR_BACKYARD: 'Garden', LAPTOP_FRIENDLY_WORKSPACE: 'Workspace', GYM: 'Gym',
  PRIVATE_ENTRANCE: 'Private Entrance', HOT_WATER: 'Hot Water',
  LONG_TERM_STAYS_ALLOWED: 'Long-term OK', SUITABLE_FOR_CHILDREN: 'Child Friendly',
  PETS_ALLOWED: 'Pets Allowed',
};

const STATIC_IMAGES: Record<string, string> = { fives: propertyFives, ursula: propertyUrsula, penthouse: propertyPenthouse };

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showBooking, setShowBooking] = useState(false);

  const { data: listing, isLoading } = useListing(id);
  const staticProp = config.properties.find(p => p.id === id);
  const today = new Date().toISOString().split('T')[0];

  // Calendar - 3 months ahead
  const calFrom = today;
  const calTo = (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; })();
  const { data: calendarDays } = useListingCalendar(listing?._id || id, calFrom, calTo);

  // Reviews
  const { data: reviews } = useReviews({ listingId: listing?._id || id, limit: 10 });

  const property = useMemo(() => {
    if (listing) {
      return {
        title: listing.title, location: listing.address?.city || listing.address?.full || 'Malta',
        beds: listing.bedrooms, baths: listing.bathrooms, guests: listing.accommodates,
        rating: listing.rating || 4.97, price: listing.prices?.basePrice || 0,
        currency: listing.prices?.currency || 'EUR',
        images: listing.pictures?.map(p => p.large || p.original) || [],
        amenities: listing.amenities || [],
        description: listing.publicDescription?.summary || '',
        space: listing.publicDescription?.space || '',
        neighborhood: listing.publicDescription?.neighborhood || '',
        transit: listing.publicDescription?.transit || '',
        houseRules: listing.publicDescription?.houseRules || '',
        checkInTime: listing.defaultCheckInTime || '15:00',
        checkOutTime: listing.defaultCheckOutTime || '11:00',
        propertyType: listing.propertyType || 'APARTMENT',
        cleaningFee: listing.prices?.cleaningFee,
        bedArrangements: listing.bedArrangements,
        lat: listing.address?.lat, lng: listing.address?.lng,
      };
    }
    if (staticProp) {
      return {
        title: staticProp.title, location: staticProp.location,
        beds: staticProp.beds, baths: staticProp.baths, guests: staticProp.guests,
        rating: 4.97, price: parseInt(staticProp.pricePerNight.replace(/[^0-9]/g, '')) || 0,
        currency: 'EUR', images: [STATIC_IMAGES[staticProp.id] || propertyFives],
        amenities: ['WIRELESS_INTERNET', 'AIR_CONDITIONING', 'KITCHEN', 'WASHER', 'TV', 'ESSENTIALS', 'BED_LINENS', 'HOT_WATER'] as string[],
        description: `Beautiful ${staticProp.type.toLowerCase()} in ${staticProp.location}. Professionally managed by Christiano Vincenti Property Management.`,
        space: '', neighborhood: '', transit: '', houseRules: '',
        checkInTime: '15:00', checkOutTime: '11:00',
        propertyType: staticProp.type.toUpperCase(), cleaningFee: undefined,
        bedArrangements: undefined, lat: undefined, lng: undefined,
      };
    }
    return null;
  }, [listing, staticProp]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm">Loading property...</p>
        </div>
      </Layout>
    );
  }

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

  const images = property.images.length > 0 ? property.images : [propertyFives];
  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Build calendar availability map
  const availabilityMap = new Map<string, { status: string; price: number; minNights: number }>();
  calendarDays?.forEach(day => {
    availabilityMap.set(day.date, { status: day.status, price: day.price, minNights: day.minNights });
  });

  return (
    <Layout>
      <div className="section-container py-8">
        <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Properties
        </Link>

        {/* Image gallery - mosaic layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8">
          <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto">
            <motion.img
              key={currentImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[0]}
              alt={property.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setCurrentImageIdx(0)}
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-background/70 backdrop-blur-sm rounded text-[10px] text-muted-foreground uppercase tracking-wider">
                {property.propertyType}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-background/70 backdrop-blur-sm rounded text-xs text-foreground">
                <Star size={12} className="text-primary fill-primary" /> {property.rating}
              </span>
            </div>
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="hidden md:block relative aspect-[4/3] overflow-hidden">
              <img
                src={img}
                alt={`${property.title} ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setCurrentImageIdx(i + 1)}
                loading="lazy"
              />
            </div>
          ))}
          {images.length > 5 && (
            <button
              onClick={() => setCurrentImageIdx(5)}
              className="hidden md:flex absolute bottom-3 right-3 items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-foreground hover:bg-background transition-colors"
            >
              +{images.length - 5} photos
            </button>
          )}
        </div>

        {/* Mobile image slider */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden">
            {images.slice(0, 10).map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIdx(i)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImageIdx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Fullscreen image viewer */}
        <AnimatePresence>
          {currentImageIdx > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
              onClick={() => setCurrentImageIdx(0)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => (i - 1 + images.length) % images.length || images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <img src={images[currentImageIdx]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" />
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors z-10"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground">
                {currentImageIdx + 1} / {images.length}
              </div>
              <button
                onClick={() => setCurrentImageIdx(0)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin size={14} className="text-primary" /> {property.location}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BedDouble size={15} /> {property.beds} bedroom{property.beds !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Bath size={15} /> {property.baths} bathroom{property.baths !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Users size={15} /> Up to {property.guests} guests</span>
              </div>
            </div>

            {property.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">About this property</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {property.space && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">The space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.space}</p>
              </div>
            )}

            {/* Bed arrangements */}
            {property.bedArrangements?.details && property.bedArrangements.details.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Sleeping arrangements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.bedArrangements.details.map((room, i) => (
                    <div key={i} className="satin-surface rounded-lg p-4">
                      <p className="text-xs font-semibold text-foreground mb-1">{room.roomName}</p>
                      {room.beds.map((bed, j) => (
                        <p key={j} className="text-xs text-muted-foreground">
                          {bed.count}× {bed.type.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities
                    .filter(a => AMENITY_LABELS[a])
                    .slice(0, 18)
                    .map(amenity => (
                      <div key={amenity} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="text-primary">{AMENITY_ICONS[amenity] || <Check size={14} />}</span>
                        {AMENITY_LABELS[amenity]}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            {calendarDays && calendarDays.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Availability
                </h2>
                <div className="satin-surface rounded-xl p-4">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
                    ))}
                    {(() => {
                      const days = calendarDays.slice(0, 42);
                      const firstDay = new Date(days[0].date);
                      const offset = (firstDay.getDay() + 6) % 7; // Monday-based
                      const cells = [];
                      for (let i = 0; i < offset; i++) {
                        cells.push(<div key={`empty-${i}`} />);
                      }
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
                              } else {
                                if (day.date > checkIn) {
                                  setCheckOut(day.date);
                                } else {
                                  setCheckIn(day.date);
                                  setCheckOut('');
                                }
                              }
                            }}
                            disabled={!isAvailable}
                            className={`py-1.5 rounded text-xs transition-colors ${
                              isSelected ? 'bg-primary text-primary-foreground font-semibold' :
                              isInRange ? 'bg-primary/10 text-primary' :
                              isAvailable ? 'text-foreground hover:bg-accent cursor-pointer' :
                              'text-muted-foreground/30 line-through cursor-not-allowed'
                            }`}
                            title={isAvailable ? `€${day.price}/night` : 'Unavailable'}
                          >
                            {new Date(day.date).getDate()}
                          </button>
                        );
                      });
                      return cells;
                    })()}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/10" /> Selected range</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted line-through text-[8px] flex items-center justify-center">x</span> Unavailable</span>
                  </div>
                </div>
              </div>
            )}

            {/* House rules */}
            {property.houseRules && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">House rules</h2>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Check-in: {property.checkInTime}</p>
                  <p>Check-out: {property.checkOutTime}</p>
                  <p className="mt-2 whitespace-pre-line">{property.houseRules}</p>
                </div>
              </div>
            )}

            {property.neighborhood && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">The neighbourhood</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.neighborhood}</p>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <QuoteIcon size={18} className="text-primary" /> Guest Reviews
                  <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="satin-surface rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {review.guestName?.[0]?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{review.guestName || 'Guest'}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-primary fill-primary" />
                          <span className="text-sm font-semibold text-foreground">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.publicReview}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.lat && property.lng && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Location</h2>
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <iframe
                    title="Property location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.lat},${property.lng}&zoom=15`}
                    width="100%" height="300"
                    style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 satin-surface rounded-2xl p-6 space-y-5">
              <div className="flex items-baseline justify-between">
                <p className="font-serif text-2xl font-semibold text-foreground">
                  {formatCurrency(property.price)}
                  <span className="text-sm font-normal text-muted-foreground"> / night</span>
                </p>
                <span className="flex items-center gap-1 text-sm">
                  <Star size={13} className="text-primary fill-primary" /> {property.rating}
                </span>
              </div>

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
                    {Array.from({ length: property.guests }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price estimate */}
              {checkIn && checkOut && nights > 0 && (
                <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t border-border/30">
                  <div className="flex justify-between">
                    <span>{formatCurrency(property.price)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>{formatCurrency(property.price * nights)}</span>
                  </div>
                  {property.cleaningFee && (
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>{formatCurrency(property.cleaningFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/30">
                    <span>Estimated total</span>
                    <span className="text-primary">{formatCurrency(property.price * nights + (property.cleaningFee || 0))}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (checkIn && checkOut && listing) {
                    setShowBooking(true);
                  } else if (checkIn && checkOut) {
                    // Static property — open Guesty
                    const sp = staticProp;
                    if (sp) window.open(sp.bookingUrl, '_blank');
                  }
                }}
                disabled={!checkIn || !checkOut}
                className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {checkIn && checkOut ? 'Reserve Now' : 'Select Dates to Book'}
              </button>

              <p className="text-[10px] text-muted-foreground text-center">
                No charge until booking is confirmed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {showBooking && listing && (
          <BookingFlow
            listing={listing}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onClose={() => setShowBooking(false)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
