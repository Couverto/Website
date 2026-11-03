import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as paymentsApi from "../api/payments";
import * as plansApi from "../api/plans";

export function useSubscription(restaurantId: string | null) {
  return useQuery({
    queryKey: ["subscription", restaurantId],
    queryFn: () => paymentsApi.getSubscription(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useRestaurantPayments(restaurantId: string | null) {
  return useQuery({
    queryKey: ["payments", restaurantId],
    queryFn: () => paymentsApi.getRestaurantPayments(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function usePublicPlans() {
  return useQuery({ queryKey: ["public-plans"], queryFn: plansApi.getPublicPlans });
}

function useInvalidateSubscription(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["subscription", restaurantId] });
    queryClient.invalidateQueries({ queryKey: ["restaurant-details", restaurantId] });
  };
}

export function useUpdateSubscription(restaurantId: string | null) {
  const invalidate = useInvalidateSubscription(restaurantId);
  return useMutation({
    mutationFn: (payload: { planId?: string; autoRenew?: boolean }) => paymentsApi.updateSubscription(restaurantId as string, payload),
    onSuccess: invalidate,
  });
}

export function useCancelSubscription(restaurantId: string | null) {
  const invalidate = useInvalidateSubscription(restaurantId);
  return useMutation({
    mutationFn: () => paymentsApi.cancelSubscription(restaurantId as string),
    onSuccess: invalidate,
  });
}
