import { Stack } from "expo-router";

export default function MoreStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#173B15",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Mon profil" }} />
    </Stack>
  );
}
