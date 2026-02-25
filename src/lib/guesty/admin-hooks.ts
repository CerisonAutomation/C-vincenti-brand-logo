import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestyAdminClient } from './adminClient';

export const useAdminQuotes = (params = {}) => {
  return useQuery({
    queryKey: ['admin-quotes', params],
    queryFn: () => guestyAdminClient.getGlobalReservations({ ...params, status: 'quoted' }),
    staleTime: 2 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

export const useAdminReservations = (params = {}) => {
  return useQuery({
    queryKey: ['admin-reservations', params],
    queryFn: () => guestyAdminClient.getGlobalReservations({ ...params, status: 'confirmed' }),
    staleTime: 2 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

export const useAdminListings = () => {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => guestyAdminClient.getListings(),
    staleTime: 60 * 60 * 1000,
    enabled: !!import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID,
  });
};

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

export const useRejectReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => guestyAdminClient.rejectReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({ reservationId, message }: { reservationId: string; message: string }) =>
      guestyAdminClient.sendMessage(reservationId, message),
  });
};
