import { ActivityIndicator, Image, Pressable, ScrollView, Share, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useReferralInfo, useToggleReferralCode } from "../../../src/hooks/useReferralQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { formatShortDate } from "../../../src/utils/dateFormatter";

export default function ReferralScreen() {
  const { activeRestaurantId } = useRestaurant();
  const { data, isLoading } = useReferralInfo(activeRestaurantId);
  const toggleCode = useToggleReferralCode(activeRestaurantId);

  if (isLoading || !data) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  const { referralCode, referrals, referredBy, pricing, stats } = data;

  const shareCode = () => {
    Share.share({
      message: `Rejoignez Couverto avec mon code de parrainage "${referralCode.code}" et bénéficiez d'avantages sur votre abonnement !`,
    });
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <View className="bg-primary rounded-2xl p-5 items-center">
          <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Votre code de parrainage</Text>
          <Text className="text-white text-3xl font-black tracking-widest">{referralCode.code}</Text>

          <View className="flex-row items-center gap-2 mt-4">
            <Switch value={referralCode.isActive} onValueChange={() => toggleCode.mutate()} trackColor={{ true: "#2ecc9a", false: "#4b5563" }} />
            <Text className="text-white text-xs font-semibold">{referralCode.isActive ? "Actif" : "Désactivé"}</Text>
          </View>

          <Pressable onPress={shareCode} className="flex-row items-center gap-2 bg-white/15 rounded-full px-4 py-2 mt-4">
            <Feather name="share-2" size={14} color="#fff" />
            <Text className="text-white text-xs font-bold">Partager mon code</Text>
          </Pressable>
        </View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 bg-white rounded-2xl border border-border p-4 items-center">
            <Text className="text-2xl font-black text-primary">{stats.totalReferrals}</Text>
            <Text className="text-xs text-muted font-medium mt-0.5">Filleuls</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl border border-border p-4 items-center">
            <Text className="text-2xl font-black text-primary">{pricing.totalDiscountPercentage}%</Text>
            <Text className="text-xs text-muted font-medium mt-0.5">Remise cumulée</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-border p-4 mt-4">
          <Text className="text-sm font-bold text-gray-900 mb-3">Votre tarif — {pricing.planName}</Text>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-muted">Prix plein</Text>
            <Text className="text-sm font-semibold text-gray-900">{pricing.planPrice}€/mois</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-muted">Remise ({pricing.totalDiscountPercentage}%)</Text>
            <Text className="text-sm font-semibold text-success">-{pricing.discountAmount.toFixed(2)}€</Text>
          </View>
          <View className="flex-row items-center justify-between pt-2 mt-1 border-t border-border/60">
            <Text className="text-sm font-bold text-gray-900">Prix final</Text>
            <Text className="text-base font-black text-primary">{pricing.priceAfterDiscount.toFixed(2)}€/mois</Text>
          </View>
        </View>

        {referredBy ? (
          <View className="flex-row items-center gap-3 bg-white rounded-2xl border border-border p-4 mt-4">
            {referredBy.coverImage ? (
              <Image source={{ uri: referredBy.coverImage }} className="w-10 h-10 rounded-xl" />
            ) : (
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Feather name="gift" size={16} color="#173B15" />
              </View>
            )}
            <View>
              <Text className="text-xs text-muted">Parrainé par</Text>
              <Text className="text-sm font-bold text-gray-900">{referredBy.name}</Text>
            </View>
          </View>
        ) : null}

        <Text className="text-xs font-black uppercase tracking-widest text-muted mt-6 mb-2">Vos filleuls</Text>
        {referrals.length === 0 ? (
          <EmptyState icon="gift" title="Aucun filleul" description="Partagez votre code pour gagner des remises." />
        ) : (
          <View className="bg-white rounded-2xl border border-border overflow-hidden">
            {referrals.map((referral, index) => (
              <View
                key={referral._id}
                className={`flex-row items-center gap-3 p-4 ${index < referrals.length - 1 ? "border-b border-border/60" : ""}`}
              >
                {referral.coverImage ? (
                  <Image source={{ uri: referral.coverImage }} className="w-10 h-10 rounded-xl" />
                ) : (
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                    <Text className="text-primary font-bold">{referral.name[0]?.toUpperCase()}</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="font-semibold text-sm text-gray-900">{referral.name}</Text>
                  <Text className="text-xs text-muted mt-0.5">Rejoint le {formatShortDate(referral.createdAt)}</Text>
                </View>
                <Text className="text-sm font-bold text-success">+{referral.discountGained}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
