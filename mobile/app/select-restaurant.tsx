import { useEffect } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as restaurantsApi from "../src/api/restaurants";
import { useRestaurant } from "../src/contexts/RestaurantContext";
import { useAuth } from "../src/contexts/AuthContext";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { EmptyState } from "../src/components/EmptyState";
import { useResponsive } from "../src/hooks/useResponsive";

export default function SelectRestaurantScreen() {
  const { signOut } = useAuth();
  const { enterRestaurant } = useRestaurant();
  const { columns } = useResponsive();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["my-restaurants"],
    queryFn: restaurantsApi.getMyRestaurants,
  });

  // Skip the picker entirely when there's only one restaurant to manage.
  useEffect(() => {
    if (restaurants?.length === 1) {
      enterRestaurant(restaurants[0]._id).then(() => router.replace("/"));
    }
  }, [restaurants, enterRestaurant]);

  if (isLoading || restaurants?.length === 1) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between pt-2 pb-4">
        <Text className="text-2xl font-bold text-primary">Vos restaurants</Text>
        <Pressable onPress={signOut} hitSlop={8} className="flex-row items-center gap-1.5">
          <Feather name="log-out" size={16} color="#6b7280" />
          <Text className="text-muted text-sm font-medium">Déconnexion</Text>
        </Pressable>
      </View>

      <FlatList
        data={restaurants ?? []}
        key={columns}
        numColumns={columns}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyState
            icon="home"
            title="Aucun restaurant"
            description="Vous n'êtes collaborateur d'aucun restaurant pour le moment."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              await enterRestaurant(item._id);
              router.replace("/");
            }}
            className="flex-1 bg-white rounded-2xl border border-border overflow-hidden active:opacity-70"
          >
            <View className="h-24 bg-primary/10">
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-3xl">🍽️</Text>
                </View>
              )}
            </View>
            <View className="p-4">
              <Text className="font-bold text-base text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>
                {item.city}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-2">
                <View className={`w-2 h-2 rounded-full ${item.isOpenNow ? "bg-accent" : "bg-gray-300"}`} />
                <Text className="text-xs font-medium text-muted">{item.isOpenNow ? "Ouvert" : "Fermé"}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
