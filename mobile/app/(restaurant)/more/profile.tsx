import { Image, Text, View } from "react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

function ProfileRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View className="py-3 border-b border-border/60 last:border-b-0">
      <Text className="text-xs font-bold text-muted uppercase tracking-wide mb-1">{label}</Text>
      <Text className="text-base text-gray-900">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <View className="items-center py-6">
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} className="w-20 h-20 rounded-full" />
        ) : (
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-primary font-bold text-2xl">{user?.forename?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text className="text-lg font-bold text-gray-900 mt-3">
          {user?.forename} {user?.name}
        </Text>
      </View>

      <View className="bg-white rounded-2xl border border-border px-4">
        <ProfileRow label="Email" value={user?.email ?? "—"} />
        <ProfileRow label="Téléphone" value={user?.phone || "—"} />
        <ProfileRow label="Nom d'utilisateur" value={user?.username ?? "—"} />
      </View>
    </ScreenContainer>
  );
}
