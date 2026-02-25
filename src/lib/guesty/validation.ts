/**
 * Enterprise-grade validation schemas for Guesty API integration
 * Implements zero-trust validation with comprehensive error handling
 * @version 2.0.0
 * @author Cascade AI
 */

import { z } from 'zod';
import type {
  UUID, Email, PhoneNumber, ISODateString, CurrencyCode,
  PropertyType, TaxType, Amenity, Address, Picture, Pricing,
  Listing, CalendarDay, City, Review, QuoteRequest, Quote,
  RatePlan, Coupon, UpsellFee, ReservationGuest, ReservationResponse,
  SearchFilters, SearchResult, WebhookEvent, PerformanceMetrics
} from './types';

// Core primitive validators with zero-trust approach
export const UUIDSchema = z.string().uuid() as z.ZodType<UUID>;
export const EmailSchema = z.string().email() as z.ZodType<Email>;
export const PhoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/) as z.ZodType<PhoneNumber>;
export const ISODateStringSchema = z.string().datetime() as z.ZodType<ISODateString>;

export const CurrencyCodeSchema = z.enum([
  'USD', 'EUR', 'AUD', 'CAD', 'JPY', 'ILS', 'GBP', 'HKD', 'NOK',
  'CZK', 'BRL', 'THB', 'ZAR', 'MYR', 'KRW', 'IDR', 'PHP', 'INR',
  'NZD', 'TWD', 'PLN', 'SGD', 'TRY', 'SEK', 'VND', 'ARS', 'CNY',
  'DKK', 'MXN', 'CHF', 'RUB', 'AED', 'SAR', 'EGP', 'KES'
]) as z.ZodType<CurrencyCode>;

export const PropertyTypeSchema = z.enum([
  'APARTMENT', 'HOUSE', 'LOFT', 'BOAT', 'CAMPER_RV', 'CONDOMINIUM', 'CHALET',
  'BED_BREAKFAST', 'VILLA', 'TENT', 'CABIN', 'TOWNHOUSE', 'BUNGALOW', 'HUT',
  'DORM', 'PARKING_SPACE', 'PLANE', 'TREEHOUSE', 'YURT', 'TIPI', 'IGLOO',
  'EARTH_HOUSE', 'ISLAND', 'CAVE', 'CASTLE', 'STUDIO', 'OTHER'
]) as z.ZodType<PropertyType>;

export const TaxTypeSchema = z.enum([
  'CITY_TAX', 'COUNTY_TAX', 'STATE_TAX', 'LOCAL_TAX', 'VAT',
  'GOODS_AND_SERVICES_TAX', 'TOURISM_TAX', 'OCCUPANCY_TAX',
  'HOME_SHARING_TAX', 'TRANSIENT_OCCUPANCY_TAX', 'OTHER', 'TAX'
]) as z.ZodType<TaxType>;

// Comprehensive amenity validation
export const AmenitySchema = z.enum([
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
]) as z.ZodType<Amenity>;

// Geographic validation with bounds checking
export const AddressSchema = z.object({
  full: z.string().min(1).max(500),
  country: z.string().length(2).optional(),
  state: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100),
  street: z.string().min(1).max(200).optional(),
  zipcode: z.string().min(1).max(20).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
}) satisfies z.ZodType<Address>;

// Image validation with URL safety
export const PictureSchema = z.object({
  _id: UUIDSchema,
  original: z.string().url(),
  thumbnail: z.string().url().optional(),
  medium: z.string().url().optional(),
  large: z.string().url().optional(),
  caption: z.string().max(500).optional(),
  sort: z.number().int().min(0).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
}) satisfies z.ZodType<Picture>;

// Financial validation with business rules
export const PricingSchema = z.object({
  currency: CurrencyCodeSchema,
  basePrice: z.number().positive().max(100000), // Reasonable price ceiling
  cleaningFee: z.number().min(0).max(10000).optional(),
  securityDeposit: z.number().min(0).max(50000).optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
  minNights: z.number().int().min(1).max(365).optional(),
  maxNights: z.number().int().min(1).max(365).optional(),
}).refine(
  (data) => !data.minNights || !data.maxNights || data.minNights <= data.maxNights,
  { message: "Minimum nights cannot exceed maximum nights" }
) satisfies z.ZodType<Pricing>;

