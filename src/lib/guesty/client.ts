import type {
  AuthResponse, Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee, MetasearchConfig,
  GuestyError, PayoutReconciliation, ReservationResponse
} from './types';

const BASE_URL = import.meta.env.VITE_GUESTY_BASE_URL || 'https://booking.guesty.com/api/v1';
const CLIENT_ID = import.meta.env.VITE_GUESTY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GUESTY_CLIENT_SECRET;

class GuestyClient {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'booking_engine',
      }),
    });

    if (!response.ok) throw new Error('Failed to authenticate with Guesty');

    const data = await response.json() as AuthResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        if (retries > 0) {
          await this.sleep(backoff);
          return this.request(endpoint, options, retries - 1, backoff * 2);
        }
        throw new Error('GUESTY_RATE_LIMIT_EXCEEDED');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error_code: 'UNEXPECTED_ERROR',
          message: 'API Request failed',
        })) as GuestyError;

        if (response.status >= 500 && retries > 0) {
          await this.sleep(backoff);
          return this.request(endpoint, options, retries - 1, backoff * 2);
        }

        throw error;
      }

      return (await response.json()) as T;
    } catch (err) {
      if (retries > 0 && !(err as any).error_code) {
        await this.sleep(backoff);
        return this.request(endpoint, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  }

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
    const queryParams = new URLSearchParams({
      fields: 'bedArrangements,publishedAddress,taxes',
      ...params,
    } as any).toString();
    return this.request<Listing[]>(`/me/listings?${queryParams}`);
  }

  async getListing(id: string): Promise<Listing> {
    return this.request<Listing>(`/me/listings/${id}`);
  }

  async getCities(): Promise<City[]> {
    return this.request<City[]>('/me/listings/cities');
  }

  async getListingCalendar(listingId: string, from: string, to: string): Promise<CalendarDay[]> {
    return this.request<CalendarDay[]>(`/me/listings/${listingId}/calendar?from=${from}&to=${to}`);
  }

  async createQuote(params: QuoteRequest): Promise<Quote> {
    const body = { ...params, coupons: params.coupons?.join(',') };
    return this.request<Quote>('/reservations/quotes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateCouponInQuote(quoteId: string, coupon: string): Promise<Quote> {
    return this.request<Quote>(`/reservations/quotes/${quoteId}/coupons`, {
      method: 'POST',
      body: JSON.stringify({ coupon }),
    });
  }

  async createInstantReservation(quoteId: string, guestData: any): Promise<ReservationResponse> {
    return this.request<ReservationResponse>(`/reservations/quotes/${quoteId}/instant-booking`, {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  }

  async createInquiry(listingId: string, inquiryData: any): Promise<ReservationResponse> {
    return this.request<ReservationResponse>('/me/reservations/inquiry', {
      method: 'POST',
      body: JSON.stringify({ listingId, ...inquiryData }),
    });
  }

  async getPayoutSchedule(listingId: string, from: string, to: string): Promise<any> {
    return this.request<any>(`/me/listings/${listingId}/payouts-schedule?checkin=${from}&checkout=${to}`);
  }

  async getReviews(params: { listingId?: string; limit?: number; skip?: number } = {}): Promise<Review[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Review[]>(`/me/reviews${query ? `?${query}` : ''}`);
  }

  async getUpsellFees(listingId: string): Promise<UpsellFee[]> {
    return this.request<UpsellFee[]>(`/me/listings/${listingId}/upsell-fees`);
  }

  async getPayoutReconciliation(params: { startDate?: string; endDate?: string; payoutId?: string } = {}): Promise<PayoutReconciliation[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PayoutReconciliation[]>(`/payment-transactions/reports/payouts-reconciliation${query ? `?${query}` : ''}`);
  }

  async getMetasearchConfig(): Promise<MetasearchConfig[]> {
    return this.request<MetasearchConfig[]>('/me/metasearch');
  }

  async getPaymentProvider(listingId: string): Promise<PaymentProvider> {
    return this.request<PaymentProvider>(`/me/listings/${listingId}/payment-provider`);
  }
}

export const guestyClient = new GuestyClient();
