import { useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../src/contexts/RestaurantContext";
import { useDashboardStats, useUpdateBookingStatus } from "../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { BookingCard } from "../../src/components/BookingCard";
import { EmptyState } from "../../src/components/EmptyState";
import { useResponsive } from "../../src/hooks/useResponsive";
import { BookingStatus } from "../../src/types";

interface StatCardProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ icon, label, value, sublabel }: Readonly<StatCardProps>) {
  return (
    <View className="flex-1 bg-white rounded-2xl border border-primary/10 p-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-bold text-muted uppercase tracking-wide">{label}</Text>
        <Feather name={icon} size={16} color="#173B15" />
      </View>
      <Text className="text-2xl font-black text-primary">{value}</Text>
      {sublabel ? <Text className="text-xs text-muted mt-0.5">{sublabel}</Text> : null}
    </View>
  );
}

export default function DashboardScreen() {
  const { activeRestaurantId, restaurant } = useRestaurant();
  const { columns } = useResponsive();
  const todayStr = new Date().toISOString().split("T")[0];
  const { data, isLoading, isFetching, refetch } = useDashboardStats(activeRestaurantId, todayStr);
  const updateStatus = useUpdateBookingStatus(activeRestaurantId);

  const todayBookings = useMemo(() => {
    const list = data?.dayBookings ?? [];
    return list.filter((b) => !b.isDismissedByRestaurant && b.bookingDate.startsWith(todayStr));
  }, [data, todayStr]);

  const totalGuestsToday = useMemo(() => todayBookings.reduce((acc, b) => acc + b.guests, 0), [todayBookings]);
  const capacity = restaurant?.capacity ?? 0;
  const availableCovers = Math.max(0, capacity - totalGuestsToday);

  if (isLoading) {
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
      <FlatList
        data={todayBookings}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#173B15" />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-primary">Tableau de bord</Text>
            <Text className="text-muted text-sm mt-0.5">{restaurant?.name}</Text>

            <View className={`flex-row gap-3 mt-4 ${columns === 1 ? "flex-wrap" : ""}`}>
              <StatCard icon="calendar" label="Aujourd'hui" value={String(todayBookings.length)} sublabel={`${totalGuestsToday} couvert(s)`} />
              <StatCard
                icon="layout"
                label="Disponibles"
                value={capacity > 0 ? String(availableCovers) : "—"}
                sublabel={capacity > 0 ? `sur ${capacity}` : "Capacité non définie"}
              />
              <StatCard icon="user-plus" label="Clients" value={String(data?.stats?.totalClients ?? 0)} />
            </View>

            <Text className="text-base font-bold text-gray-900 mt-6 mb-2">Réservations du jour</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="calendar" title="Aucune réservation" description="Rien de prévu pour aujourd'hui." />}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push({ pathname: "/bookings/[bookingId]", params: { bookingId: item._id, booking: JSON.stringify(item) } })}
            onConfirm={() => updateStatus.mutate({ bookingId: item._id, status: BookingStatus.CONFIRMED })}
            onRefuse={() => updateStatus.mutate({ bookingId: item._id, status: BookingStatus.CANCELLED })}
            isUpdating={updateStatus.isPending && updateStatus.variables?.bookingId === item._id}
          />
        )}
      />
    </ScreenContainer>
  );
}
