import React from "react";
import { Text, View } from "react-native";
import { BookingStatus } from "../types";

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  [BookingStatus.PENDING]: { bg: "bg-warning-bg", text: "text-warning", label: "En attente" },
  [BookingStatus.CONFIRMED]: { bg: "bg-success-bg", text: "text-success", label: "Confirmée" },
  [BookingStatus.CANCELLED]: { bg: "bg-red-100", text: "text-danger", label: "Annulée" },
  [BookingStatus.DRAFT]: { bg: "bg-gray-100", text: "text-muted", label: "Brouillon" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[BookingStatus.DRAFT];
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>{style.label}</Text>
    </View>
  );
}
