import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as restaurantsApi from "../api/restaurants";

function useInvalidateRestaurant(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["restaurant-details", restaurantId] });
}

export function useUpdateRestaurantSettings(restaurantId: string | null) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: (payload: restaurantsApi.UpdateRestaurantSettingsPayload) =>
      restaurantsApi.updateRestaurantSettings(restaurantId as string, payload),
    onSuccess: invalidate,
  });
}

export function useToggleRestaurantClosed(restaurantId: string | null) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: () => restaurantsApi.toggleRestaurantClosed(restaurantId as string),
    onSuccess: invalidate,
  });
}
