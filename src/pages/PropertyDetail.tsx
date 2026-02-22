import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import { useListing, useListingCalendar, useCreateQuote } from '@/lib/guesty';
import { getSiteConfig } from '@/lib/site-config';
import { formatCurrency } from '@/lib/content';
import propertyFives from '@/assets/property-fives.jpg';
import propertyUrsula from '@/assets/property-ursula.jpg';
import propertyPenthouse from '@/assets/property-penthouse.jpg';

const config = getSiteConfig();

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WIRELESS_INTERNET: <Wifi size={16} />,
  INTERNET: <Wifi size={16} />,
  FREE_PARKING_ON_PREMISES: <Car size={16} />,
  HOT_TUB: <Waves size={16} />,
  AIR_CONDITIONING: <Snowflake size={16} />,
  HEATING: <Flame size={16} />,
  COFFEE_MAKER: <Coffee size={16} />,
  TV: <Tv size={16} />,
  CABLE_TV: <Tv size={16} />,
  KITCHEN: <Utensils size={16} />,
  WASHER: <Shirt size={16} />,
  DRYER: <Wind size={16} />,
};

const AMENITY_LABELS: Record<string, string> = {
  WIRELESS_INTERNET: 'Wi-Fi',
  INTERNET: 'Internet',
  FREE_PARKING_ON_PREMISES: 'Free Parking',
  HOT_TUB: 'Hot Tub',
  AIR_CONDITIONING: 'Air Conditioning',
  HEATING: 'Heating',
  COFFEE_MAKER: 'Coffee Maker',
  TV: 'TV',
  CABLE_TV: 'Cable TV',
  KITCHEN: 'Kitchen',
  WASHER: 'Washer',
  DRYER: 'Dryer',
  HAIR_DRYER: 'Hair Dryer',
  IRON: 'Iron',
  ESSENTIALS: 'Essentials',
  SHAMPOO: 'Shampoo',
  HANGERS: 'Hangers',
  BED_LINENS: 'Bed Linens',
  EXTRA_PILLOWS_AND_BLANKETS: 'Extra Pillows',
  FIRE_EXTINGUISHER: 'Fire Extinguisher',
  FIRST_AID_KIT: 'First Aid Kit',
  SMOKE_DETECTOR: 'Smoke Detector',
  CARBON_MONOXIDE_DETECTOR: 'CO Detector',
  ELEVATOR_IN_BUILDING: 'Elevator',
  PATIO_OR_BALCONY: 'Balcony/Patio',
  DISHWASHER: 'Dishwasher',
  REFRIGERATOR: 'Refrigerator',
  OVEN: 'Oven',
  STOVE: 'Stove',
  MICROWAVE: 'Microwave',
  COOKING_BASICS: 'Cooking Basics',
  DISHES_AND_SILVERWARE: 'Dishes & Silverware',
  BBQ_GRILL: 'BBQ Grill',
  GARDEN_OR_BACKYARD: 'Garden',
  LAPTOP_FRIENDLY_WORKSPACE: 'Workspace',
  GYM: 'Gym',
  PRIVATE_ENTRANCE: 'Private Entrance',
  HOT_WATER: 'Hot Water',
  LONG_TERM_STAYS_ALLOWED: 'Long-term OK',
  SUITABLE_FOR_CHILDREN: 'Child Friendly',
  PETS_ALLOWED: 'Pets Allowed',
};

