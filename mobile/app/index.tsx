import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useRestaurant } from "../src/contexts/RestaurantContext";

export default function Index() {
  const { user } = useAuth();
  const { activeRestaurantId, isRestaurantIdLoading } = useRestaurant();

  if (isRestaurantIdLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#173B15" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (!activeRestaurantId) return <Redirect href="/select-restaurant" />;
  return <Redirect href="/(restaurant)/dashboard" />;
}
