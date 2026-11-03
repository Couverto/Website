import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useInfiniteClients } from "../../../src/hooks/useClientsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { useResponsive } from "../../../src/hooks/useResponsive";
import { formatShortDate } from "../../../src/utils/dateFormatter";
import { RestaurantClient } from "../../../src/types";

export default function ClientsListScreen() {
  const { activeRestaurantId } = useRestaurant();
  const { columns } = useResponsive();
  const [search, setSearch] = useState("");

  const query = useInfiniteClients(activeRestaurantId, search || undefined);
  const clients = useMemo(() => query.data?.pages.flatMap((p) => p.clients) ?? [], [query.data]);

  return (
    <ScreenContainer>
      <View className="pt-2 pb-3">
        <Text className="text-2xl font-bold text-primary mb-3">Clients</Text>
        <View className="flex-row items-center border border-border rounded-xl px-3 bg-white">
          <Feather name="search" size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un client..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-2.5 px-2 text-sm text-gray-900"
          />
        </View>
      </View>

      <FlatList
        data={clients}
        key={columns}
        numColumns={columns}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor="#173B15" />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          query.isLoading ? (
            <ActivityIndicator className="mt-10" size="large" color="#173B15" />
          ) : (
            <EmptyState icon="users" title="Aucun client" description="Aucun résultat pour cette recherche." />
          )
        }
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator className="my-4" color="#173B15" /> : null}
        renderItem={({ item }: { item: RestaurantClient }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/clients/[clientId]", params: { clientId: item._id, client: JSON.stringify(item) } })}
            className="flex-1 bg-white rounded-2xl border border-border p-4 active:opacity-70"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bold text-base text-gray-900 flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              {item.isRegistered ? (
                <View className="bg-primary/10 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-primary">Inscrit</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-muted mb-2">{item.phone}</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Feather name="calendar" size={12} color="#6b7280" />
                <Text className="text-xs text-muted font-medium">{item.totalBookings} résa.</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Feather name="users" size={12} color="#6b7280" />
                <Text className="text-xs text-muted font-medium">{item.totalGuests} pers.</Text>
              </View>
            </View>
            <Text className="text-[11px] text-muted/80 mt-1.5">Dernière visite : {formatShortDate(item.lastVisit)}</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
