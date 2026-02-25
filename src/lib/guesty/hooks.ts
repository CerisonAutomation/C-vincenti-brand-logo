import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import type { QuoteRequest, PropertyType, Amenity } from './types';
import { GuestyErrorHandler } from './error-handler';

// ── Quantum API Base URL ──
const API_BASE = import.meta.env.VITE_GUESTY_FN_URL;

// ── Quantum Cache Configuration ──
const QUANTUM_CACHE_CONFIG = {
  LISTINGS_TTL: 10 * 60 * 1000, // 10 minutes
  LISTING_TTL: 5 * 60 * 1000,   // 5 minutes
  QUOTE_TTL: 2 * 60 * 1000,     // 2 minutes
  CITIES_TTL: 24 * 60 * 60 * 1000, // 24 hours
  REVIEWS_TTL: 30 * 60 * 1000, // 30 minutes
  CALENDAR_TTL: 60 * 60 * 1000, // 1 hour
  PREFETCH_TTL: 10 * 60 * 1000, // 10 minutes for prefetch
};

// ── Quantum Prefetch Engine ──
class QuantumPrefetchEngine {
  private static instance: QuantumPrefetchEngine;
  private prefetchQueue = new Set<string>();
  private prefetching = new Map<string, Promise<unknown>>();
  private queryClient: QueryClient | null = null;

  static getInstance(): QuantumPrefetchEngine {
    if (!QuantumPrefetchEngine.instance) {
      QuantumPrefetchEngine.instance = new QuantumPrefetchEngine();
    }
    return QuantumPrefetchEngine.instance;
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  async prefetch(key: string[], fetchFn: () => Promise<unknown>, ttl: number = QUANTUM_CACHE_CONFIG.PREFETCH_TTL) {
    const cacheKey = JSON.stringify(key);

    if (this.prefetchQueue.has(cacheKey) || this.prefetching.has(cacheKey)) {
      return; // Already queued or prefetching
    }

    this.prefetchQueue.add(cacheKey);

    try {
      const promise = fetchFn();
      this.prefetching.set(cacheKey, promise);

      const data = await promise;

      // Cache the result
      if (this.queryClient) {
        this.queryClient.setQueryData(key, data, { updatedAt: Date.now() });
      }

      // Set cache expiry
      setTimeout(() => {
        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: key });
        }
      }, ttl);

    } catch (error) {
      console.warn('Prefetch failed:', error);
    } finally {
      this.prefetchQueue.delete(cacheKey);
      this.prefetching.delete(cacheKey);
    }
  }

  async prefetchRelatedData(listingId: string) {
    // Quantum prefetching of related data - only use existing endpoints
    const relatedPromises = [
      this.prefetch(['listing', listingId], async () => {
        try {
          const response = await fetch(`${API_BASE}/api/listings/${listingId}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        } catch (error) {
          console.warn('[QuantumPrefetch] Listing prefetch failed:', error);
          throw error;
        }
      }),

      // Reviews endpoint doesn't exist - remove this prefetch
      // Rate plans endpoint doesn't exist - remove this prefetch
    ];

    await Promise.allSettled(relatedPromises);
  }
}

// ── Quantum Performance Hooks ──

// Advanced useListings with quantum prefetching and infinite scrolling
export const useListings = (params: {
  minOccupancy?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyType?: PropertyType;
  amenities?: Amenity[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'rating' | 'popularity';
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryClient = useQueryClient();
  const prefetchEngine = QuantumPrefetchEngine.getInstance();
  prefetchEngine.setQueryClient(queryClient);

  const query = useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','));
          } else {
            searchParams.set(key, String(value));
          }
        }
      });

      const response = await fetch(`${API_BASE}/api/listings?${searchParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Prefetch': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();

      // Quantum prefetch first few listings
      if (data.listings?.length > 0) {
        setTimeout(() => {
          data.listings.slice(0, 3).forEach((listing: { _id: string }) => {
            prefetchEngine.prefetchRelatedData(listing._id);
          });
        }, 100);
      }

      return data;
    },
    staleTime: QUANTUM_CACHE_CONFIG.LISTINGS_TTL,
    gcTime: 45 * 60 * 1000, // Keep in cache 45 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Quantum retry logic with exponential backoff
    retry: (failureCount, error: Error | unknown) => {
      if (failureCount >= 3) return false;
      // Check if error is an object with status property
      if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
        if (error.status >= 400 && error.status < 500) return false;
      }
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Quantum prefetch next page
  useEffect(() => {
    if (query.data?.hasNextPage && !query.isFetching) {
      const nextPageParams = { ...params, page: (params.page || 0) + 1 };
      queryClient.prefetchQuery({
        queryKey: ['listings', nextPageParams],
        queryFn: async () => {
          const searchParams = new URLSearchParams();
          Object.entries(nextPageParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                searchParams.set(key, value.join(','));
              } else {
                searchParams.set(key, String(value));
              }
            }
          });

          const response = await fetch(`${API_BASE}/api/listings?${searchParams.toString()}`);
          return response.json();
        },
        staleTime: QUANTUM_CACHE_CONFIG.LISTINGS_TTL,
      });
    }
  }, [query.data, query.isFetching, params, queryClient]);

  return query;
};

// Infinite listings with quantum virtualization
export const useInfiniteListings = (params: {
  minOccupancy?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyType?: PropertyType;
  amenities?: Amenity[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'rating' | 'popularity';
  search?: string;
  limit?: number;
} = {}) => {
  const queryClient = useQueryClient();
  const prefetchEngine = QuantumPrefetchEngine.getInstance();
  prefetchEngine.setQueryClient(queryClient);

  return useInfiniteQuery({
    queryKey: ['infinite-listings', params],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const searchParams = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(params).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : String(value || ''),
          ])
        ),
        page: String(pageParam),
      });

      const response = await fetch(`${API_BASE}/api/listings?${searchParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Infinite': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();

      // Quantum prefetch related data
      if (data.listings?.length > 0) {
        data.listings.forEach((listing: { _id: string }) => {
          prefetchEngine.prefetchRelatedData(listing._id);
        });
      }

      return data;
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    staleTime: QUANTUM_CACHE_CONFIG.LISTINGS_TTL,
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

// Quantum optimized listing detail hook
export const useListing = (id: string | undefined) => {
  const queryClient = useQueryClient();
  const prefetchEngine = QuantumPrefetchEngine.getInstance();
  prefetchEngine.setQueryClient(queryClient);

  const query = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) throw new Error('Listing ID is required');

      const response = await fetch(`${API_BASE}/api/listings/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Optimized': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.status}`);
      }

      const data = await response.json();

      // Quantum prefetch related data
      setTimeout(() => {
        prefetchEngine.prefetchRelatedData(id);
      }, 50);

      return data;
    },
    enabled: !!id,
    staleTime: QUANTUM_CACHE_CONFIG.LISTING_TTL,
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Quantum optimistic updates
    placeholderData: (previousData) => previousData,
  });

  return query;
};

