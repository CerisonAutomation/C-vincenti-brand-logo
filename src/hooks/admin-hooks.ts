import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestyAdminClient } from '../lib/guesty/adminClient';

/**
 * Hook for fetching admin quotes data
 * @param {Object} params - Optional parameters for filtering quotes
 * @returns Query result with quotes data and loading state
 */
export const useAdminQuotes = (params = {}) => {
  return useQuery({
    queryKey: ['admin-quotes', params],
    queryFn: () => guestyAdminClient.getGlobalReservations({ ...params, status: 'quoted' }),
    staleTime: 2 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

/**
 * Hook for fetching admin reservations data
 * @param {Object} params - Optional parameters for filtering reservations
 * @returns Query result with reservations data and loading state
 */
export const useAdminReservations = (params = {}) => {
  return useQuery({
    queryKey: ['admin-reservations', params],
    queryFn: () => guestyAdminClient.getGlobalReservations({ ...params, status: 'confirmed' }),
    staleTime: 2 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

/**
 * Hook for fetching admin listings data
 * @returns Query result with listings data and loading state
 */
export const useAdminListings = () => {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => guestyAdminClient.getListings(),
    staleTime: 60 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

/**
 * Hook for confirming a reservation
 * @returns Mutation function for confirming reservations
 */
export const useConfirmReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => guestyAdminClient.confirmReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
  });
};

/**
 * Hook for rejecting a reservation
 * @returns Mutation function for rejecting reservations
 */
export const useRejectReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => guestyAdminClient.rejectReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
    },
  });
};

/**
 * Hook for sending messages to guests
 * @returns Mutation function for sending guest messages
 */
export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({ reservationId, message }: { reservationId: string; message: string }) =>
      guestyAdminClient.sendMessage(reservationId, message),
  });
};
