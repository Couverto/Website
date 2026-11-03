import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as reviewsApi from "../api/reviews";

export function useRestaurantReviews(restaurantId: string | null) {
  return useQuery({
    queryKey: ["reviews", restaurantId],
    queryFn: () => reviewsApi.getRestaurantReviews(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useReplyToReview(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) => reviewsApi.replyToReview(reviewId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", restaurantId] }),
  });
}
