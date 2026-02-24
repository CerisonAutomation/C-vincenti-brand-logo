import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestyClient } from './client';
import { guestyAdminClient } from './adminClient';
import type { QuoteRequest, RatePlan } from './types';

// ── Rate Plans (V3 Booking Flow) ─────────────────────────────────────────────

export const useRatePlans = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['ratePlans', listingId],
    queryFn: () => guestyClient.getRatePlans(listingId!),
    enabled: !!listingId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// ── Quote retrieval ────────────────────────────────────────────────────────────

export const useQuote = (quoteId: string | undefined) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => guestyClient.getQuote(quoteId!),
    enabled: !!quoteId,
  });
};

// ── Listings ──────────────────────────────────────────────────────────────────

export const useListings = (params: Parameters<typeof guestyClient.getListings>[0] = {}) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => guestyClient.getListings(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => guestyClient.getListing(id!),
    enabled: !!id,
  });
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => guestyClient.getCities(),
    staleTime: 24 * 60 * 60 * 1000,
  });
};

export const usePrefetchListing = () => {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['listing', id],
      queryFn: () => guestyClient.getListing(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// ── Calendar ──────────────────────────────────────────────────────────────────

export const useListingCalendar = (listingId: string | undefined, from: string, to: string) => {
  return useQuery({
    queryKey: ['calendar', listingId, from, to],
    queryFn: () => guestyClient.getListingCalendar(listingId!, from, to),
    enabled: !!listingId && !!from && !!to,
  });
};

// ── Quotes & Reservations ─────────────────────────────────────────────────────

export const useCreateQuote = () => {
  return useMutation({
    mutationFn: (params: QuoteRequest) => guestyClient.createQuote(params),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, coupon }: { quoteId: string; coupon: string }) =>
      guestyClient.updateCouponInQuote(quoteId, coupon),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['quote', variables.quoteId], data);
    },
  });
};

export const useCreateInstantReservation = () => {
  return useMutation({
    mutationFn: ({ quoteId, guestData }: { quoteId: string; guestData: any }) =>
      guestyClient.createInstantReservation(quoteId, guestData),
  });
};

export const useCreateInquiry = () => {
  return useMutation({
    mutationFn: ({ listingId, inquiryData }: { listingId: string; inquiryData: any }) =>
      guestyClient.createInquiry(listingId, inquiryData),
  });
};

// ── Social Proof ──────────────────────────────────────────────────────────────

export const useReviews = (params: { listingId?: string; limit?: number; skip?: number } = {}) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => guestyClient.getReviews(params),
    staleTime: 30 * 60 * 1000,
  });
};

// ── Payment & Pricing ─────────────────────────────────────────────────────────

export const usePayoutSchedule = (listingId: string | undefined, from: string, to: string) => {
  return useQuery({
    queryKey: ['payouts', listingId, from, to],
    queryFn: () => guestyClient.getPayoutSchedule(listingId!, from, to),
    enabled: !!listingId && !!from && !!to,
  });
};

export const usePaymentProvider = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['paymentProvider', listingId],
    queryFn: () => guestyClient.getPaymentProvider(listingId!),
    enabled: !!listingId,
  });
};

export const useUpsellFees = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['upsellFees', listingId],
    queryFn: () => guestyClient.getUpsellFees(listingId!),
    enabled: !!listingId,
  });
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const useAdminReservations = (params: any = {}) => {
  return useQuery({
    queryKey: ['adminReservations', params],
    queryFn: () => guestyAdminClient.getGlobalReservations(params),
    staleTime: 60 * 1000,
  });
};

export const useAdminMessages = (params: any = {}) => {
  return useQuery({
    queryKey: ['adminMessages', params],
    queryFn: () => guestyAdminClient.getMessages(params),
    staleTime: 60 * 1000,
  });
};

export const useFolioBalance = (reservationId: string | undefined) => {
  return useQuery({
    queryKey: ['folio', reservationId],
    queryFn: () => guestyAdminClient.getFolioBalance(reservationId!),
    enabled: !!reservationId,
  });
};

// ── V3 Booking Flow Hooks ─────────────────────────────────────────────────────

export const useQuoteWithRatePlan = () => {
  return useMutation({
    mutationFn: (params: QuoteRequest) => guestyClient.createQuoteWithRatePlan(params),
  });
};

export const useUpdateUpsellFees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, upsellFeeIds }: { quoteId: string; upsellFeeIds: string[] }) =>
      guestyClient.updateUpsellFeesInQuote(quoteId, upsellFeeIds),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['quote', variables.quoteId], data);
    },
  });
};
