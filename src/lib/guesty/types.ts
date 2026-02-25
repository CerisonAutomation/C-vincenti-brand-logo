/**
 * Enterprise-grade TypeScript definitions for Guesty API integration
 * Implements exhaustive typing, zero-trust validation, and comprehensive JSDoc documentation
 * @version 2.0.0
 * @author Cascade AI
 * @license MIT
 */

// ── Runtime Validation Dependencies ──
import { z } from 'zod';

// ── Core Zod Schemas for Runtime Validation ──

// UUID Schema with validation
const UUIDSchema = z.string().uuid();
const EmailSchema = z.string().email();
const PhoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
const ISODateStringSchema = z.string().datetime();
const CurrencyCodeSchema = z.enum([
  'USD', 'EUR', 'AUD', 'CAD', 'JPY', 'ILS', 'GBP', 'HKD', 'NOK',
  'CZK', 'BRL', 'THB', 'ZAR', 'MYR', 'KRW', 'IDR', 'PHP', 'INR',
  'NZD', 'TWD', 'PLN', 'SGD', 'TRY', 'SEK', 'VND', 'ARS', 'CNY',
  'DKK', 'MXN', 'CHF', 'RUB', 'AED', 'SAR', 'EGP', 'KES'
]);

const PropertyTypeSchema = z.enum([
  'APARTMENT', 'HOUSE', 'LOFT', 'BOAT', 'CAMPER_RV', 'CONDOMINIUM', 'CHALET',
  'BED_BREAKFAST', 'VILLA', 'TENT', 'CABIN', 'TOWNHOUSE', 'BUNGALOW', 'HUT',
  'DORM', 'PARKING_SPACE', 'PLANE', 'TREEHOUSE', 'YURT', 'TIPI', 'IGLOO',
  'EARTH_HOUSE', 'ISLAND', 'CAVE', 'CASTLE', 'STUDIO', 'OTHER'
]);

const AmenitySchema = z.enum([
  'ACCESSIBLE_HEIGHT_BED', 'ACCESSIBLE_HEIGHT_TOILET', 'AIR_CONDITIONING',
  'BABYSITTER_RECOMMENDATIONS', 'BABY_BATH', 'BABY_MONITOR', 'BATHTUB',
  'BBQ_GRILL', 'BEACH_ESSENTIALS', 'BED_LINENS', 'BREAKFAST', 'CABLE_TV',
  'CARBON_MONOXIDE_DETECTOR', 'CHANGING_TABLE', 'CHILDREN_BOOKS_AND_TOYS',
  'CHILDREN_DINNERWARE', 'CLEANING_BEFORE_CHECKOUT', 'COFFEE_MAKER',
  'COOKING_BASICS', 'DISABLED_PARKING_SPOT', 'DISHES_AND_SILVERWARE',
  'DISHWASHER', 'DOGS', 'DOORMAN', 'DRYER', 'ELEVATOR_IN_BUILDING',
  'ESSENTIALS', 'EV_CHARGER', 'EXTRA_PILLOWS_AND_BLANKETS', 'FIREPLACE_GUARDS',
  'FIRE_EXTINGUISHER', 'FIRM_MATTRESS', 'FIRST_AID_KIT', 'FLAT_SMOOTH_PATHWAY_TO_FRONT_DOOR',
  'FREE_PARKING_ON_PREMISES', 'GAME_CONSOLE', 'GARDEN_OR_BACKYARD',
  'GRAB_RAILS_FOR_SHOWER_AND_TOILET', 'GYM', 'HAIR_DRYER', 'HANGERS',
  'HEATING', 'HIGH_CHAIR', 'HOT_TUB', 'HOT_WATER', 'INDOOR_FIREPLACE',
  'INTERNET', 'IRON', 'KITCHEN', 'LAPTOP_FRIENDLY_WORKSPACE', 'LONG_TERM_STAYS_ALLOWED',
  'LUGGAGE_DROPOFF_ALLOWED', 'MICROWAVE', 'OTHER_PET', 'OUTLET_COVERS', 'OVEN',
  'PACK_N_PLAY_TRAVEL_CRIB', 'PATH_TO_ENTRANCE_LIT_AT_NIGHT', 'PATIO_OR_BALCONY',
  'POOL', 'PRIVATE_ENTRANCE', 'REFRIGERATOR', 'ROLL_IN_SHOWER', 'ROOM_DARKENING_SHADES',
  'SAFETY_CARD', 'SHAMPOO', 'SINGLE_LEVEL_HOME', 'SKI_IN_SKI_OUT', 'SMART_LOCK',
  'SMOKE_DETECTOR', 'SMOKING_ALLOWED', 'STAIR_GATES', 'STEP_FREE_ACCESS',
  'STOVE', 'SUITE', 'TABLE_CORNER_GUARDS', 'TV', 'WASHER', 'WATERFRONT',
  'WHEELCHAIR_ACCESSIBLE', 'WIDE_CLEARANCE_TO_BED', 'WIDE_CLEARANCE_TO_SHOWER',
  'WIDE_DOORWAY', 'WIDE_HALLWAY_CLEARANCE', 'WINDOW_GUARDS', 'WIFI'
]);