// Quantum-prefetched listing prefetch hook
export const usePrefetchListing = () => {
  const queryClient = useQueryClient();
  const prefetchEngine = QuantumPrefetchEngine.getInstance();
  prefetchEngine.setQueryClient(queryClient);

  return useCallback((id: string) => {
    prefetchEngine.prefetch(['listing', id], async () => {
      const response = await fetch(`${API_BASE}/api/listings/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Prefetch': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to prefetch listing: ${response.status}`);
      }

      return response.json();
    }, QUANTUM_CACHE_CONFIG.PREFETCH_TTL);
  }, [prefetchEngine]);
};

// Quantum calendar with predictive loading - DISABLED: Calendar endpoint not implemented
export const useListingCalendar = (listingId: string | undefined, from: string, to: string) => {
  // Return disabled query until calendar endpoint is implemented
  return useQuery({
    queryKey: ['calendar', listingId, from, to],
    queryFn: async () => {
      throw new Error('Calendar endpoint not yet implemented. Availability data should be included in listing details.');
    },
    enabled: false, // Disable this hook until endpoint exists
    staleTime: QUANTUM_CACHE_CONFIG.CALENDAR_TTL,
  });
};

// Quantum quote creation with optimistic updates and error handling
export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const errorHandler = GuestyErrorHandler.getInstance();

  return useMutation({
    mutationFn: async (params: QuoteRequest) => {
      // Quantum optimistic update
      const optimisticQuote = {
        _id: `temp-${Date.now()}`,
        ...params,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        available: true,
        status: 'creating',
      };

      // Set optimistic data
      queryClient.setQueryData(['quote', optimisticQuote._id], optimisticQuote);

      try {
        const response = await fetch(`${API_BASE}/api/quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Quantum-Optimistic': 'true',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          // Revert optimistic update on failure
          queryClient.removeQueries({ queryKey: ['quote', optimisticQuote._id] });

          const errorData = await response.json().catch(() => ({ message: 'Quote creation failed' }));

          // Parse error using Guesty error handler
          const guestyError = errorHandler.parseError({
            status: response.status,
            message: errorData.message || errorData.error,
            error: errorData.code,
            details: errorData.details,
          }, { endpoint: '/api/quote', method: 'POST' });

          errorHandler.logError(guestyError, { params });
          throw new Error(guestyError.userMessage);
        }

        const data = await response.json();

        // Update with real data
        queryClient.setQueryData(['quote', data._id], data);

        return data;
      } catch (error) {
        // Ensure optimistic data is cleaned up
        queryClient.removeQueries({ queryKey: ['quote', optimisticQuote._id] });

        // Re-throw with enhanced error handling
        if (error instanceof Error && !error.message.includes('Quote creation failed')) {
          throw error;
        }

        const guestyError = errorHandler.parseError(error, { endpoint: '/api/quote', method: 'POST' });
        errorHandler.logError(guestyError, { params });
        throw new Error(guestyError.userMessage);
      }
    },
    onSuccess: (data) => {
      // Quantum cache invalidation
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
    },
    // Enhanced retry logic with Guesty error awareness
    retry: (failureCount, error: Error | unknown) => {
      if (failureCount >= 3) return false;

      const guestyError = errorHandler.parseError(error);
      const retryConfig = errorHandler.getRetryConfig(guestyError);

      return retryConfig ? failureCount < retryConfig.maxRetries : false;
    },
    retryDelay: (attemptIndex) => {
      const baseDelay = Math.min(1000 * 2 ** attemptIndex, 10000);
      return baseDelay;
    },
  });
};

// Quantum quote retrieval with background refresh
export const useQuote = (quoteId: string | undefined) => {
  const query = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      if (!quoteId) throw new Error('Quote ID is required');

      const response = await fetch(`${API_BASE}/api/quote/${quoteId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Quote': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quote: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!quoteId,
    staleTime: QUANTUM_CACHE_CONFIG.QUOTE_TTL,
    // Quantum background refresh for expiring quotes
    refetchInterval: (quoteData: any) => {
      if (quoteData?.expiresAt) {
        const expiresAt = new Date(quoteData.expiresAt);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();

        // Refresh when quote has less than 5 minutes left
        if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
          return Math.max(timeUntilExpiry / 4, 10000); // Refresh every quarter of remaining time, min 10s
        }
      }
      return false;
    },
  });

  return query;
};

// Quantum booking creation with advanced error handling and payment integration
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const errorHandler = GuestyErrorHandler.getInstance();

  return useMutation({
    mutationFn: async (params: {
      quoteId: string;
      listingId: string;
      guest: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      };
      payment?: {
        token: string;
        method: 'stripe' | 'paypal' | 'bank_transfer';
        amount: number;
        currency: string;
      };
      message?: string;
      specialRequests?: string;
      bookingType?: 'INQUIRY' | 'INSTANT';
    }) => {
      // Validate required parameters
      if (!params.quoteId || !params.listingId || !params.guest) {
        throw new Error('Missing required booking parameters: quoteId, listingId, and guest are required');
      }

      if (!params.guest.firstName || !params.guest.lastName || !params.guest.email) {
        throw new Error('Guest information incomplete: firstName, lastName, and email are required');
      }

      // Validate payment information for instant bookings
      if (params.bookingType === 'INSTANT' && !params.payment?.token) {
        throw new Error('Payment token required for instant bookings');
      }

      const response = await fetch(`${API_BASE}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Quantum-Booking': 'true',
          'X-Idempotency-Key': `booking-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Booking creation failed' }));

        // Parse error using Guesty error handler
        const guestyError = errorHandler.parseError({
          status: response.status,
          message: errorData.message || errorData.error,
          error: errorData.code,
          details: errorData.details,
        }, {
          endpoint: '/api/book',
          method: 'POST',
          bookingType: params.bookingType,
          hasPayment: !!params.payment
        });

        errorHandler.logError(guestyError, {
          params: { ...params, payment: params.payment ? { ...params.payment, token: '[REDACTED]' } : undefined }
        });
        throw new Error(guestyError.userMessage);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data, variables) => {
      // Quantum cache updates
      queryClient.setQueryData(['booking', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });

      // Quantum prefetch booking details and confirmation
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['booking', data._id],
          queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/bookings/${data._id}`);
            return response.json();
          },
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch booking confirmation details
        queryClient.prefetchQuery({
          queryKey: ['booking-confirmation', data._id],
          queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/bookings/${data._id}/confirmation`);
            return response.json();
          },
          staleTime: 30 * 60 * 1000, // 30 minutes
        });
      }, 100);
    },
    // Enhanced error handling with recovery strategies
    onError: (error, variables) => {
      console.error('Booking creation failed:', error);

      const guestyError = errorHandler.parseError(error, {
        endpoint: '/api/book',
        method: 'POST',
        bookingType: variables.bookingType,
        hasPayment: !!variables.payment
      });

      // Implement recovery strategies based on error type
      switch (guestyError.recoveryStrategy) {
        case 'REFRESH_QUOTE':
          queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
          break;
        case 'RETRY_PAYMENT':
          if (variables.payment) {
            console.log('Payment failed, user may retry with different payment method');
          }
          break;
        case 'REFRESH_DATA':
          queryClient.invalidateQueries({ queryKey: ['listings'] });
          queryClient.invalidateQueries({ queryKey: ['quote'] });
          break;
      }

      errorHandler.logError(guestyError, {
        recoveryStrategy: guestyError.recoveryStrategy,
        bookingType: variables.bookingType
      });
    },
    // Enhanced retry logic for booking operations
    retry: (failureCount, error: Error | unknown) => {
      if (failureCount >= 2) return false; // Bookings are critical, don't retry aggressively

      const guestyError = errorHandler.parseError(error);
      const retryConfig = errorHandler.getRetryConfig(guestyError);

      // Only retry on network/server errors, not validation/payment errors
      if (guestyError.category === 'NETWORK' || guestyError.category === 'SYSTEM') {
        return retryConfig ? failureCount < retryConfig.maxRetries : false;
      }

      return false; // Don't retry validation or payment errors
    },
    retryDelay: (attemptIndex) => Math.min(2000 * attemptIndex, 10000), // Slower retry for bookings
  });
};

