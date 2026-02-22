import { supabase } from '@/integrations/supabase/client';
import type {
  Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee,
  GuestyError, ReservationResponse
} from './types';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/guesty-proxy`;

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
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error_code: 'UNEXPECTED_ERROR', message: 'Request failed' }));
    throw err;
  }
  return res.json() as Promise<T>;
}

class GuestyClient {
  public formatError(error: GuestyError): string {
    const dictionary: Record<string, string> = {
      MIN_NIGHT_MISMATCH: 'This property requires a longer stay. Please check the minimum night requirement.',
      LISTING_CALENDAR_BLOCKED: 'These dates are already reserved. Please try a different range.',
      COUPON_NOT_FOUND: 'The promo code entered is invalid or has expired.',
      WRONG_REQUEST_PARAMETERS: 'There was an issue with the booking parameters. Please refresh and try again.',
      FORBIDDEN: 'This listing is currently unavailable for online booking.',
      DEFAULT: 'An unexpected error occurred. Our team has been notified.',
    };
    return dictionary[error.error_code] || dictionary['DEFAULT']!;
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

  async createQuote(params: QuoteRequest): Promise<Quote> {
    const body = { ...params, coupons: params.coupons?.join(',') };
    return request<Quote>({ action: 'quote' }, 'POST', body);
  }

  async updateCouponInQuote(quoteId: string, coupon: string): Promise<Quote> {
    return request<Quote>({ action: 'quote-coupon', quoteId }, 'POST', { coupon });
  }

  async createInstantReservation(quoteId: string, guestData: any): Promise<ReservationResponse> {
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
}

export const guestyClient = new GuestyClient();
