import { apiClient } from "./client";
import { Restaurant, RestaurantDetailsResponse, DashboardStatsResponse, DaySchedule } from "../types";

export interface UpdateRestaurantSettingsPayload {
  name?: string;
  description?: string;
  phone?: string;
  adress?: string;
  city?: string;
  website?: string;
  priceRange?: string;
  openingHours?: Record<string, DaySchedule>;
  exceptionalClosures?: { startDate: string; endDate: string; reason?: string }[];
}

export const getMyRestaurants = async (): Promise<Restaurant[]> => {
  const { data } = await apiClient.get<{ restaurants: Restaurant[] }>("/restaurants/my");
  return data.restaurants;
};

export const getRestaurantDetails = async (restaurantId: string): Promise<RestaurantDetailsResponse> => {
  const { data } = await apiClient.get<RestaurantDetailsResponse>(`/restaurants/${restaurantId}/details`);
  return data;
};

export const getRestaurantStats = async (restaurantId: string, date?: string): Promise<DashboardStatsResponse> => {
  const { data } = await apiClient.get<DashboardStatsResponse>(`/restaurants/${restaurantId}/stats`, {
    params: date ? { date } : undefined,
  });
  return data;
};

export const updateRestaurantSettings = async (
  restaurantId: string,
  payload: UpdateRestaurantSettingsPayload,
): Promise<Restaurant> => {
  const { data } = await apiClient.put<{ restaurant: Restaurant }>(`/restaurants/${restaurantId}/settings`, payload);
  return data.restaurant;
};

export const toggleRestaurantClosed = async (restaurantId: string): Promise<Restaurant> => {
  const { data } = await apiClient.patch<{ restaurant: Restaurant }>(`/restaurants/${restaurantId}/toggle-closed`);
  return data.restaurant;
};
