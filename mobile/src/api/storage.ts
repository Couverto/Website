import * as SecureStore from "expo-secure-store";

// expo-secure-store keys must match /^[A-Za-z0-9._-]+$/
const ACCESS_TOKEN_KEY = "accessToken";
const ACTIVE_RESTAURANT_KEY = "activeRestaurantId";

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
};

export const activeRestaurantStorage = {
  get: () => SecureStore.getItemAsync(ACTIVE_RESTAURANT_KEY),
  set: (restaurantId: string) => SecureStore.setItemAsync(ACTIVE_RESTAURANT_KEY, restaurantId),
  clear: () => SecureStore.deleteItemAsync(ACTIVE_RESTAURANT_KEY),
};
