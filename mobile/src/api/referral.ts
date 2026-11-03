import { apiClient } from "./client";
import { ReferralInfo } from "../types";

export const getReferralInfo = async (restaurantId: string): Promise<ReferralInfo> => {
  const { data } = await apiClient.get<ReferralInfo>(`/referral/restaurant/${restaurantId}`);
  return data;
};

export const toggleReferralCode = async (restaurantId: string): Promise<void> => {
  await apiClient.patch(`/referral/restaurant/${restaurantId}/toggle`);
};
