import { Stack } from "expo-router";

export default function BookingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#173B15",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[bookingId]" options={{ title: "Réservation" }} />
    </Stack>
  );
}
