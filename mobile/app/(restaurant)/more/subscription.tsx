import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import {
  useCancelSubscription,
  usePublicPlans,
  useRestaurantPayments,
  useSubscription,
  useUpdateSubscription,
} from "../../../src/hooks/usePaymentsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { formatShortDate } from "../../../src/utils/dateFormatter";
import { getApiErrorMessage } from "../../../src/api/client";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-success-bg text-success" },
  cancelled: { label: "Résilié", className: "bg-red-100 text-danger" },
  expired: { label: "Expiré", className: "bg-red-100 text-danger" },
  none: { label: "Aucun plan", className: "bg-gray-100 text-muted" },
  pending_payment: { label: "Paiement en attente", className: "bg-warning-bg text-warning" },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = { pending: "En attente", completed: "Payé", failed: "Échoué", refunded: "Remboursé" };

export default function SubscriptionScreen() {
  const { activeRestaurantId } = useRestaurant();
  const { data: subscription, isLoading } = useSubscription(activeRestaurantId);
  const { data: payments } = useRestaurantPayments(activeRestaurantId);
  const { data: plans } = usePublicPlans();
  const updateSubscription = useUpdateSubscription(activeRestaurantId);
  const cancelSubscription = useCancelSubscription(activeRestaurantId);

  if (isLoading || !subscription) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  const statusInfo = STATUS_LABELS[subscription.subscriptionStatus] ?? STATUS_LABELS.none;

  const confirmSwitchPlan = (planId: string, planName: string) => {
    if (planId === subscription.plan?._id) return;
    Alert.alert("Changer de plan ?", `Passer au plan ${planName}.`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer",
        onPress: () =>
          updateSubscription.mutate({ planId }, { onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)) }),
      },
    ]);
  };

  const confirmCancel = () => {
    Alert.alert(
      "Résilier l'abonnement ?",
      "Le restaurant sera fermé et toutes les réservations à venir seront annulées. Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Résilier",
          style: "destructive",
          onPress: () =>
            cancelSubscription.mutate(undefined, {
              onSuccess: () => Alert.alert("Abonnement résilié"),
              onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)),
            }),
        },
      ],
    );
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <View className="bg-white rounded-2xl border border-border p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-black text-primary">{subscription.plan?.name ?? "Aucun plan"}</Text>
            <View className={`rounded-full px-2.5 py-1 ${statusInfo.className.split(" ")[0]}`}>
              <Text className={`text-[10px] font-bold ${statusInfo.className.split(" ")[1]}`}>{statusInfo.label}</Text>
            </View>
          </View>
          {subscription.plan ? <Text className="text-2xl font-black text-gray-900 mt-1">{subscription.plan.price}€/mois</Text> : null}
          {subscription.subscriptionEndDate ? (
            <Text className="text-xs text-muted mt-1">
              {subscription.autoRenew ? "Renouvellement" : "Fin"} le {formatShortDate(subscription.subscriptionEndDate)}
            </Text>
          ) : null}

          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-border/60">
            <Text className="text-sm font-semibold text-gray-900">Renouvellement automatique</Text>
            <Switch
              value={subscription.autoRenew}
              onValueChange={(v) => updateSubscription.mutate({ autoRenew: v })}
              trackColor={{ true: "#2ecc9a", false: "#e5e7eb" }}
              disabled={updateSubscription.isPending}
            />
          </View>
        </View>

        {plans?.length ? (
          <>
            <Text className="text-xs font-black uppercase tracking-widest text-muted mt-6 mb-2">Changer de plan</Text>
            <View className="gap-2.5">
              {plans.map((plan) => {
                const isCurrent = plan._id === subscription.plan?._id;
                return (
                  <Pressable
                    key={plan._id}
                    onPress={() => confirmSwitchPlan(plan._id, plan.name)}
                    disabled={updateSubscription.isPending || isCurrent}
                    className={`flex-row items-center justify-between rounded-2xl border p-4 ${isCurrent ? "bg-primary/5 border-primary/30" : "bg-white border-border"}`}
                  >
                    <View>
                      <Text className="font-bold text-sm text-gray-900">{plan.name}</Text>
                      <Text className="text-xs text-muted mt-0.5">{plan.price}€/mois</Text>
                    </View>
                    {isCurrent ? (
                      <View className="bg-primary rounded-full px-2.5 py-1">
                        <Text className="text-[10px] font-bold text-white">Actuel</Text>
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={16} color="#9ca3af" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <Text className="text-xs font-black uppercase tracking-widest text-muted mt-6 mb-2">Historique des paiements</Text>
        {payments?.length ? (
          <View className="bg-white rounded-2xl border border-border overflow-hidden">
            {payments.map((payment, index) => (
              <View
                key={payment._id}
                className={`flex-row items-center justify-between p-4 ${index < payments.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <View>
                  <Text className="font-semibold text-sm text-gray-900">{payment.planName}</Text>
                  <Text className="text-xs text-muted mt-0.5">{formatShortDate(payment.createdAt)}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-sm text-gray-900">{payment.amount}€</Text>
                  <Text className="text-[10px] text-muted mt-0.5">{PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState icon="credit-card" title="Aucun paiement" />
        )}

        <Pressable
          onPress={confirmCancel}
          disabled={cancelSubscription.isPending || subscription.subscriptionStatus === "cancelled"}
          className="flex-row items-center justify-center gap-2 bg-red-50 rounded-2xl py-3.5 mt-6"
        >
          {cancelSubscription.isPending ? <ActivityIndicator color="#d32f2f" /> : <Feather name="x-circle" size={16} color="#d32f2f" />}
          <Text className="text-danger font-bold text-sm">Résilier l'abonnement</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
