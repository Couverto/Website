import { apiClient } from "./client";
import { Payment, SubscriptionInfo } from "../types";

export const getSubscription = async (restaurantId: string): Promise<SubscriptionInfo> => {
  const { data } = await apiClient.get<SubscriptionInfo>(`/restaurants/${restaurantId}/subscription`);
  return data;
};

export const getRestaurantPayments = async (restaurantId: string): Promise<Payment[]> => {
  const { data } = await apiClient.get<{ payments: Payment[] }>(`/restaurants/${restaurantId}/payments`);
  return data.payments;
};

export const updateSubscription = async (
  restaurantId: string,
  payload: { planId?: string; autoRenew?: boolean },
): Promise<void> => {
  await apiClient.put(`/restaurants/${restaurantId}/subscription`, payload);
};

export const cancelSubscription = async (restaurantId: string): Promise<void> => {
  await apiClient.delete(`/restaurants/${restaurantId}/subscription`);
};