// Comprehensive listing validation
export const ListingSchema = z.object({
  _id: UUIDSchema,
  title: z.string().min(1).max(200),
  nickname: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  summary: z.string().max(500).optional(),
  pictures: z.array(PictureSchema).min(1).max(50),
  address: AddressSchema,
  propertyType: PropertyTypeSchema,
  roomType: z.string().max(50).optional(),
  bedrooms: z.number().int().min(0).max(50),
  roomsCount: z.number().int().min(1).max(100),
  bedsCount: z.number().int().min(1).max(100),
  bathrooms: z.number().min(0).max(50),
  bathroomsCount: z.number().min(0).max(50),
  accommodates: z.number().int().min(1).max(100),
  amenities: z.array(AmenitySchema).max(100),
  pricing: PricingSchema,
  availability: z.object({
    isAvailable: z.boolean(),
    nextAvailableDate: ISODateStringSchema.optional(),
    calendarUrl: z.string().url().optional(),
  }),
  reviews: z.object({
    count: z.number().int().min(0),
    averageRating: z.number().min(0).max(5),
    summary: z.string().max(1000).optional(),
  }).optional(),
  host: z.object({
    _id: UUIDSchema,
    name: z.string().min(1).max(200),
    email: EmailSchema,
    phone: PhoneNumberSchema.optional(),
    picture: z.string().url().optional(),
  }).optional(),
  policies: z.object({
    checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    cancellationPolicy: z.string().max(1000).optional(),
    smokingAllowed: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    partiesAllowed: z.boolean().optional(),
  }).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.string().max(50).optional(),
  }).optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  published: z.boolean(),
}).refine(
  (data) => data.accommodates >= data.bedrooms,
  { message: "Accommodates count cannot be less than bedroom count" }
) satisfies z.ZodType<Listing>;

// Calendar validation with business rules
export const CalendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  available: z.boolean(),
  price: z.number().positive().optional(),
  minimumStay: z.number().int().min(1).max(365).optional(),
  maximumStay: z.number().int().min(1).max(365).optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
  reason: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
}).refine(
  (data) => !data.minimumStay || !data.maximumStay || data.minimumStay <= data.maximumStay,
  { message: "Minimum stay cannot exceed maximum stay" }
) satisfies z.ZodType<CalendarDay>;

// Search and filtering validation
export const SearchFiltersSchema = z.object({
  location: z.string().max(200).optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guests: z.number().int().min(1).max(100).optional(),
  propertyType: z.array(PropertyTypeSchema).max(10).optional(),
  amenities: z.array(AmenitySchema).max(20).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().max(100000),
    currency: CurrencyCodeSchema,
  }).optional(),
  instantBook: z.boolean().optional(),
  superhost: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'popularity', 'distance']).optional(),
}).refine(
  (data) => {
    if (data.checkIn && data.checkOut) {
      return new Date(data.checkOut) > new Date(data.checkIn);
    }
    return true;
  },
  { message: "Check-out date must be after check-in date" }
) satisfies z.ZodType<SearchFilters>;

// API request validation
export const QuoteRequestSchema = z.object({
  listingId: UUIDSchema,
  checkInDateLocalized: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDateLocalized: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestsCount: z.number().int().min(1).max(100),
  ratePlanId: UUIDSchema.optional(),
  coupons: z.array(z.string().min(1).max(50)).max(5).optional(),
  upsellFees: z.array(z.string().min(1).max(50)).max(10).optional(),
  message: z.string().max(1000).optional(),
  guestInfo: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: EmailSchema.optional(),
    phone: PhoneNumberSchema.optional(),
  }).optional(),
}).refine(
  (data) => new Date(data.checkOutDateLocalized) > new Date(data.checkInDateLocalized),
  { message: "Check-out date must be after check-in date" }
) satisfies z.ZodType<QuoteRequest>;