// Address Schema with validation
const AddressSchema = z.object({
  full: z.string().min(1),
  country: z.string().length(2).optional(),
  state: z.string().optional(),
  city: z.string().min(1),
  street: z.string().optional(),
  zipcode: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// ── Enhanced Interface Schemas ──

// Listing Schema with runtime validation
const ListingSchema = z.object({
  _id: UUIDSchema,
  title: z.string().min(1),
  nickname: z.string().min(1),
  description: z.string().optional(),
  summary: z.string().optional(),
  pictures: z.array(z.object({
    _id: UUIDSchema,
    original: z.string().url(),
    thumbnail: z.string().url().optional(),
    medium: z.string().url().optional(),
    large: z.string().url().optional(),
    caption: z.string().optional(),
    sort: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
  })),
  address: AddressSchema,
  propertyType: PropertyTypeSchema,
  roomType: z.string().optional(),
  bedrooms: z.number().int().min(0),
  roomsCount: z.number().int().min(0),
  bedsCount: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  bathroomsCount: z.number().int().min(0),
  accommodates: z.number().int().min(1),
  amenities: z.array(AmenitySchema),
  pricing: z.object({
    currency: CurrencyCodeSchema,
    basePrice: z.number().positive(),
    cleaningFee: z.number().min(0).optional(),
    securityDeposit: z.number().min(0).optional(),
    weeklyDiscount: z.number().min(0).max(100).optional(),
    monthlyDiscount: z.number().min(0).max(100).optional(),
    minNights: z.number().int().min(1).optional(),
    maxNights: z.number().int().min(1).optional(),
  }),
  availability: z.object({
    isAvailable: z.boolean(),
    nextAvailableDate: ISODateStringSchema.optional(),
    calendarUrl: z.string().url().optional(),
  }),
  reviews: z.object({
    count: z.number().int().min(0),
    averageRating: z.number().min(0).max(5),
    summary: z.string().optional(),
  }).optional(),
  host: z.object({
    _id: UUIDSchema,
    name: z.string().min(1),
    email: EmailSchema,
    phone: PhoneNumberSchema.optional(),
    picture: z.string().url().optional(),
  }).optional(),
  policies: z.object({
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    smokingAllowed: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    partiesAllowed: z.boolean().optional(),
  }).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.string().optional(),
  }).optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  published: z.boolean(),
});

// ── Runtime Validation Utilities ──
export class RuntimeValidator {
  private static instance: RuntimeValidator;

  static getInstance(): RuntimeValidator {
    if (!RuntimeValidator.instance) {
      RuntimeValidator.instance = new RuntimeValidator();
    }
    return RuntimeValidator.instance;
  }

  /**
   * Validate data against a Zod schema with detailed error reporting
   */
  validate<T>(schema: z.ZodSchema<T>, data: unknown, context: string = 'validation'): ValidationResult<T> {
    try {
      const result = schema.parse(data);
      return {
        success: true,
        data: result,
        errors: [],
        context,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: (err as any).received || 'unknown',
          expected: (err as any).expected ? Array.isArray((err as any).expected) ? (err as any).expected : [(err as any).expected] : ['unknown'],
        }));

        console.warn(`[RuntimeValidator] Validation failed for ${context}:`, validationErrors);

        return {
          success: false,
          data: null as any,
          errors: validationErrors,
          context,
        };
      }

      console.error(`[RuntimeValidator] Unexpected validation error for ${context}:`, error);
      return {
        success: false,
        data: null as any,
        errors: [{ field: 'unknown', message: 'Unexpected validation error', code: 'unknown', received: 'unknown', expected: [] }],
        context,
      };
    }
  }

  /**
   * Validate API request data
   */
  validateApiRequest<T>(schema: z.ZodSchema<T>, data: unknown, endpoint: string): T {
    const result = this.validate(schema, data, `API request to ${endpoint}`);

    if (!result.success) {
      const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`API request validation failed for ${endpoint}: ${errorMessages}`);
    }

    return result.data;
  }

  /**
   * Validate API response data
   */
  validateApiResponse<T>(schema: z.ZodSchema<T>, data: unknown, endpoint: string): T {
    const result = this.validate(schema, data, `API response from ${endpoint}`);

    if (!result.success) {
      const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`API response validation failed for ${endpoint}: ${errorMessages}`);
    }

    return result.data;
  }

  /**
   * Safe validation that doesn't throw errors
   */
  safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    return this.validate(schema, data, 'safe validation');
  }
}

