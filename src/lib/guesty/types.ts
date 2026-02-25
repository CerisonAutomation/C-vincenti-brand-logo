export type PropertyType =
  | 'APARTMENT' | 'HOUSE' | 'LOFT' | 'BOAT' | 'CAMPER_RV' | 'CONDOMINIUM' | 'CHALET'
  | 'BED_BREAKFAST' | 'VILLA' | 'TENT' | 'CABIN' | 'TOWNHOUSE' | 'BUNGALOW' | 'HUT'
  | 'DORM' | 'PARKING_SPACE' | 'PLANE' | 'TREEHOUSE' | 'YURT' | 'TIPI' | 'IGLOO'
  | 'EARTH_HOUSE' | 'ISLAND' | 'CAVE' | 'CASTLE' | 'STUDIO' | 'OTHER';

export type TaxType =
  | 'CITY_TAX' | 'COUNTY_TAX' | 'STATE_TAX' | 'LOCAL_TAX' | 'VAT'
  | 'GOODS_AND_SERVICES_TAX' | 'TOURISM_TAX' | 'OCCUPANCY_TAX'
  | 'HOME_SHARING_TAX' | 'TRANSIENT_OCCUPANCY_TAX' | 'OTHER' | 'TAX';

export type CurrencyCode =
  | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'JPY' | 'ILS' | 'GBP' | 'HKD' | 'NOK'
  | 'CZK' | 'BRL' | 'THB' | 'ZAR' | 'MYR' | 'KRW' | 'IDR' | 'PHP' | 'INR'
  | 'NZD' | 'TWD' | 'PLN' | 'SGD' | 'TRY' | 'SEK' | 'VND' | 'ARS' | 'CNY'
  | 'DKK' | 'MXN';

export type Amenity =
  | 'ACCESSIBLE_HEIGHT_BED' | 'ACCESSIBLE_HEIGHT_TOILET' | 'AIR_CONDITIONING'
  | 'BABYSITTER_RECOMMENDATIONS' | 'BABY_BATH' | 'BABY_MONITOR' | 'BATHTUB'
  | 'BBQ_GRILL' | 'BEACH_ESSENTIALS' | 'BED_LINENS' | 'BREAKFAST' | 'CABLE_TV'
  | 'CARBON_MONOXIDE_DETECTOR' | 'CHANGING_TABLE' | 'CHILDREN_BOOKS_AND_TOYS'
  | 'CHILDREN_DINNERWARE' | 'CLEANING_BEFORE_CHECKOUT' | 'COFFEE_MAKER'
  | 'COOKING_BASICS' | 'DISABLED_PARKING_SPOT' | 'DISHES_AND_SILVERWARE'
  | 'DISHWASHER' | 'DOGS' | 'DOORMAN' | 'DRYER' | 'ELEVATOR_IN_BUILDING'
  | 'ESSENTIALS' | 'EV_CHARGER' | 'EXTRA_PILLOWS_AND_BLANKETS' | 'FIREPLACE_GUARDS'
  | 'FIRE_EXTINGUISHER' | 'FIRM_MATTRESS' | 'FIRST_AID_KIT' | 'FLAT_SMOOTH_PATHWAY_TO_FRONT_DOOR'
  | 'FREE_PARKING_ON_PREMISES' | 'GAME_CONSOLE' | 'GARDEN_OR_BACKYARD'
  | 'GRAB_RAILS_FOR_SHOWER_AND_TOILET' | 'GYM' | 'HAIR_DRYER' | 'HANGERS'
  | 'HEATING' | 'HIGH_CHAIR' | 'HOT_TUB' | 'HOT_WATER' | 'INDOOR_FIREPLACE'
  | 'INTERNET' | 'IRON' | 'KITCHEN' | 'LAPTOP_FRIENDLY_WORKSPACE' | 'LONG_TERM_STAYS_ALLOWED'
  | 'LUGGAGE_DROPOFF_ALLOWED' | 'MICROWAVE' | 'OTHER_PET' | 'OUTLET_COVERS' | 'OVEN'
  | 'PACK_N_PLAY_TRAVEL_CRIB' | 'PATH_TO_ENTRANCE_LIT_AT_NIGHT' | 'PATIO_OR_BALCONY';

export interface Address {
  full: string;
  country?: string;
  state?: string;
  city: string;
  street?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
}

