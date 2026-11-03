import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

export function StarRating({ rating, size = 14 }: Readonly<{ rating: number; size?: number }>) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather key={i} name="star" size={size} color={i <= rating ? "#f59e0b" : "#e5e7eb"} />
      ))}
    </View>
  );
}
