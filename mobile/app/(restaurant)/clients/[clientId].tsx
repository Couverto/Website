import { useMemo } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useBookings } from "../../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookingCard } from "../../../src/components/BookingCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { RestaurantClient } from "../../../src/types";
import { formatShortDate } from "../../../src/utils/dateFormatter";

function StatPill({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View className="flex-1 bg-white rounded-xl border border-border py-3 items-center">
      <Text className="text-lg font-black text-primary">{value}</Text>
      <Text className="text-[10px] font-bold text-muted uppercase mt-0.5">{label}</Text>
    </View>
  );
}

export default function ClientDetailScreen() {
  const { client: clientParam } = useLocalSearchParams<{ clientId: string; client?: string }>();
  const { activeRestaurantId } = useRestaurant();

  const client: RestaurantClient | undefined = useMemo(() => {
    if (!clientParam) return undefined;
    try {
      return JSON.parse(clientParam) as RestaurantClient;
    } catch {
      return undefined;
    }
  }, [clientParam]);

  // No dedicated "bookings for this client" endpoint — reuse the restaurant booking
  // search, which already matches on customer phone (see getRestaurantBookings).
  const historyQuery = useBookings(activeRestaurantId, { search: client?.phone, size: 50 });

  if (!client) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <EmptyState icon="alert-circle" title="Client introuvable" description="Retournez à la liste et réessayez." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <FlatList
        data={historyQuery.data?.bookings ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900">{client.name}</Text>
            <Text className="text-sm text-muted mt-0.5">
              Client depuis le {formatShortDate(client.firstVisit)} {client.isRegistered ? "· Compte inscrit" : "· Invité"}
            </Text>

            <View className="flex-row gap-3 mt-4">
              <StatPill label="Réservations" value={String(client.totalBookings)} />
              <StatPill label="Couverts" value={String(client.totalGuests)} />
            </View>

            <View className="flex-row gap-3 mt-3">
              {client.phone ? (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${client.phone}`)}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-3 active:opacity-70"
                >
                  <Feather name="phone-call" size={15} color="#173B15" />
                  <Text className="text-primary font-bold text-sm">Appeler</Text>
                </Pressable>
              ) : null}
              {client.email ? (
                <Pressable
                  onPress={() => Linking.openURL(`mailto:${client.email}`)}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-3 active:opacity-70"
                >
                  <Feather name="mail" size={15} color="#173B15" />
                  <Text className="text-primary font-bold text-sm">Email</Text>
                </Pressable>
              ) : null}
            </View>

            <Text className="text-base font-bold text-gray-900 mt-6 mb-2">Historique des réservations</Text>
          </View>
        }
        ListEmptyComponent={
          historyQuery.isLoading ? (
            <ActivityIndicator className="mt-6" color="#173B15" />
          ) : (
            <EmptyState icon="calendar" title="Aucun historique" />
          )
        }
        renderItem={({ item }) => <BookingCard booking={item} />}
      />
    </ScreenContainer>
  );
}
