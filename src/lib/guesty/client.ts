import type {
  Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee,
  GuestyError, ReservationResponse, ErrorCode, RatePlan,
  GuestyWebhookEvent
} from './types';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Guesty API Configuration
const FN_URL = import.meta.env.VITE_GUESTY_FN_URL || 'https://functions.supabase.co';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Enhanced Error Recovery System with AI-powered suggestions
const ERROR_DICTIONARY: Record<ErrorCode, { message: string; recoveryAction: string; aiSuggestion?: string }> = {
  // Availability errors
  LISTING_NOT_FOUND: { message: 'This property is no longer available.', recoveryAction: 'browse_properties', aiSuggestion: 'Let me find similar properties in the same area' },
  LISTING_CALENDAR_BLOCKED: { message: 'These dates are already reserved. Please select different dates.', recoveryAction: 'select_dates', aiSuggestion: 'I can suggest alternative dates that work' },
  LISTING_UNAVAILABLE: { message: 'This property is not available for booking.', recoveryAction: 'browse_properties', aiSuggestion: 'Let me show you other great options' },

  // Booking errors
  MIN_NIGHT_MISMATCH: { message: 'This property requires a minimum stay of {minNights} nights.', recoveryAction: 'select_dates', aiSuggestion: 'I can help you adjust your dates to meet the minimum stay requirement' },
  MAX_NIGHT_EXCEEDED: { message: 'This property has a maximum stay limit.', recoveryAction: 'select_dates', aiSuggestion: 'Consider splitting your stay or looking at nearby properties' },
  ADVANCE_BOOKING_NOTICE: { message: 'This property requires advance booking of at least {days} days.', recoveryAction: 'select_dates', aiSuggestion: 'I can find properties with more flexible booking policies' },
  WINDOW_NOT_OPEN: { message: 'Booking window is not yet open for these dates.', recoveryAction: 'select_dates', aiSuggestion: 'Let me check availability for future dates' },

  // Guest & Pricing errors
  GUEST_COUNT_EXCEEDED: { message: 'This property can accommodate a maximum of {maxGuests} guests.', recoveryAction: 'select_guests', aiSuggestion: 'I can find larger properties for your group' },
  INSUFFICIENT_GUESTS: { message: 'This property requires at least {minGuests} guests.', recoveryAction: 'select_guests', aiSuggestion: 'This property works best for larger groups' },
  PRICE_CHANGED: { message: 'The price for these dates has changed. Please refresh to see the new price.', recoveryAction: 'retry', aiSuggestion: 'Prices can fluctuate based on demand and seasonality' },
  PRICING_ERROR: { message: 'Unable to calculate price. Please try different dates.', recoveryAction: 'select_dates', aiSuggestion: 'Let me try alternative dates or properties' },

  // Coupon & Payment errors
  COUPON_NOT_FOUND: { message: 'The promo code entered is invalid or has expired.', recoveryAction: 'enter_code', aiSuggestion: 'I can check for other available promotions' },
  COUPON_IS_DISABLED: { message: 'This promo code is no longer active.', recoveryAction: 'enter_code', aiSuggestion: 'Let me find current promotions for your booking' },
  COUPON_MIN_NIGHT_MISMATCH: { message: 'This promo code requires a minimum stay of {minNights} nights.', recoveryAction: 'select_dates', aiSuggestion: 'I can adjust your dates to qualify for this promotion' },
  COUPON_MAXIMUM_USES_EXCEEDED: { message: 'This promo code has reached its usage limit.', recoveryAction: 'enter_code', aiSuggestion: 'This promotion is very popular! Let me find alternatives' },
  COUPON_EXPIRATION_DATE_EXCEEDED: { message: 'This promo code has expired.', recoveryAction: 'enter_code', aiSuggestion: 'Let me check for current active promotions' },
  COUPON_OUT_OF_CHECKIN_RANGE: { message: 'This promo code is not valid for your selected dates.', recoveryAction: 'select_dates', aiSuggestion: 'I can help you find dates that qualify for this promotion' },
  PAYMENT_FAILED: { message: 'Payment processing failed. Please try again or use a different payment method.', recoveryAction: 'retry_payment', aiSuggestion: 'Payment issues can sometimes be resolved by trying a different card or payment method' },
  PAYMENT_TOKEN_INVALID: { message: 'Payment token is invalid. Please refresh and try again.', recoveryAction: 'retry', aiSuggestion: 'This is usually a temporary issue. Please try again' },
  WRONG_PAYMENT_CONFIG: { message: 'Payment configuration error. Please contact support.', recoveryAction: 'contact_support', aiSuggestion: 'Our support team can help resolve this configuration issue quickly' },

  // Request errors
  WRONG_REQUEST_PARAMETERS: { message: 'There was an issue with your booking parameters. Please refresh and try again.', recoveryAction: 'retry', aiSuggestion: 'This is usually resolved by refreshing and trying again' },
  MISSING_REQUIRED_FIELD: { message: 'Please fill in all required fields.', recoveryAction: 'fill_form', aiSuggestion: 'I can help you complete the required information' },
  INVALID_DATE_RANGE: { message: 'Invalid date range selected.', recoveryAction: 'select_dates', aiSuggestion: 'Please select valid check-in and check-out dates' },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: { message: 'Too many requests. Please wait a moment and try again.', recoveryAction: 'wait_retry', aiSuggestion: 'Rate limiting protects our system. Please wait a moment before trying again' },
  QUOTA_EXCEEDED: { message: 'API quota exceeded. Please try again later.', recoveryAction: 'wait_retry', aiSuggestion: 'Our API quota helps ensure fair usage. Please try again in a few minutes' },

  // Additional error codes from Guesty API
  NOT_FOUND: { message: 'The requested resource was not found.', recoveryAction: 'retry', aiSuggestion: 'Please check your request and try again' },
  UNAUTHORIZED: { message: 'Authentication required. Please log in and try again.', recoveryAction: 'login', aiSuggestion: 'You need to be logged in to access this feature' },
  TOKEN_EXPIRED: { message: 'Your session has expired. Please refresh and try again.', recoveryAction: 'refresh', aiSuggestion: 'Please refresh the page to continue' },
  FORBIDDEN: { message: 'You do not have permission to access this resource.', recoveryAction: 'contact_support', aiSuggestion: 'Please contact support if you believe this is an error' },
  SERVICE_UNAVAILABLE: { message: 'Service temporarily unavailable. Please try again later.', recoveryAction: 'wait_retry', aiSuggestion: 'The service is temporarily down. Please try again in a few minutes' },
  INTERNAL_ERROR: { message: 'An internal error occurred. Please try again.', recoveryAction: 'retry', aiSuggestion: 'This is usually a temporary issue. Please try again' },
  COUPON_UNEXPECTED_ERROR: { message: 'An unexpected error occurred with the coupon.', recoveryAction: 'enter_code', aiSuggestion: 'Please try a different promo code or contact support' },
  CREATE_RESERVATION_ERROR: { message: 'Failed to create reservation.', recoveryAction: 'retry', aiSuggestion: 'Please try again or contact support if the issue persists' },
};

