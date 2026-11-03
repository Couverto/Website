import { apiClient } from "./client";
import { Review } from "../types";

export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
  const { data } = await apiClient.get<Review[]>(`/reviews/restaurant/${restaurantId}`);
  return data;
};

export const replyToReview = async (reviewId: string, text: string): Promise<Review> => {
  const { data } = await apiClient.post<Review>(`/reviews/${reviewId}/reply`, { text });
  return data;
};