// Static fallback images
const STATIC_IMAGES: Record<string, string> = {
  fives: propertyFives,
  ursula: propertyUrsula,
  penthouse: propertyPenthouse,
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  // Try Guesty live data
  const { data: listing, isLoading, isError } = useListing(id);
  const createQuote = useCreateQuote();

  // Fallback to static config
  const staticProp = config.properties.find(p => p.id === id);

  const today = new Date().toISOString().split('T')[0];

  // Build display data from either source
  const property = useMemo(() => {
    if (listing) {
      return {
        title: listing.title,
        location: listing.address?.city || listing.address?.full || 'Malta',
        beds: listing.bedrooms,
        baths: listing.bathrooms,
        guests: listing.accommodates,
        rating: listing.rating || 4.97,
        price: listing.prices?.basePrice || 0,
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
        bookingUrl: `https://malta.guestybookings.com/en/properties/${listing._id}`,
        lat: listing.address?.lat,
        lng: listing.address?.lng,
      };
    }
    if (staticProp) {
      return {
        title: staticProp.title,
        location: staticProp.location,
        beds: staticProp.beds,
        baths: staticProp.baths,
        guests: staticProp.guests,
        rating: 4.97,
        price: parseInt(staticProp.pricePerNight.replace(/[^0-9]/g, '')) || 0,
        currency: 'EUR',
        images: [STATIC_IMAGES[staticProp.id] || propertyFives],
        amenities: ['WIRELESS_INTERNET', 'AIR_CONDITIONING', 'KITCHEN', 'WASHER', 'TV', 'ESSENTIALS', 'BED_LINENS', 'HOT_WATER'],
        description: `Beautiful ${staticProp.type.toLowerCase()} in ${staticProp.location}. Professionally managed by Christiano Vincenti Property Management with hotel-grade linens, 5-star welcome packs, and 24/7 support.`,
        space: '',
        neighborhood: '',
        transit: '',
        houseRules: '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        propertyType: staticProp.type.toUpperCase(),
        cleaningFee: undefined,
        bedArrangements: undefined,
        bookingUrl: staticProp.bookingUrl,
        lat: undefined,
        lng: undefined,
      };
    }
    return null;
  }, [listing, staticProp, id]);

  const handleQuote = async () => {
    if (!id || !checkIn || !checkOut) return;
    try {
      const quote = await createQuote.mutateAsync({
        listingId: id!,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount: guests,
      });
      // Could show quote modal — for now link to Guesty
      window.open(property?.bookingUrl, '_blank');
    } catch {
      window.open(property?.bookingUrl, '_blank');
    }
  };

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

  return (
    <Layout>
      <div className="section-container py-8">
        {/* Back link */}
        <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Properties
        </Link>

        {/* Image gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="aspect-[16/9] sm:aspect-[2/1] relative">
            <motion.img
              key={currentImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[currentImageIdx]}
              alt={`${property.title} — Photo ${currentImageIdx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay info */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-background/60 backdrop-blur-sm rounded text-[10px] text-muted-foreground uppercase tracking-wider">
                  {property.propertyType}
                </span>
                <span className="flex items-center gap-1 text-xs text-foreground">
                  <Star size={12} className="text-primary fill-primary" /> {property.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentImageIdx(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-background/60 backdrop-blur-sm rounded-full text-xs text-foreground">
                {currentImageIdx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {images.slice(0, 8).map((img, i) => (
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

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin size={14} className="text-primary" /> {property.location}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BedDouble size={15} /> {property.beds} bedroom{property.beds !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Bath size={15} /> {property.baths} bathroom{property.baths !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Users size={15} /> Up to {property.guests} guests</span>
              </div>
            </div>

            {/* Description */}
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

            {/* Neighborhood */}
            {property.neighborhood && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">The neighbourhood</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.neighborhood}</p>
              </div>
            )}

            {/* Map embed */}
            {property.lat && property.lng && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Location</h2>
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <iframe
                    title="Property location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.lat},${property.lng}&zoom=15`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
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
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={e => {
                        setCheckIn(e.target.value);
                        if (!checkOut || e.target.value >= checkOut) {
                          const d = new Date(e.target.value);
                          d.setDate(d.getDate() + 3);
                          setCheckOut(d.toISOString().split('T')[0]);
                        }
                      }}
                      className="form-input text-xs [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || today}
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

              {checkIn && checkOut && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30">
                  {(() => {
                    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <>
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
                          <span>Total</span>
                          <span>{formatCurrency(property.price * nights + (property.cleaningFee || 0))}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                onClick={handleQuote}
                className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {checkIn && checkOut ? 'Reserve Now' : 'Check Availability'}
              </button>

              <a
                href={property.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-lg transition-colors"
              >
                View on Booking Engine <ExternalLink size={12} />
              </a>

              <p className="text-[10px] text-muted-foreground text-center">
                Managed by Christiano Vincenti Property Management
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