// ── Validation Result Type ──
export interface ValidationError {
  field: string;
  message: string;
  code: z.ZodIssueCode;
  received: string;
  expected: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: ValidationError[];
  context?: string;
}

// ── Pre-configured Validators ──
export const runtimeValidator = RuntimeValidator.getInstance();

// Schema validators with proper type casting
export const validateListing = (data: unknown): Listing => {
  const validated = runtimeValidator.validateApiResponse(ListingSchema, data, 'listing');
  return validated as Listing;
};

export const validateListingsArray = (data: unknown): Listing[] => {
  const arraySchema = z.array(ListingSchema);
  const validated = runtimeValidator.validateApiResponse(arraySchema, data, 'listings array');
  return validated as Listing[];
};

// ── Type Guards with Runtime Validation ──
export const isValidListing = (data: unknown): data is Listing => {
  return runtimeValidator.safeValidate(ListingSchema, data).success;
};

export const isValidEmail = (email: string): boolean => {
  return EmailSchema.safeParse(email).success;
};

export const isValidUUID = (uuid: string): boolean => {
  return UUIDSchema.safeParse(uuid).success;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  return PhoneNumberSchema.safeParse(phone).success;
};

// Core primitive types - simplified for compatibility
export type UUID = string;
export type Email = string;
export type PhoneNumber = string;
export type ISODateString = string;
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY' | 'ILS' | 'AUD' | 'HKD' | 'NOK' | 'CZK' | 'BRL' | 'THB' | 'ZAR' | 'MYR' | 'KRW' | 'IDR' | 'PHP' | 'INR' | 'NZD' | 'TWD' | 'PLN' | 'SGD' | 'TRY' | 'SEK' | 'VND' | 'ARS' | 'CNY' | 'DKK' | 'MXN' | 'CHF' | 'RUB' | 'AED' | 'SAR' | 'EGP' | 'KES';

/**
 * Property types supported by Guesty platform
 * @exhaustive - All possible property types are enumerated
 */
export type PropertyType =
  | 'APARTMENT' | 'HOUSE' | 'LOFT' | 'BOAT' | 'CAMPER_RV' | 'CONDOMINIUM' | 'CHALET'
  | 'BED_BREAKFAST' | 'VILLA' | 'TENT' | 'CABIN' | 'TOWNHOUSE' | 'BUNGALOW' | 'HUT'
  | 'DORM' | 'PARKING_SPACE' | 'PLANE' | 'TREEHOUSE' | 'YURT' | 'TIPI' | 'IGLOO'
  | 'EARTH_HOUSE' | 'ISLAND' | 'CAVE' | 'CASTLE' | 'STUDIO' | 'OTHER';

/**
 * Tax types for pricing calculations
 * @exhaustive - Covers all major tax jurisdictions
 */
export type TaxType =
  | 'CITY_TAX' | 'COUNTY_TAX' | 'STATE_TAX' | 'LOCAL_TAX' | 'VAT'
  | 'GOODS_AND_SERVICES_TAX' | 'TOURISM_TAX' | 'OCCUPANCY_TAX'
  | 'HOME_SHARING_TAX' | 'TRANSIENT_OCCUPANCY_TAX' | 'OTHER' | 'TAX';

/**
 * Comprehensive amenity types with accessibility support
 * @exhaustive - Includes all Guesty-supported amenities
 */
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
  | 'POOL' | 'PRIVATE_ENTRANCE' | 'REFRIGERATOR' | 'ROLL_IN_SHOWER' | 'ROOM_DARKENING_SHADES'
  | 'SAFETY_CARD' | 'SHAMPOO' | 'SINGLE_LEVEL_HOME' | 'SKI_IN_SKI_OUT' | 'SMART_LOCK'
  | 'SMOKE_DETECTOR' | 'SMOKING_ALLOWED' | 'STAIR_GATES' | 'STEP_FREE_ACCESS'
  | 'STOVE' | 'SUITE' | 'TABLE_CORNER_GUARDS' | 'TV' | 'WASHER' | 'WATERFRONT'
  | 'WHEELCHAIR_ACCESSIBLE' | 'WIDE_CLEARANCE_TO_BED' | 'WIDE_CLEARANCE_TO_SHOWER'
  | 'WIDE_DOORWAY' | 'WIDE_HALLWAY_CLEARANCE' | 'WINDOW_GUARDS' | 'WIFI';

