import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Introuvable" }} />
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-lg font-bold text-gray-900">Cette page n'existe pas.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-primary font-bold">Retour à l'accueil</Text>
        </Link>
      </View>
    </>
  );
}