export interface Picture {
  _id: string;
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  caption?: string;
  sort?: number;
  tags?: string[];
}

export interface Pricing {
  currency: string;
  basePrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  minNights?: number;
  maxNights?: number;
}

export interface Listing {
  _id: string;
  title: string;
  nickname: string;
  description?: string;
  summary?: string;
  pictures: Picture[];
  address: Address;
  propertyType: PropertyType;
  roomType?: string;
  bedrooms: number;
  roomsCount: number;
  bedsCount: number;
  bathrooms: number;
  bathroomsCount: number;
  accommodates: number;
  amenities: Amenity[];
  pricing: Pricing;
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: string;
    calendarUrl?: string;
  };
  reviews?: {
    count: number;
    averageRating: number;
    summary?: string;
  };
  host?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    picture?: string;
  };
  policies?: {
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  location?: {
    lat: number;
    lng: number;
    accuracy?: string;
  };
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CalendarDay {
  date: string;
  available: boolean;
  price?: number;
  minimumStay?: number;
  maximumStay?: number;
  checkIn?: boolean;
  checkOut?: boolean;
  reason?: string;
  note?: string;
}

export interface City {
  _id: string;
  name: string;
  country: string;
  state?: string;
  count: number;
  center?: {
    lat: number;
    lng: number;
  };
}

export interface Review {
  _id: string;
  listingId: string;
  guestId: string;
  guestName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  response?: {
    comment: string;
    createdAt: string;
  };
  verified: boolean;
  public: boolean;
}

export interface QuoteRequest {
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  ratePlanId?: string;
  coupons?: string[];
  upsellFees?: string[];
  message?: string;
  guestInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

export interface Quote {
  _id: string;
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  nightsCount: number;
  currency: string;
  priceBreakdown: {
    accommodation: number;
    cleaningFee?: number;
    securityDeposit?: number;
    taxes?: number;
    fees?: number;
    discounts?: number;
    total: number;
  };
  ratePlan?: RatePlan;
  coupons?: Coupon[];
  upsellFees?: UpsellFee[];
  available: boolean;
  reason?: string;
  createdAt: string;
  expiresAt: string;
}

export interface RatePlan {
  _id: string;
  name: string;
  description?: string;
  pricing: {
    basePrice: number;
    currency: string;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  minNights?: number;
  maxNights?: number;
  checkInDays?: number[];
  checkOutDays?: number[];
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    currency?: string;
  };
  minNights?: number;
  maxNights?: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  applicableListings?: string[];
  active: boolean;
}

export interface UpsellFee {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  type: 'per_night' | 'per_stay' | 'per_guest';
  required: boolean;
  maxQuantity?: number;
}

export interface PaymentProvider {
  name: string;
  supportedCurrencies: string[];
  supportedCards: string[];
  fees?: {
    percentage?: number;
    fixed?: number;
  };
  configuration: Record<string, any>;
}

export interface ReservationGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    full: string;
    country?: string;
    city?: string;
    street?: string;
    zipcode?: string;
  };
}

export interface ReservationResponse {
  _id: string;
  confirmationCode: string;
  status: 'inquiry' | 'tentative' | 'confirmed' | 'cancelled' | 'expired';
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  nightsCount: number;
  guest: ReservationGuest;
  money: {
    currency: string;
    totalPaid: number;
    netIncome?: number;
    hostPayout?: number;
    fees?: number;
    taxes?: number;
  };
  payment?: {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    method?: string;
    transactionId?: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
  specialRequests?: string;
  source?: string;
}

// Enhanced types for advanced booking features
export interface BookingAnalytics {
  listingId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    views: number;
    inquiries: number;
    bookings: number;
    conversionRate: number;
    averageStay: number;
    revenue: number;
    occupancyRate: number;
  };
  trends: {
    views: number;
    bookings: number;
    revenue: number;
  };
}

