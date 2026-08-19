import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../src/contexts/AuthContext";
import { getApiErrorMessage } from "../src/api/client";
import { useResponsive } from "../src/hooks/useResponsive";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isTablet } = useResponsive();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Merci de renseigner votre email et votre mot de passe.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "Impossible de se connecter."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="w-full" style={{ maxWidth: isTablet ? 440 : undefined }}>
            <View className="items-center mb-10">
              <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center mb-4">
                <Text className="text-3xl">🍽️</Text>
              </View>
              <Text className="text-white text-2xl font-bold">Couverto Pro</Text>
              <Text className="text-white/70 text-sm mt-1">Gérez votre restaurant</Text>
            </View>

            <View className="bg-white rounded-2xl p-5 gap-4">
              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="vous@restaurant.fr"
                  placeholderTextColor="#9ca3af"
                  className="border border-border rounded-xl px-4 py-3 text-base text-gray-900"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5">Mot de passe</Text>
                <View className="flex-row items-center border border-border rounded-xl px-4">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 py-3 text-base text-gray-900"
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#6b7280" />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View className="bg-red-50 rounded-lg px-3 py-2">
                  <Text className="text-danger text-sm font-medium">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="bg-accent rounded-xl py-3.5 items-center mt-1 active:opacity-80"
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Se connecter</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
