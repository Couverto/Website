import { useInfiniteQuery } from "@tanstack/react-query";
import * as bookingsApi from "../api/bookings";

const PAGE_SIZE = 20;

export function useInfiniteClients(restaurantId: string | null, search?: string) {
  return useInfiniteQuery({
    queryKey: ["clients", restaurantId, search],
    queryFn: ({ pageParam }) => bookingsApi.getRestaurantClients(restaurantId as string, { page: pageParam, size: PAGE_SIZE, search }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: !!restaurantId,
  });
}
