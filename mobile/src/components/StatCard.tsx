import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface StatCardProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  sublabel?: string;
}

export function StatCard({ icon, label, value, sublabel }: Readonly<StatCardProps>) {
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
