import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as referralApi from "../api/referral";

export function useReferralInfo(restaurantId: string | null) {
  return useQuery({
    queryKey: ["referral", restaurantId],
    queryFn: () => referralApi.getReferralInfo(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useToggleReferralCode(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => referralApi.toggleReferralCode(restaurantId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["referral", restaurantId] }),
  });
}
