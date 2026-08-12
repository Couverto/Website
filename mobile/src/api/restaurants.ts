import { apiClient } from "./client";
import { Restaurant, RestaurantDetailsResponse, DashboardStatsResponse } from "../types";

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