export interface GuestProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: Address;
  preferences?: {
    amenities?: Amenity[];
    propertyTypes?: PropertyType[];
    budget?: {
      min?: number;
      max?: number;
      currency: string;
    };
    locations?: string[];
  };
  bookingHistory: {
    totalBookings: number;
    totalSpent: number;
    averageRating?: number;
    favoriteAmenities?: Amenity[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  email: {
    bookingConfirmations: boolean;
    paymentReminders: boolean;
    reviewRequests: boolean;
    marketing: boolean;
  };
  sms: {
    bookingUpdates: boolean;
    checkInReminders: boolean;
  };
  push: {
    priceAlerts: boolean;
    availabilityAlerts: boolean;
  };
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  propertyType?: PropertyType[];
  amenities?: Amenity[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  instantBook?: boolean;
  superhost?: boolean;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'distance';
}

export interface SearchResult {
  listings: Listing[];
  totalCount: number;
  page: number;
  limit: number;
  filters: SearchFilters;
  facets: {
    propertyTypes: Record<PropertyType, number>;
    amenities: Record<Amenity, number>;
    priceRanges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
    locations: Array<{
      name: string;
      count: number;
    }>;
  };
}

// Webhook and real-time types
export interface WebhookEvent {
  type: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'payment.succeeded' | 'payment.failed' | 'review.created';
  data: Record<string, any>;
  createdAt: string;
  id: string;
}

export interface RealtimeSubscription {
  channel: string;
  events: string[];
  callback: (event: WebhookEvent) => void;
}

// Advanced analytics types
export interface PerformanceMetrics {
  api: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  booking: {
    conversionRate: number;
    averageBookingValue: number;
    cancellationRate: number;
  };
  user: {
    sessionDuration: number;
    bounceRate: number;
    returnRate: number;
  };
}

// Integration types
export interface ThirdPartyIntegration {
  provider: 'stripe' | 'paypal' | 'google' | 'facebook' | 'airbnb' | 'booking_com';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync?: string;
  error?: string;
}

export interface APIKey {
  _id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: string;
  lastUsed?: string;
  createdAt: string;
}

export interface AdminListing extends Listing {
  internalNote?: string;
  ownerId?: string;
  isListed?: boolean;
  commission?: number;
}

export interface AdminReservation {
  _id: string;
  confirmationCode: string;
  listingId: string;
  guestId: string;
  status: string;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  source: string;
  createdAt: string;
}

export interface InboxMessage {
  _id: string;
  threadId: string;
  senderId: string;
  body: string;
  platform: 'airbnb' | 'booking_com' | 'vrbo' | 'whatsapp' | 'email' | 'sms';
  createdAt: string;
}

export interface Folio {
  _id: string;
  reservationId: string;
  balance: number;
  currency: string;
  ledgers: Array<{ name: string; balance: number }>;
  entries: Array<{ type: string; amount: number; description: string; isTax: boolean }>;
}

export type GuestyWebhookEvent =
  | 'reservation.new' | 'reservation.updated' | 'reservation.messageReceived'
  | 'payment.received' | 'payment.failed' | 'listing.calendar.updated' | 'listing.updated';

export interface GuestyWebhook {
  _id: string;
  url: string;
  events: GuestyWebhookEvent[];
  active: boolean;
}

export interface JournalEntry {
  _id: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  description: string;
  date: string;
}

// Error types for Guesty API
export type ErrorCode =
  | 'LISTING_NOT_FOUND'
  | 'LISTING_CALENDAR_BLOCKED'
  | 'LISTING_UNAVAILABLE'
  | 'MIN_NIGHT_MISMATCH'
  | 'MAX_NIGHT_EXCEEDED'
  | 'ADVANCE_BOOKING_NOTICE'
  | 'WINDOW_NOT_OPEN'
  | 'GUEST_COUNT_EXCEEDED'
  | 'INSUFFICIENT_GUESTS'
  | 'PRICE_CHANGED'
  | 'PRICING_ERROR'
  | 'COUPON_NOT_FOUND'
  | 'COUPON_IS_DISABLED'
  | 'COUPON_MIN_NIGHT_MISMATCH'
  | 'COUPON_MAXIMUM_USES_EXCEEDED'
  | 'COUPON_EXPIRATION_DATE_EXCEEDED'
  | 'COUPON_OUT_OF_CHECKIN_RANGE'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_TOKEN_INVALID'
  | 'WRONG_PAYMENT_CONFIG'
  | 'WRONG_REQUEST_PARAMETERS'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_DATE_RANGE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'COUPON_UNEXPECTED_ERROR'
  | 'CREATE_RESERVATION_ERROR';

export interface GuestyError {
  error_code: ErrorCode;
  message: string;
  data?: {
    errors?: string[];
    details?: Record<string, any>;
  };
}
