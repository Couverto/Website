import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Booking, BookingStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatBookingTime, formatDayLabel } from "../utils/dateFormatter";

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  onConfirm?: () => void;
  onRefuse?: () => void;
  isUpdating?: boolean;
}

export function BookingCard({ booking, onPress, onConfirm, onRefuse, isUpdating }: BookingCardProps) {
  const isPending = booking.status === BookingStatus.PENDING;
  const isCancelled = booking.status === BookingStatus.CANCELLED;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-border p-4 mb-3 active:opacity-70"
      style={{ opacity: isCancelled ? 0.6 : 1 }}
    >
      <View className="flex-row items-start gap-3">
        <View className="items-center justify-center bg-surface rounded-lg border border-border px-2 py-1.5 min-w-[52px]">
          <Text className="text-[10px] font-black uppercase text-muted">{formatDayLabel(booking.bookingDate)}</Text>
          <Text className="text-sm font-black text-accent-dark mt-0.5">{formatBookingTime(booking.bookingDate)}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="font-bold text-base flex-1" numberOfLines={1} style={isCancelled ? { textDecorationLine: "line-through" } : undefined}>
              {booking.customer.name}
            </Text>
            <StatusBadge status={booking.status} />
          </View>

          <View className="flex-row items-center gap-3 mt-1.5">
            <View className="flex-row items-center gap-1">
              <Feather name="users" size={13} color="#6b7280" />
              <Text className="text-xs text-muted font-medium">{booking.guests}</Text>
            </View>
            {booking.customer.phone ? (
              <View className="flex-row items-center gap-1">
                <Feather name="phone" size={13} color="#6b7280" />
                <Text className="text-xs text-muted font-medium">{booking.customer.phone}</Text>
              </View>
            ) : null}
            {booking.tableLabel ? (
              <View className="flex-row items-center gap-1">
                <Feather name="grid" size={13} color="#173B15" />
                <Text className="text-xs text-primary font-bold">{booking.tableLabel}</Text>
              </View>
            ) : null}
          </View>

          {booking.notes ? (
            <Text className="text-xs text-muted italic mt-1.5" numberOfLines={2}>
              {booking.notes}
            </Text>
          ) : null}
        </View>
      </View>

      {isPending && (onConfirm || onRefuse) ? (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-dashed border-border">
          {onConfirm ? (
            <Pressable
              onPress={onConfirm}
              disabled={isUpdating}
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-success-bg rounded-lg py-2 active:opacity-70"
            >
              {isUpdating ? <ActivityIndicator size="small" color="#166534" /> : <Feather name="check" size={14} color="#166534" />}
              <Text className="text-success text-xs font-bold">Accepter</Text>
            </Pressable>
          ) : null}
          {onRefuse ? (
            <Pressable
              onPress={onRefuse}
              disabled={isUpdating}
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-red-50 rounded-lg py-2 active:opacity-70"
            >
              <Feather name="x" size={14} color="#d32f2f" />
              <Text className="text-danger text-xs font-bold">Refuser</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
