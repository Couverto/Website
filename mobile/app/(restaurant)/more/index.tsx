import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { RestaurantRole } from "../../../src/types";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

interface ComingSoonItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  roles: RestaurantRole[];
}

const COMING_SOON: ComingSoonItem[] = [
  { icon: "grid", label: "Plan de salle", roles: [RestaurantRole.ADMIN, RestaurantRole.MANAGER] },
  { icon: "user-plus", label: "Collaborateurs", roles: [RestaurantRole.ADMIN, RestaurantRole.MANAGER] },
  { icon: "image", label: "Galerie", roles: [RestaurantRole.ADMIN, RestaurantRole.MANAGER] },
  { icon: "bar-chart-2", label: "Statistiques", roles: [RestaurantRole.ADMIN] },
  { icon: "credit-card", label: "Abonnement", roles: [RestaurantRole.ADMIN] },
  { icon: "gift", label: "Parrainage", roles: [RestaurantRole.ADMIN] },
  { icon: "settings", label: "Paramètres", roles: [RestaurantRole.ADMIN] },
];

export default function MoreScreen() {
  const { user, signOut } = useAuth();
  const { restaurant, userRole, exitRestaurant } = useRestaurant();

  const visibleComingSoon = COMING_SOON.filter((item) => !userRole || item.roles.includes(userRole));

  const handleSwitchRestaurant = async () => {
    await exitRestaurant();
    router.replace("/select-restaurant");
  };

  const confirmSignOut = () => {
    Alert.alert("Se déconnecter ?", undefined, [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-primary mb-4">Plus</Text>

        <Pressable
          onPress={() => router.push("/more/profile")}
          className="flex-row items-center gap-3 bg-white rounded-2xl border border-border p-4 active:opacity-70"
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-12 h-12 rounded-full" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-primary font-bold text-lg">{user?.forename?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-bold text-gray-900">
              {user?.forename} {user?.name}
            </Text>
            <Text className="text-muted text-xs mt-0.5">{user?.email}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable
          onPress={handleSwitchRestaurant}
          className="flex-row items-center gap-3 bg-white rounded-2xl border border-border p-4 mt-3 active:opacity-70"
        >
          <View className="w-10 h-10 rounded-xl bg-primary/5 items-center justify-center">
            <Feather name="repeat" size={17} color="#173B15" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900">Changer de restaurant</Text>
            <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>
              {restaurant?.name}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9ca3af" />
        </Pressable>

        <Text className="text-xs font-black uppercase tracking-widest text-muted mt-6 mb-2">Gestion du restaurant</Text>
        <View className="bg-white rounded-2xl border border-border overflow-hidden">
          {visibleComingSoon.map((item, index) => (
            <View
              key={item.label}
              className={`flex-row items-center gap-3 p-4 ${index < visibleComingSoon.length - 1 ? "border-b border-border/60" : ""}`}
            >
              <View className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center">
                <Feather name={item.icon} size={16} color="#9ca3af" />
              </View>
              <Text className="flex-1 font-semibold text-gray-400">{item.label}</Text>
              <View className="bg-gray-100 rounded-full px-2.5 py-1">
                <Text className="text-[10px] font-bold text-gray-500">Bientôt disponible</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={confirmSignOut}
          className="flex-row items-center justify-center gap-2 bg-red-50 rounded-2xl py-3.5 mt-6 active:opacity-70"
        >
          <Feather name="log-out" size={16} color="#d32f2f" />
          <Text className="text-danger font-bold text-sm">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