// Booking validation with PCI compliance considerations
export const ReservationGuestSchema = z.object({
  firstName: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/),
  lastName: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/),
  email: EmailSchema,
  phone: PhoneNumberSchema.optional(),
  dateOfBirth: ISODateStringSchema.optional(),
  nationality: z.string().length(2).optional(),
  address: z.object({
    full: z.string().min(1).max(500),
    country: z.string().length(2).optional(),
    city: z.string().min(1).max(100).optional(),
    street: z.string().min(1).max(200).optional(),
    zipcode: z.string().min(1).max(20).optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }
    return true;
  },
  { message: "Guest must be between 18 and 120 years old" }
) satisfies z.ZodType<ReservationGuest>;

// Performance metrics validation
export const PerformanceMetricsSchema = z.object({
  api: z.object({
    responseTime: z.number().min(0),
    errorRate: z.number().min(0).max(1),
    throughput: z.number().min(0),
  }),
  booking: z.object({
    conversionRate: z.number().min(0).max(1),
    averageBookingValue: z.number().min(0),
    cancellationRate: z.number().min(0).max(1),
  }),
  user: z.object({
    sessionDuration: z.number().min(0),
    bounceRate: z.number().min(0).max(1),
    returnRate: z.number().min(0).max(1),
  }),
}) satisfies z.ZodType<PerformanceMetrics>;

// Environment validation with security checks
export const EnvironmentSchema = z.object({
  // API Credentials - encrypted at rest
  GUESTY_BE_CLIENT_ID: z.string().min(1),
  GUESTY_BE_CLIENT_SECRET: z.string().min(1),
  GUESTY_OPEN_API_CLIENT_ID: z.string().min(1),
  GUESTY_OPEN_API_CLIENT_SECRET: z.string().min(1),

  // Configuration
  GUESTY_BOOKING_TYPE: z.enum(['INQUIRY', 'INSTANT']),
  GUESTY_WEBHOOK_SECRET: z.string().min(32), // Minimum 32 chars for security

  // Security
  ALLOWED_ORIGINS: z.string().transform((val) =>
    val.split(',').map(origin => origin.trim()).filter(Boolean)
  ),

  // Optional integrations
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
}).refine(
  (data) => data.ALLOWED_ORIGINS.length > 0,
  { message: "At least one allowed origin must be specified" }
);

/**
 * Runtime validation functions with detailed error reporting
 */
export class ValidationService {
  static validateListing(data: unknown): Listing {
    try {
      return ListingSchema.parse(data);
    } catch (error) {
      throw new ValidationError('Invalid listing data', error);
    }
  }

  static validateQuoteRequest(data: unknown): QuoteRequest {
    try {
      return QuoteRequestSchema.parse(data);
    } catch (error) {
      throw new ValidationError('Invalid quote request', error);
    }
  }

  static validateReservationGuest(data: unknown): ReservationGuest {
    try {
      return ReservationGuestSchema.parse(data);
    } catch (error) {
      throw new ValidationError('Invalid guest information', error);
    }
  }

  static validateEnvironment(): void {
    const env = {
      GUESTY_BE_CLIENT_ID: process.env.GUESTY_BE_CLIENT_ID,
      GUESTY_BE_CLIENT_SECRET: process.env.GUESTY_BE_CLIENT_SECRET,
      GUESTY_OPEN_API_CLIENT_ID: process.env.GUESTY_OPEN_API_CLIENT_ID,
      GUESTY_OPEN_API_CLIENT_SECRET: process.env.GUESTY_OPEN_API_CLIENT_SECRET,
      GUESTY_BOOKING_TYPE: process.env.GUESTY_BOOKING_TYPE,
      GUESTY_WEBHOOK_SECRET: process.env.GUESTY_WEBHOOK_SECRET,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN,
    };

    try {
      EnvironmentSchema.parse(env);
    } catch (error) {
      throw new ValidationError('Invalid environment configuration', error);
    }
  }
}

/**
 * Enterprise-grade validation error with detailed context
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      code: this.code,
      cause: this.cause,
    };
  }
}
