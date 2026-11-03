import { apiClient } from "./client";
import { Booking, BookingsResponse, ClientsResponse, BookingStatus } from "../types";

export interface GetBookingsParams {
  page?: number;
  size?: number;
  status?: BookingStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getRestaurantBookings = async (restaurantId: string, params: GetBookingsParams = {}): Promise<BookingsResponse> => {
  const { data } = await apiClient.get<BookingsResponse>(`/bookings/restaurant/${restaurantId}`, { params });
  return data;
};

export const getRestaurantClients = async (
  restaurantId: string,
  params: { page?: number; size?: number; search?: string } = {},
): Promise<ClientsResponse> => {
  const { data } = await apiClient.get<ClientsResponse>(`/bookings/restaurant/${restaurantId}/clients`, { params });
  return data;
};

export const updateBookingStatus = async (
  restaurantId: string,
  bookingId: string,
  status: BookingStatus,
  reason?: string,
): Promise<Booking> => {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/restaurant/${restaurantId}/${bookingId}/status`, {
    status,
    reason,
  });
  return data.booking;
};

export const dismissBooking = async (restaurantId: string, bookingId: string): Promise<Booking> => {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/restaurant/${restaurantId}/${bookingId}/dismiss`);
  return data.booking;
};

export const updateBookingTable = async (
  restaurantId: string,
  bookingId: string,
  tableId: string,
  zoneId: string,
): Promise<Booking> => {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/restaurant/${restaurantId}/${bookingId}/table`, {
    tableId,
    zoneId,
  });
  return data.booking;
};