/**
 * Geographic address with comprehensive location data
 * @interface
 */
export interface Address {
  /** Full formatted address string */
  readonly full: string;
  /** ISO 3166-1 alpha-2 country code */
  readonly country?: string;
  /** State or province name */
  readonly state?: string;
  /** City name - required for search functionality */
  readonly city: string;
  /** Street address */
  readonly street?: string;
  /** Postal/ZIP code */
  readonly zipcode?: string;
  /** Latitude coordinate (-90 to 90) */
  readonly lat?: number;
  /** Longitude coordinate (-180 to 180) */
  readonly lng?: number;
}

/**
 * Image asset with multiple resolution variants
 * @interface
 */
export interface Picture {
  /** Unique identifier */
  readonly _id: UUID;
  /** Original resolution URL */
  readonly original: string;
  /** Thumbnail resolution URL */
  readonly thumbnail?: string;
  /** Medium resolution URL */
  readonly medium?: string;
  /** Large resolution URL */
  readonly large?: string;
  /** Image caption/description */
  readonly caption?: string;
  /** Display order */
  readonly sort?: number;
  /** Associated tags for categorization */
  readonly tags?: readonly string[];
}

/**
 * Pricing structure with comprehensive cost breakdown
 * @interface
 */
export interface Pricing {
  /** Currency code for all amounts */
  readonly currency: CurrencyCode;
  /** Base nightly rate */
  readonly basePrice: number;
  /** One-time cleaning fee */
  readonly cleaningFee?: number;
  /** Security deposit amount */
  readonly securityDeposit?: number;
  /** Weekly discount percentage (0-100) */
  readonly weeklyDiscount?: number;
  /** Monthly discount percentage (0-100) */
  readonly monthlyDiscount?: number;
  /** Minimum stay requirement in nights */
  readonly minNights?: number;
  /** Maximum stay limit in nights */
  readonly maxNights?: number;
}

/**
 * Core listing entity with comprehensive property data
 * @interface
 */
export interface Listing {
  /** Unique identifier */
  readonly _id: UUID;
  /** Public display title */
  readonly title: string;
  /** Internal nickname for management */
  readonly nickname: string;
  /** Detailed description */
  readonly description?: string;
  /** Short summary for previews */
  readonly summary?: string;
  /** Image gallery */
  readonly pictures: readonly Picture[];
  /** Geographic location */
  readonly address: Address;
  /** Property classification */
  readonly propertyType: PropertyType;
  /** Room type specification */
  readonly roomType?: string;
  /** Number of bedrooms */
  readonly bedrooms: number;
  /** Total room count */
  readonly roomsCount: number;
  /** Total bed count */
  readonly bedsCount: number;
  /** Number of bathrooms */
  readonly bathrooms: number;
  /** Detailed bathroom count */
  readonly bathroomsCount: number;
  /** Maximum guest capacity */
  readonly accommodates: number;
  /** Available amenities */
  readonly amenities: readonly Amenity[];
  /** Pricing configuration */
  readonly pricing: Pricing;
  /** Availability status */
  readonly availability: {
    readonly isAvailable: boolean;
    readonly nextAvailableDate?: ISODateString;
    readonly calendarUrl?: string;
  };
  /** Review statistics */
  readonly reviews?: {
    readonly count: number;
    readonly averageRating: number;
    readonly summary?: string;
  };
  /** Host information */
  readonly host?: {
    readonly _id: UUID;
    readonly name: string;
    readonly email: Email;
    readonly phone?: PhoneNumber;
    readonly picture?: string;
  };
  /** House rules and policies */
  readonly policies?: {
    readonly checkInTime?: string;
    readonly checkOutTime?: string;
    readonly cancellationPolicy?: string;
    readonly smokingAllowed?: boolean;
    readonly petsAllowed?: boolean;
    readonly partiesAllowed?: boolean;
  };
  /** Precise geographic coordinates */
  readonly location?: {
    readonly lat: number;
    readonly lng: number;
    readonly accuracy?: string;
  };
  /** Creation timestamp */
  readonly createdAt: ISODateString;
  /** Last update timestamp */
  readonly updatedAt: ISODateString;
  /** Publication status */
  readonly published: boolean;
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