// Quantum cities with predictive search - DISABLED: Cities endpoint not implemented
export const useCities = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['cities', searchQuery],
    queryFn: async () => {
      throw new Error('Cities search endpoint not yet implemented. Use static city list or implement in Supabase function.');
    },
    enabled: false, // Disable until endpoint exists
    staleTime: QUANTUM_CACHE_CONFIG.CITIES_TTL,
  });
};

// Quantum reviews with lazy loading - DISABLED: Reviews endpoint not implemented
export const useReviews = (params: { listingId?: string; limit?: number; skip?: number } = {}) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      throw new Error('Reviews endpoint not yet implemented. Reviews should be included in listing details or fetched separately.');
    },
    enabled: false, // Disable until endpoint exists
    staleTime: QUANTUM_CACHE_CONFIG.REVIEWS_TTL,
  });
};

// Quantum rate plans with smart caching - DISABLED: Rate plans endpoint not implemented
export const useRatePlans = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['ratePlans', listingId],
    queryFn: async () => {
      throw new Error('Rate plans endpoint not yet implemented. Rate plans should be included in listing details.');
    },
    enabled: false, // Disable until endpoint exists
    staleTime: 30 * 60 * 1000, // 30 minutes - rate plans don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Quantum V3 booking flow hooks - DISABLED: V3 endpoints not implemented
export const useQuoteWithRatePlan = () => {
  return useMutation({
    mutationFn: async (params: QuoteRequest) => {
      throw new Error('Quote with rate plan endpoint not yet implemented. Use standard quote endpoint.');
    },
    onSuccess: () => {
      // Disabled - V3 endpoints not implemented
    },
  });
};

export const useUpdateUpsellFees = () => {
  return useMutation({
    mutationFn: async ({ quoteId, upsellFeeIds }: { quoteId: string; upsellFeeIds: string[] }) => {
      throw new Error('Update upsell fees endpoint not yet implemented. Upsell functionality not available.');
    },
    onSuccess: () => {
      // Disabled - upsell fees not implemented
    },
  });
};

// Quantum payment provider hook - DISABLED: Payment provider endpoint not implemented
export const usePaymentProvider = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['paymentProvider', listingId],
    queryFn: async () => {
      throw new Error('Payment provider endpoint not yet implemented. Payment integration needs to be added.');
    },
    enabled: false, // Disable until endpoint exists
    staleTime: 60 * 60 * 1000, // 1 hour - payment providers don't change often
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
};
