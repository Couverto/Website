import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../src/contexts/RestaurantContext";
import { useBookingEvents } from "../../src/hooks/useBookingEvents";
import { RestaurantRole } from "../../src/types";

const CAN_SEE_CLIENTS: RestaurantRole[] = [RestaurantRole.ADMIN, RestaurantRole.MANAGER];
const CAN_SEE_REVIEWS: RestaurantRole[] = [RestaurantRole.ADMIN, RestaurantRole.MANAGER];

export default function RestaurantTabsLayout() {
  const { activeRestaurantId, userRole, isLoading, isError } = useRestaurant();

  useBookingEvents(activeRestaurantId);

  if (!activeRestaurantId) return <Redirect href="/select-restaurant" />;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#173B15" />
      </View>
    );
  }

  if (isError || !userRole) {
    return <Redirect href="/select-restaurant" />;
  }

  const showClients = CAN_SEE_CLIENTS.includes(userRole);
  const showReviews = CAN_SEE_REVIEWS.includes(userRole);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#173B15",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: "Réservations", tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          href: showClients ? undefined : null,
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: "Avis",
          href: showReviews ? undefined : null,
          tabBarIcon: ({ color, size }) => <Feather name="star" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: "Plus", tabBarIcon: ({ color, size }) => <Feather name="more-horizontal" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
