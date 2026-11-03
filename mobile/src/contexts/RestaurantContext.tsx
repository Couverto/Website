import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as restaurantsApi from "../api/restaurants";
import { activeRestaurantStorage } from "../api/storage";
import { Restaurant, RestaurantRole } from "../types";
import { useAuth } from "./AuthContext";

interface RestaurantContextValue {
  activeRestaurantId: string | null;
  isRestaurantIdLoading: boolean;
  restaurant: Restaurant | undefined;
  userRole: RestaurantRole | undefined;
  availablePages: string[];
  isLoading: boolean;
  isError: boolean;
  enterRestaurant: (restaurantId: string) => Promise<void>;
  exitRestaurant: () => Promise<void>;
  refetchRestaurant: () => Promise<unknown>;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const useRestaurant = (): RestaurantContextValue => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within a RestaurantProvider");
  return ctx;
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [isRestaurantIdLoading, setIsRestaurantIdLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await activeRestaurantStorage.get();
      setActiveRestaurantId(stored);
      setIsRestaurantIdLoading(false);
    })();
  }, []);

  // Clear the active restaurant whenever the user logs out.
  useEffect(() => {
    if (!user) setActiveRestaurantId(null);
  }, [user]);

  const detailsQuery = useQuery({
    queryKey: ["restaurant-details", activeRestaurantId],
    queryFn: () => restaurantsApi.getRestaurantDetails(activeRestaurantId as string),
    enabled: !!user && !!activeRestaurantId,
  });

  const enterRestaurant = useCallback(async (restaurantId: string) => {
    await activeRestaurantStorage.set(restaurantId);
    setActiveRestaurantId(restaurantId);
  }, []);

  const exitRestaurant = useCallback(async () => {
    await activeRestaurantStorage.clear();
    setActiveRestaurantId(null);
    queryClient.removeQueries({ queryKey: ["restaurant-details"] });
  }, [queryClient]);

  const value = useMemo<RestaurantContextValue>(
    () => ({
      activeRestaurantId,
      isRestaurantIdLoading,
      restaurant: detailsQuery.data?.restaurant,
      userRole: detailsQuery.data?.userRole,
      availablePages: detailsQuery.data?.availablePages ?? [],
      isLoading: detailsQuery.isLoading,
      isError: detailsQuery.isError,
      enterRestaurant,
      exitRestaurant,
      refetchRestaurant: detailsQuery.refetch,
    }),
    [activeRestaurantId, isRestaurantIdLoading, detailsQuery, enterRestaurant, exitRestaurant],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};
