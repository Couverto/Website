import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useDismissBooking, useUpdateBookingStatus, useUpdateBookingTable } from "../../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { StatusBadge } from "../../../src/components/StatusBadge";
import { EmptyState } from "../../../src/components/EmptyState";
import { Booking, BookingStatus } from "../../../src/types";
import { formatBookingDate, formatBookingTime } from "../../../src/utils/dateFormatter";

function InfoRow({ icon, label, value }: Readonly<{ icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string }>) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-border/60 last:border-b-0">
      <View className="flex-row items-center gap-2">
        <Feather name={icon} size={15} color="#6b7280" />
        <Text className="text-sm text-muted font-medium">{label}</Text>
      </View>
      <Text className="text-sm font-bold text-gray-900">{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { bookingId, booking: bookingParam } = useLocalSearchParams<{ bookingId: string; booking?: string }>();
  const { activeRestaurantId, restaurant } = useRestaurant();
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  const updateStatus = useUpdateBookingStatus(activeRestaurantId);
  const updateTable = useUpdateBookingTable(activeRestaurantId);
  const dismissBooking = useDismissBooking(activeRestaurantId);

  // There's no collaborator-scoped "get booking by id" endpoint server-side (GET /bookings/:id is
  // customer-owner scoped only), so the list screen passes the booking payload it already fetched.
  const booking: Booking | undefined = useMemo(() => {
    if (!bookingParam) return undefined;
    try {
      return JSON.parse(bookingParam) as Booking;
    } catch {
      return undefined;
    }
  }, [bookingParam]);

  if (!booking) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <EmptyState icon="alert-circle" title="Réservation introuvable" description="Retournez à la liste et réessayez." />
      </ScreenContainer>
    );
  }

  const isPending = booking.status === BookingStatus.PENDING;
  const isConfirmed = booking.status === BookingStatus.CONFIRMED;
  const isCancelled = booking.status === BookingStatus.CANCELLED;

  const confirmCancel = () => {
    Alert.alert("Confirmer l'annulation ?", "Le client recevra une notification d'annulation.", [
      { text: "Retour", style: "cancel" },
      {
        text: isPending ? "Refuser" : "Annuler",
        style: "destructive",
        onPress: () => updateStatus.mutate({ bookingId: booking._id, status: BookingStatus.CANCELLED }),
      },
    ]);
  };

  const confirmDismiss = () => {
    Alert.alert("Masquer cette réservation ?", "Elle disparaîtra du tableau de bord (la table redevient libre).", [
      { text: "Annuler", style: "cancel" },
      { text: "Masquer", onPress: () => dismissBooking.mutate(booking._id, { onSuccess: () => router.back() }) },
    ]);
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900 flex-1" numberOfLines={1}>
            {booking.customer.name}
          </Text>
          <StatusBadge status={booking.status} />
        </View>

        <View className="bg-white rounded-2xl border border-border px-4">
          <InfoRow icon="calendar" label="Date" value={formatBookingDate(booking.bookingDate)} />
          <InfoRow icon="clock" label="Heure" value={formatBookingTime(booking.bookingDate)} />
          <InfoRow icon="users" label="Personnes" value={String(booking.guests)} />
          {booking.tableLabel ? <InfoRow icon="grid" label="Table" value={`${booking.tableLabel} (${booking.zoneName})`} /> : null}
        </View>

        <View className="bg-white rounded-2xl border border-border px-4 mt-4">
          <InfoRow icon="phone" label="Téléphone" value={booking.customer.phone} />
          {booking.customer.email ? <InfoRow icon="mail" label="Email" value={booking.customer.email} /> : null}
        </View>

        <View className="flex-row gap-3 mt-4">
          {booking.customer.phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${booking.customer.phone}`)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-3 active:opacity-70"
            >
              <Feather name="phone-call" size={15} color="#173B15" />
              <Text className="text-primary font-bold text-sm">Appeler</Text>
            </Pressable>
          ) : null}
          {booking.customer.email ? (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${booking.customer.email}`)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-3 active:opacity-70"
            >
              <Feather name="mail" size={15} color="#173B15" />
              <Text className="text-primary font-bold text-sm">Email</Text>
            </Pressable>
          ) : null}
        </View>

        {booking.notes ? (
          <View className="bg-amber-50 border border-dashed border-amber-200 rounded-xl px-4 py-3 mt-4">
            <Text className="text-xs font-bold text-amber-700 uppercase mb-1">Note</Text>
            <Text className="text-sm text-amber-900">{booking.notes}</Text>
          </View>
        ) : null}

        {!isCancelled && (
          <View className="gap-2.5 mt-6">
            {isPending ? (
              <Pressable
                onPress={() => updateStatus.mutate({ bookingId: booking._id, status: BookingStatus.CONFIRMED })}
                disabled={updateStatus.isPending}
                className="flex-row items-center justify-center gap-2 bg-success-bg rounded-xl py-3.5 active:opacity-70"
              >
                {updateStatus.isPending ? <ActivityIndicator color="#166534" /> : <Feather name="check" size={16} color="#166534" />}
                <Text className="text-success font-bold text-sm">Accepter la réservation</Text>
              </Pressable>
            ) : null}

            {isConfirmed && restaurant?.zones?.length ? (
              <Pressable
                onPress={() => setIsTablePickerOpen(true)}
                className="flex-row items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-xl py-3.5 active:opacity-70"
              >
                <Feather name="grid" size={16} color="#173B15" />
                <Text className="text-primary font-bold text-sm">{booking.tableLabel ? "Changer de table" : "Assigner une table"}</Text>
              </Pressable>
            ) : null}

            {isConfirmed ? (
              <Pressable
                onPress={confirmDismiss}
                disabled={dismissBooking.isPending}
                className="flex-row items-center justify-center gap-2 bg-gray-100 rounded-xl py-3.5 active:opacity-70"
              >
                <Feather name="eye-off" size={16} color="#4b5563" />
                <Text className="text-gray-600 font-bold text-sm">Masquer du tableau de bord</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={confirmCancel}
              disabled={updateStatus.isPending}
              className="flex-row items-center justify-center gap-2 bg-red-50 rounded-xl py-3.5 active:opacity-70"
            >
              <Feather name="x" size={16} color="#d32f2f" />
              <Text className="text-danger font-bold text-sm">{isPending ? "Refuser la réservation" : "Annuler la réservation"}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal visible={isTablePickerOpen} animationType="slide" transparent onRequestClose={() => setIsTablePickerOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setIsTablePickerOpen(false)}>
          <Pressable className="bg-white rounded-t-3xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
            <View className="px-5 pt-5 pb-3 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Choisir une table</Text>
              <Pressable onPress={() => setIsTablePickerOpen(false)} hitSlop={8}>
                <Feather name="x" size={20} color="#6b7280" />
              </Pressable>
            </View>
            <ScrollView className="px-5 py-3" contentContainerStyle={{ paddingBottom: 24 }}>
              {restaurant?.zones?.map((zone) => (
                <View key={zone.id} className="mb-4">
                  <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">{zone.name}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {zone.tables.map((table) => {
                      const isCurrent = booking.tableId === table.id;
                      return (
                        <Pressable
                          key={table.id}
                          disabled={updateTable.isPending}
                          onPress={() => {
                            updateTable.mutate(
                              { bookingId: booking._id, tableId: table.id, zoneId: zone.id },
                              { onSuccess: () => setIsTablePickerOpen(false) },
                            );
                          }}
                          className={`px-3.5 py-2.5 rounded-xl border ${isCurrent ? "bg-primary border-primary" : "bg-surface border-border"}`}
                        >
                          <Text className={`text-sm font-bold ${isCurrent ? "text-white" : "text-gray-900"}`}>
                            {table.label} · {table.seats} pers.
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