async function request<T>(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const url = new URL(FN_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const opts: RequestInit = {
    method,
    headers,
    ...(body && body !== null && typeof body === 'object' ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(url.toString(), opts);

  if (!res.ok) {
    const errorData: GuestyError = await res.json().catch(() => ({
      error_code: 'INTERNAL_ERROR',
      message: `HTTP ${res.status}: ${res.statusText}`,
    }));

    if (!errorData.error_code) {
      errorData.error_code = 'INTERNAL_ERROR';
    }

    throw errorData;
  }
  return res.json() as Promise<T>;
}

class GuestyClient {
  public formatError(error: GuestyError): string {
    const errorInfo = ERROR_DICTIONARY[error.error_code] || {
      message: 'An unexpected error occurred. Please try again.',
      recoveryAction: 'retry',
      aiSuggestion: 'Please try again or contact support if the issue persists'
    };

    // Try to interpolate dynamic values from error data
    let message = errorInfo.message;
    if (error.data?.errors && Array.isArray(error.data.errors)) {
      // Add specific error details if available
      const specificError = error.data.errors[0];
      if (specificError && typeof specificError === 'string' && !message.includes(specificError)) {
        message = `${message} ${specificError}`;
      }
    }

    return message;
  }

  public getRecoveryAction(error: GuestyError): string | undefined {
    const errorInfo = ERROR_DICTIONARY[error.error_code];
    return errorInfo?.recoveryAction;
  }

  public isRetryableError(error: GuestyError): boolean {
    const retryableCodes = [
      'PRICE_CHANGED', 'RATE_LIMIT_EXCEEDED', 'QUOTA_EXCEEDED',
      'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'UNEXPECTED_ERROR'
    ];
    return retryableCodes.includes(error.error_code);
  }

  async getListings(params: {
    minOccupancy?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    propertyType?: PropertyType;
    amenities?: Amenity[];
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price' | 'rating';
    [key: string]: unknown;
  } = {}): Promise<Listing[]> {
    const qp = new URLSearchParams(params as Record<string, string>).toString();
    return request<Listing[]>({ action: 'listings', params: qp });
  }

  async getListing(id: string): Promise<Listing> {
    return request<Listing>({ action: 'listing', id });
  }

  async getCities(): Promise<City[]> {
    return request<City[]>({ action: 'cities' });
  }

  async getListingCalendar(listingId: string, from: string, to: string): Promise<CalendarDay[]> {
    return request<CalendarDay[]>({ action: 'calendar', id: listingId, from, to });
  }

  /**
   * Create a reservation quote (Reservation Quote Flow).
   * POST /reservations/quotes
   * @see https://booking-api-docs.guesty.com/docs/new-reservation-creation-flow
   */
  async createQuote(params: QuoteRequest): Promise<Quote> {
    return request<Quote>({ action: 'quote' }, 'POST', {
      listingId: params.listingId,
      checkInDateLocalized: params.checkInDateLocalized,
      checkOutDateLocalized: params.checkOutDateLocalized,
      guestsCount: params.guestsCount,
      ...(params.coupons?.length ? { coupon: params.coupons[0] } : {}),
    });
  }

  /**
   * Retrieve a quote by ID.
   * GET /reservations/quotes/:quoteId
   */
  async getQuote(quoteId: string): Promise<Quote> {
    return request<Quote>({ action: 'quote-get', quoteId });
  }

  async updateCouponInQuote(quoteId: string, coupon: string): Promise<Quote> {
    return request<Quote>({ action: 'quote-coupon', quoteId }, 'POST', { coupon });
  }

  /**
   * Create instant reservation from a quote.
   * POST /reservations/quotes/:quoteId/instant
   * @see https://booking-api-docs.guesty.com/docs/new-reservation-creation-flow
   */
  async createInstantReservation(quoteId: string, guestData: {
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    payment?: {
      token: string;
    };
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'instant-booking', quoteId }, 'POST', guestData);
  }

  async createInquiry(listingId: string, inquiryData: {
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    message?: string;
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'inquiry' }, 'POST', { listingId, ...inquiryData });
  }

  async getPayoutSchedule(listingId: string, from: string, to: string): Promise<{
    payouts: Array<{
      date: string;
      amount: number;
      status: string;
    }>;
  }> {
    return request<{ payouts: Array<{ date: string; amount: number; status: string }> }>({ action: 'payout-schedule', id: listingId, from, to });
  }

  async getReviews(params: { listingId?: string; limit?: number; skip?: number } = {}): Promise<Review[]> {
    const qp = new URLSearchParams(params as Record<string, string>).toString();
    return request<Review[]>({ action: 'reviews', params: qp });
  }

  async getUpsellFees(listingId: string): Promise<UpsellFee[]> {
    return request<UpsellFee[]>({ action: 'upsell-fees', id: listingId });
  }

  async getPaymentProvider(listingId: string): Promise<PaymentProvider> {
    return request<PaymentProvider>({ action: 'payment-provider', id: listingId });
  }

  /**
   * Get available rate plans for a listing (V3 Booking Flow).
   * GET /me/listings/:id/rate-plans
   */
  async getRatePlans(listingId: string): Promise<RatePlan[]> {
    return request<RatePlan[]>({ action: 'rate-plans', id: listingId });
  }

  /**
   * Create quote with specific rate plan (V3 Booking Flow).
   * POST /reservations/quotes
   */
  async createQuoteWithRatePlan(params: QuoteRequest): Promise<Quote> {
    return request<Quote>({ action: 'quote' }, 'POST', {
      listingId: params.listingId,
      checkInDateLocalized: params.checkInDateLocalized,
      checkOutDateLocalized: params.checkOutDateLocalized,
      guestsCount: params.guestsCount,
      ...(params.ratePlanId ? { ratePlanId: params.ratePlanId } : {}),
      ...(params.coupons?.length ? { coupon: params.coupons[0] } : {}),
      ...(params.upsellFees?.length ? { upsellFees: params.upsellFees } : {}),
    });
  }

  /**
   * Update upsell fees in quote.
   * POST /reservations/quotes/:quoteId/upsell-fees
   */
  async updateUpsellFeesInQuote(quoteId: string, upsellFeeIds: string[]): Promise<Quote> {
    return request<Quote>({ action: 'quote-upsell-fees', quoteId }, 'POST', { upsellFeeIds });
  }

  /**
   * Get reservation details via Open API.
   * Used for confirmation page after booking.
   */
  async getReservation(reservationId: string): Promise<{
    id: string;
    status: string;
    guest: {
      firstName: string;
      lastName: string;
      email: string;
    };
    listing: {
      title: string;
      location: string;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    confirmationCode: string;
  }> {
    return request<{
      id: string;
      status: string;
      guest: { firstName: string; lastName: string; email: string };
      listing: { title: string; location: string };
      checkIn: string;
      checkOut: string;
      totalPrice: number;
      confirmationCode: string;
    }>({ action: 'open-reservation', reservationId });
  }
}

export const guestyClient = new GuestyClient();
