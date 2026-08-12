import React from "react";
import { Text, View } from "react-native";

interface BarDatum {
  label: string;
  value: number;
}

/**
 * Minimal dependency-free horizontal bar chart. Good enough for the Stats
 * screen without pulling in a charting library (avoids the Reanimated/
 * worklets dependency chain, see mobile/README.md).
 */
export function SimpleBarChart({ data, valueSuffix = "" }: Readonly<{ data: BarDatum[]; valueSuffix?: string }>) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View className="gap-2.5">
      {data.map((item) => (
        <View key={item.label} className="flex-row items-center gap-3">
          <Text className="text-xs font-semibold text-muted w-16" numberOfLines={1}>
            {item.label}
          </Text>
          <View className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
            <View className="h-full bg-accent rounded-full" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </View>
          <Text className="text-xs font-bold text-gray-700 w-10 text-right">
            {item.value}
            {valueSuffix}
          </Text>
        </View>
      ))}
    </View>
  );
}
