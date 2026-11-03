import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookingsApi from "../api/bookings";
import * as restaurantsApi from "../api/restaurants";
import { BookingStatus } from "../types";

const PAGE_SIZE = 20;

export function useBookings(restaurantId: string | null, params: bookingsApi.GetBookingsParams) {
  return useQuery({
    queryKey: ["bookings", restaurantId, params],
    queryFn: () => bookingsApi.getRestaurantBookings(restaurantId as string, params),
    enabled: !!restaurantId,
  });
}

export function useInfiniteBookings(restaurantId: string | null, filters: { status?: BookingStatus; search?: string }) {
  return useInfiniteQuery({
    queryKey: ["bookings", restaurantId, filters],
    queryFn: ({ pageParam }) =>
      bookingsApi.getRestaurantBookings(restaurantId as string, { ...filters, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: !!restaurantId,
  });
}

export function useDashboardStats(restaurantId: string | null, date?: string) {
  return useQuery({
    queryKey: ["dashboard-stats", restaurantId, date],
    queryFn: () => restaurantsApi.getRestaurantStats(restaurantId as string, date),
    enabled: !!restaurantId,
  });
}

function useInvalidateBookingQueries(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["bookings", restaurantId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats", restaurantId] });
    queryClient.invalidateQueries({ queryKey: ["clients", restaurantId] });
  };
}

export function useUpdateBookingStatus(restaurantId: string | null) {
  const invalidate = useInvalidateBookingQueries(restaurantId);
  return useMutation({
    mutationFn: ({ bookingId, status, reason }: { bookingId: string; status: BookingStatus; reason?: string }) =>
      bookingsApi.updateBookingStatus(restaurantId as string, bookingId, status, reason),
    onSuccess: invalidate,
  });
}

export function useDismissBooking(restaurantId: string | null) {
  const invalidate = useInvalidateBookingQueries(restaurantId);
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.dismissBooking(restaurantId as string, bookingId),
    onSuccess: invalidate,
  });
}

export function useUpdateBookingTable(restaurantId: string | null) {
  const invalidate = useInvalidateBookingQueries(restaurantId);
  return useMutation({
    mutationFn: ({ bookingId, tableId, zoneId }: { bookingId: string; tableId: string; zoneId: string }) =>
      bookingsApi.updateBookingTable(restaurantId as string, bookingId, tableId, zoneId),
    onSuccess: invalidate,
  });
}
