import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description?: string;
}

export function EmptyState({ icon = "inbox", title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16 px-6">
      <Feather name={icon} size={40} color="#9ca3af" />
      <Text className="mt-4 text-base font-semibold text-gray-500 text-center">{title}</Text>
      {description ? <Text className="mt-1 text-sm text-gray-400 text-center">{description}</Text> : null}
    </View>
  );
}
