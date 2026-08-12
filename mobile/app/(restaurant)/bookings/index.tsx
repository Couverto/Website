import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useInfiniteBookings, useUpdateBookingStatus } from "../../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookingCard } from "../../../src/components/BookingCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { BookingStatus } from "../../../src/types";

const FILTERS: { label: string; value: BookingStatus | undefined }[] = [
  { label: "Toutes", value: undefined },
  { label: "En attente", value: BookingStatus.PENDING },
  { label: "Confirmées", value: BookingStatus.CONFIRMED },
  { label: "Annulées", value: BookingStatus.CANCELLED },
];

export default function BookingsListScreen() {
  const { activeRestaurantId } = useRestaurant();
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [search, setSearch] = useState("");

  const query = useInfiniteBookings(activeRestaurantId, { status, search: search || undefined });
  const updateStatus = useUpdateBookingStatus(activeRestaurantId);

  const bookings = useMemo(() => query.data?.pages.flatMap((p) => p.bookings) ?? [], [query.data]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="pt-2 pb-3">
        <Text className="text-2xl font-bold text-primary mb-3">Réservations</Text>

        <View className="flex-row items-center border border-border rounded-xl px-3 mb-3 bg-white">
          <Feather name="search" size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un client..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-2.5 px-2 text-sm text-gray-900"
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.label}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isActive = item.value === status;
            return (
              <Pressable
                onPress={() => setStatus(item.value)}
                className={`px-3.5 py-1.5 rounded-full border ${isActive ? "bg-primary border-primary" : "bg-white border-border"}`}
              >
                <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-muted"}`}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor="#173B15" />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          query.isLoading ? (
            <ActivityIndicator className="mt-10" size="large" color="#173B15" />
          ) : (
            <EmptyState icon="calendar" title="Aucune réservation" description="Aucun résultat pour ces filtres." />
          )
        }
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator className="my-4" color="#173B15" /> : null}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push({ pathname: "/bookings/[bookingId]", params: { bookingId: item._id, booking: JSON.stringify(item) } })}
            onConfirm={
              item.status === BookingStatus.PENDING
                ? () => updateStatus.mutate({ bookingId: item._id, status: BookingStatus.CONFIRMED })
                : undefined
            }
            onRefuse={
              item.status === BookingStatus.PENDING
                ? () => updateStatus.mutate({ bookingId: item._id, status: BookingStatus.CANCELLED })
                : undefined
            }
            isUpdating={updateStatus.isPending && updateStatus.variables?.bookingId === item._id}
          />
        )}
      />
    </ScreenContainer>
  );
}
