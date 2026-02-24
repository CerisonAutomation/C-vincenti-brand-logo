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
  | 'PACK_N_PLAY_TRAVEL_CRIB' | 'PATH_TO_ENTRANCE_LIT_AT_NIGHT' | 'PATIO_OR_BALCONY'
  | 'PETS_ALLOWED' | 'PETS_LIVE_ON_THIS_PROPERTY' | 'POCKET_WIFI' | 'PRIVATE_ENTRANCE'
  | 'REFRIGERATOR' | 'ROLL_IN_SHOWER_WITH_SHOWER_BENCH_OR_CHAIR' | 'ROOM_DARKENING_SHADES'
  | 'SHAMPOO' | 'SINGLE_LEVEL_HOME' | 'SMOKE_DETECTOR' | 'SMOKING_ALLOWED'
  | 'STAIR_GATES' | 'STEP_FREE_ACCESS' | 'STOVE' | 'SUITABLE_FOR_INFANTS'
  | 'SUITABLE_FOR_CHILDREN' | 'TUB_WITH_SHOWER_BENCH' | 'TV' | 'WASHER'
  | 'WIDE_CLEARANCE_TO_BED' | 'WIDE_CLEARANCE_TO_SHOWER_AND_TOILET' | 'WIDE_DOORWAY'
  | 'WIDE_HALLWAY_CLEARANCE' | 'WINDOW_GUARDS' | 'WIRELESS_INTERNET';

export type ErrorCode =
  | 'NOT_FOUND' | 'FORBIDDEN' | 'WRONG_REQUEST_PARAMETERS' | 'LISTING_CALENDAR_BLOCKED'
  | 'MIN_NIGHT_MISMATCH' | 'MAX_NIGHT_EXCEEDED' | 'ADVANCE_BOOKING_NOTICE' | 'WINDOW_NOT_OPEN'
  | 'GUEST_COUNT_EXCEEDED' | 'INSUFFICIENT_GUESTS' | 'PRICE_CHANGED' | 'PRICING_ERROR'
  | 'COUPON_NOT_FOUND' | 'COUPON_IS_DISABLED' | 'COUPON_MIN_NIGHT_MISMATCH' | 'COUPON_MAXIMUM_USES_EXCEEDED'
  | 'COUPON_EXPIRATION_DATE_EXCEEDED' | 'COUPON_OUT_OF_CHECKIN_RANGE' | 'COUPON_UNEXPECTED_ERROR'
  | 'CREATE_RESERVATION_ERROR' | 'WRONG_PAYMENT_CONFIG' | 'PAYMENT_FAILED' | 'PAYMENT_TOKEN_INVALID'
  | 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED'
  | 'SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR' | 'LISTING_NOT_FOUND' | 'LISTING_UNAVAILABLE'
  | 'MISSING_REQUIRED_FIELD' | 'INVALID_DATE_RANGE';

export interface Address {
  city: string;
  country: string;
  full: string;
  lat: number;
  lng: number;
  state?: string;
  street?: string;
  zipcode?: string;
  neighborhood?: string;
}

export interface BedArrangements {
  bedroomCount: number;
  commonSpaceCount: number;
  details: Array<{
    roomName: string;
    beds: Array<{
      type: 'queenBed' | 'kingBed' | 'doubleBed' | 'singleBed' | 'sofaBed' | 'bunkBed' | 'other';
      count: number;
    }>;
  }>;
}

export interface Picture {
  _id: string;
  original: string;
  large?: string;
  regular?: string;
  thumbnail: string;
}

export interface Prices {
  basePrice: number;
  currency: CurrencyCode;
  monthlyPriceFactor?: number;
  weeklyPriceFactor?: number;
  extraPersonFee?: number;
  cleaningFee?: number;
  petFee?: number;
}

export interface GuestControls {
  allowsChildren: boolean;
  allowsInfants: boolean;
  allowsPets: boolean;
  allowsSmoking: boolean;
  allowsEvents: boolean;
}

export interface PublicDescription {
  guestControls?: GuestControls;
  space?: string;
  access?: string;
  neighborhood?: string;
  transit?: string;
  notes?: string;
  interactionWithGuests?: string;
  summary?: string;
  houseRules?: string;
}

export interface Tax {
  _id: string;
  amount: number;
  appliedOnFees: string[];
  name: string;
  quantifier: 'NIGHT' | 'GUEST' | 'STAY' | 'PER_GUEST_PER_NIGHT';
  type: TaxType;
  units: 'FIXED' | 'PERCENTAGE';
}

