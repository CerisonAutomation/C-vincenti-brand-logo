import type {
  Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee,
  GuestyError, ReservationResponse, ErrorCode, RatePlan
} from './types';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/guesty-proxy`;

// Comprehensive error code mapping based on Guesty API documentation
const ERROR_DICTIONARY: Record<string, { message: string; recoveryAction?: string }> = {
  // Authentication & Authorization
  UNAUTHORIZED: { message: 'Authentication required. Please refresh the page.', recoveryAction: 'reload' },
  TOKEN_EXPIRED: { message: 'Your session has expired. Refreshing...', recoveryAction: 'reload' },
  FORBIDDEN: { message: 'You do not have permission to perform this action.', recoveryAction: 'contact_support' },
  
  // Listing errors
  LISTING_NOT_FOUND: { message: 'This property is no longer available.', recoveryAction: 'browse_properties' },
  LISTING_CALENDAR_BLOCKED: { message: 'These dates are already reserved. Please select different dates.', recoveryAction: 'select_dates' },
  LISTING_UNAVAILABLE: { message: 'This property is not available for booking.', recoveryAction: 'browse_properties' },
  
  // Booking errors  
  MIN_NIGHT_MISMATCH: { message: 'This property requires a minimum stay of {minNights} nights.', recoveryAction: 'select_dates' },
  MAX_NIGHT_EXCEEDED: { message: 'This property has a maximum stay limit.', recoveryAction: 'select_dates' },
  ADVANCE_BOOKING_NOTICE: { message: 'This property requires advance booking of at least {days} days.', recoveryAction: 'select_dates' },
  WINDOW_NOT_OPEN: { message: 'Booking window is not yet open for these dates.', recoveryAction: 'select_dates' },
  
  // Guest & Pricing errors
  GUEST_COUNT_EXCEEDED: { message: 'This property can accommodate a maximum of {maxGuests} guests.', recoveryAction: 'select_guests' },
  INSUFFICIENT_GUESTS: { message: 'This property requires at least {minGuests} guests.', recoveryAction: 'select_guests' },
  PRICE_CHANGED: { message: 'The price for these dates has changed. Please refresh to see the new price.', recoveryAction: 'retry' },
  PRICING_ERROR: { message: 'Unable to calculate price. Please try different dates.', recoveryAction: 'select_dates' },
  
  // Coupon & Payment errors
  COUPON_NOT_FOUND: { message: 'The promo code entered is invalid or has expired.', recoveryAction: 'enter_code' },
  COUPON_IS_DISABLED: { message: 'This promo code is no longer active.', recoveryAction: 'enter_code' },
  COUPON_MIN_NIGHT_MISMATCH: { message: 'This promo code requires a minimum stay of {minNights} nights.', recoveryAction: 'select_dates' },
  COUPON_MAXIMUM_USES_EXCEEDED: { message: 'This promo code has reached its usage limit.', recoveryAction: 'enter_code' },
  COUPON_EXPIRATION_DATE_EXCEEDED: { message: 'This promo code has expired.', recoveryAction: 'enter_code' },
  COUPON_OUT_OF_CHECKIN_RANGE: { message: 'This promo code is not valid for your selected dates.', recoveryAction: 'select_dates' },
  PAYMENT_FAILED: { message: 'Payment processing failed. Please try again or use a different payment method.', recoveryAction: 'retry_payment' },
  PAYMENT_TOKEN_INVALID: { message: 'Payment token is invalid. Please refresh and try again.', recoveryAction: 'retry' },
  WRONG_PAYMENT_CONFIG: { message: 'Payment configuration error. Please contact support.', recoveryAction: 'contact_support' },
  
  // Request errors
  WRONG_REQUEST_PARAMETERS: { message: 'There was an issue with your booking parameters. Please refresh and try again.', recoveryAction: 'retry' },
  MISSING_REQUIRED_FIELD: { message: 'Please fill in all required fields.', recoveryAction: 'fill_form' },
  INVALID_DATE_RANGE: { message: 'Invalid date range selected.', recoveryAction: 'select_dates' },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { message: 'Too many requests. Please wait a moment and try again.', recoveryAction: 'wait_retry' },
  QUOTA_EXCEEDED: { message: 'API quota exceeded. Please try again later.', recoveryAction: 'wait_retry' },
  
  // Server errors
  INTERNAL_ERROR: { message: 'A server error occurred. Our team has been notified.', recoveryAction: 'retry' },
  SERVICE_UNAVAILABLE: { message: 'Service temporarily unavailable. Please try again later.', recoveryAction: 'wait_retry' },
  
  // Unknown
  DEFAULT: { message: 'An unexpected error occurred. Please try again.', recoveryAction: 'retry' },
  UNEXPECTED_ERROR: { message: 'An unexpected error occurred. Our team has been notified.', recoveryAction: 'retry' },
};

async function request<T>(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  const url = new URL(FN_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const opts: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
  };
  if (body && method === 'POST') opts.body = JSON.stringify(body);

  const res = await fetch(url.toString(), opts);
  
  // Parse error response
  let errorData: any = null;
  if (!res.ok) {
    try {
      errorData = await res.json();
    } catch {
      errorData = { error_code: 'UNEXPECTED_ERROR', message: `Request failed with status ${res.status}` };
    }
    
    // Add HTTP status context
    if (res.status === 401) {
      errorData.error_code = 'UNAUTHORIZED';
    } else if (res.status === 403) {
      errorData.error_code = 'FORBIDDEN';
    } else if (res.status === 429) {
      errorData.error_code = 'RATE_LIMIT_EXCEEDED';
    } else if (res.status >= 500) {
      errorData.error_code = 'INTERNAL_ERROR';
    }
    
    throw errorData;
  }
  return res.json() as Promise<T>;
}

class GuestyClient {
  public formatError(error: GuestyError): string {
    const errorInfo = ERROR_DICTIONARY[error.error_code] || ERROR_DICTIONARY['DEFAULT']!;
    
    // Try to interpolate dynamic values from error data
    let message = errorInfo.message;
    if (error.data?.errors) {
      // Add specific error details if available
      const specificError = error.data.errors[0];
      if (specificError && !message.includes(specificError)) {
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
    [key: string]: any;
  } = {}): Promise<Listing[]> {
    const qp = new URLSearchParams(params as any).toString();
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

  async createInquiry(listingId: string, inquiryData: any): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'inquiry' }, 'POST', { listingId, ...inquiryData });
  }

  async getPayoutSchedule(listingId: string, from: string, to: string): Promise<any> {
    return request<any>({ action: 'payout-schedule', id: listingId, from, to });
  }

  async getReviews(params: { listingId?: string; limit?: number; skip?: number } = {}): Promise<Review[]> {
    const qp = new URLSearchParams(params as any).toString();
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
  async getReservation(reservationId: string): Promise<any> {
    return request<any>({ action: 'open-reservation', reservationId });
  }
}

export const guestyClient = new GuestyClient();
