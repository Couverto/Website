import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useDashboardStats, useUpdateBookingTable } from "../../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { Booking, BookingStatus, RestaurantTable } from "../../../src/types";
import { formatBookingTime } from "../../../src/utils/dateFormatter";

export default function TablePlanScreen() {
  const { activeRestaurantId, restaurant } = useRestaurant();
  const { data, isLoading, isRefetching, refetch } = useDashboardStats(activeRestaurantId);
  const updateTable = useUpdateBookingTable(activeRestaurantId);
  const [assignTarget, setAssignTarget] = useState<{ table: RestaurantTable; zoneId: string } | null>(null);

  const occupiedByTable = useMemo(() => {
    const map = new Map<string, Booking>();
    (data?.activeBookings ?? []).forEach((b) => {
      if (b.tableId) map.set(b.tableId, b);
    });
    return map;
  }, [data]);

  const unassignedBookings = useMemo(() => {
    return (data?.dayBookings ?? []).filter(
      (b) => !b.tableId && !b.isDismissedByRestaurant && (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED),
    );
  }, [data]);

  const handleTablePress = (table: RestaurantTable, zoneId: string) => {
    const booking = occupiedByTable.get(table.id);
    if (booking) {
      router.push({ pathname: "/bookings/[bookingId]", params: { bookingId: booking._id, booking: JSON.stringify(booking) } });
      return;
    }
    if (table.status === "reserved") {
      Alert.alert("Table bloquée", "Cette table est marquée indisponible.");
      return;
    }
    if (unassignedBookings.length === 0) {
      Alert.alert("Table libre", "Aucune réservation en attente d'affectation aujourd'hui.");
      return;
    }
    setAssignTarget({ table, zoneId });
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  if (!restaurant?.zones?.length) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <EmptyState icon="grid" title="Aucun plan de salle" description="Configurez vos zones et tables depuis le site web." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <View className="flex-row items-center gap-4 mb-4">
          <View className="flex-row items-center gap-1.5">
            <View className="w-3 h-3 rounded-full bg-accent" />
            <Text className="text-xs font-medium text-muted">Libre</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3 h-3 rounded-full bg-danger" />
            <Text className="text-xs font-medium text-muted">Occupée</Text>
          </View>
          <Pressable onPress={() => refetch()} className="ml-auto flex-row items-center gap-1.5" disabled={isRefetching}>
            {isRefetching ? <ActivityIndicator size="small" color="#173B15" /> : <Feather name="refresh-cw" size={14} color="#173B15" />}
            <Text className="text-primary text-xs font-bold">Actualiser</Text>
          </Pressable>
        </View>

        {restaurant.zones.map((zone) => (
          <View key={zone.id} className="mb-5">
            <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">{zone.name}</Text>
            <View className="flex-row flex-wrap gap-2">
              {zone.tables.map((table) => {
                const booking = occupiedByTable.get(table.id);
                const isBlocked = table.status === "reserved";
                const isOccupied = !!booking || isBlocked;
                return (
                  <Pressable
                    key={table.id}
                    onPress={() => handleTablePress(table, zone.id)}
                    className={`rounded-xl border px-3.5 py-2.5 min-w-[92px] ${
                      isOccupied ? "bg-red-50 border-danger/30" : "bg-success-bg border-success/20"
                    }`}
                  >
                    <Text className={`text-sm font-black ${isOccupied ? "text-danger" : "text-success"}`}>{table.label}</Text>
                    <Text className="text-[10px] text-muted font-medium mt-0.5">{table.seats} pers.</Text>
                    {booking ? (
                      <>
                        <Text className="text-[11px] font-bold text-gray-800 mt-1" numberOfLines={1}>
                          {booking.customer.name}
                        </Text>
                        <Text className="text-[10px] text-muted">{formatBookingTime(booking.bookingDate)}</Text>
                      </>
                    ) : isBlocked ? (
                      <Text className="text-[10px] text-danger font-bold mt-1">Bloquée</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!assignTarget} animationType="slide" transparent onRequestClose={() => setAssignTarget(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setAssignTarget(null)}>
          <Pressable className="bg-white rounded-t-3xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
            <View className="px-5 pt-5 pb-3 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Assigner à {assignTarget?.table.label} ({assignTarget?.table.seats} pers.)
              </Text>
              <Pressable onPress={() => setAssignTarget(null)} hitSlop={8}>
                <Feather name="x" size={20} color="#6b7280" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
              {unassignedBookings.map((booking) => (
                <Pressable
                  key={booking._id}
                  disabled={updateTable.isPending}
                  onPress={() => {
                    if (!assignTarget) return;
                    updateTable.mutate(
                      { bookingId: booking._id, tableId: assignTarget.table.id, zoneId: assignTarget.zoneId },
                      { onSuccess: () => setAssignTarget(null) },
                    );
                  }}
                  className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
                >
                  <View>
                    <Text className="font-bold text-sm text-gray-900">{booking.customer.name}</Text>
                    <Text className="text-xs text-muted mt-0.5">{formatBookingTime(booking.bookingDate)}</Text>
                  </View>
                  <Text className="text-sm font-bold text-primary">{booking.guests} pers.</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