export interface CalendarRules {
  defaultAvailability: 'AVAILABLE' | 'BLOCKED';
  seasonalMinNights?: Array<{ from: string; to: string; value: number }>;
  rentalPeriods?: Array<{ from: string; to: string }>;
  preparationTime?: number;
  advanceNotice?: { defaultSettings: { hours: number; allowRequestToBook: boolean } };
  bookingWindow?: { defaultSettings: { days: number } };
}

export interface Listing {
  _id: string;
  title: string;
  nickname?: string;
  type: 'SINGLE' | 'MTL';
  roomType: 'Entire home/apt' | 'Private room' | 'Shared room';
  accommodates: number;
  address: Address;
  publishedAddress?: Address;
  amenities: Amenity[];
  bedArrangements?: BedArrangements;
  bathrooms: number;
  bedrooms: number;
  beds: number;
  pictures: Picture[];
  prices: Prices;
  propertyType: PropertyType;
  reviewsCount?: number;
  rating?: number;
  parentListingId?: string;
  subUnits?: string[];
  checkInDateLocalized?: string;
  checkOutDateLocalized?: string;
  tags?: string[];
  allotment?: any;
  nightlyRates?: any;
  featured?: boolean;
  featuredPicture?: Picture;
  taxes?: Tax[];
  calendarRules?: CalendarRules;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  publicDescription?: PublicDescription;
}

export interface GuestyError {
  error_code: ErrorCode;
  message: string;
  data: { errors: string[]; requestId?: string };
}

export interface ReservationResponse {
  _id: string;
  status: 'confirmed' | 'inquiry' | 'declined';
  confirmationCode: string | null;
  errors?: string;
}

export interface CalendarDay {
  date: string;
  minNights: number;
  isBaseMinNights: boolean;
  status: 'available' | 'unavailable' | 'reserved' | 'booked';
  blockType?: 'manual' | 'reservation' | 'calendar_rule' | 'owner' | 'smart_rule' | 'annual_limit';
  cta: boolean;
  ctd: boolean;
  price: number;
  currency: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface QuoteRequest {
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  coupons?: string[];
  ratePlanId?: string; // For V3 Booking Flow - specific rate plan
  upsellFees?: string[]; // Optional upsell fees to include
}

export interface Quote {
  _id: string;
  listingId: string;
  ratePlanId?: string;
  ratePlanName?: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  currency: string;
  priceBreakdown: QuotePriceBreakdown[];
  taxes: QuoteTax[];
  coupons?: AppliedCoupon[];
  validUntil?: string; // Quote expiration
  upsellFees?: UpsellFeeQuote[];
}

export interface QuotePriceBreakdown {
  type: 'base' | 'extra_guest' | 'cleaning_fee' | 'pet_fee' | 'discount' | 'subtotal' | 'total';
  value: number;
  description: string;
  quantity?: number;
  unitPrice?: number;
}

export interface QuoteTax {
  name: string;
  amount: number;
  type: TaxType;
  quantifier: 'NIGHT' | 'GUEST' | 'STAY' | 'PER_GUEST_PER_NIGHT';
  includedInBase?: boolean;
}

export interface AppliedCoupon {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  description: string;
  discountAmount: number;
}

export interface UpsellFeeQuote {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  selected: boolean;
}

export interface RatePlan {
  _id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  minNights: number;
  maxNights?: number;
  cancellationPolicy?: CancellationPolicy;
}

export interface CancellationPolicy {
  type: 'flexible' | 'moderate' | 'strict' | 'custom';
  text: string;
  penalties?: Array<{
    daysBefore: number;
    penaltyPercent: number;
  }>;
}

export interface City {
  name: string;
  country: string;
  count: number;
}

export interface PaymentProvider {
  _id: string;
  type: 'stripe' | 'guesty_pay' | 'merchant_warrior';
  publishableKey?: string;
}

export interface Review {
  _id: string;
  listingId: string;
  guestName: string;
  rating: number;
  publicReview: string;
  createdAt: string;
}

export interface UpsellFee {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
}

export interface MetasearchConfig {
  _id: string;
  channelName: string;
  enabled: boolean;
}

export interface PayoutReconciliation {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  reservationConfirmationCode?: string;
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

export type WebhookEvent =
  | 'reservation.new' | 'reservation.updated' | 'reservation.messageReceived'
  | 'payment.received' | 'payment.failed' | 'listing.calendar.updated' | 'listing.updated';

export interface GuestyWebhook {
  _id: string;
  url: string;
  events: WebhookEvent[];
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
