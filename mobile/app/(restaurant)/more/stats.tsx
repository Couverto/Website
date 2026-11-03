import { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useDashboardStats } from "../../../src/hooks/useBookingsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { StatCard } from "../../../src/components/StatCard";
import { SimpleBarChart } from "../../../src/components/SimpleBarChart";
import { useResponsive } from "../../../src/hooks/useResponsive";

// Mongo's $dayOfWeek: 1 = Sunday ... 7 = Saturday.
const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const GUEST_BUCKET_ORDER = ["1-2", "3-4", "5-6", "7+"];
const STATUS_LABELS: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmées", CANCELLED: "Annulées" };

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <View className="bg-white rounded-2xl border border-border p-4 mt-4">
      <Text className="text-sm font-bold text-gray-900 mb-3">{title}</Text>
      {children}
    </View>
  );
}

export default function StatsScreen() {
  const { activeRestaurantId } = useRestaurant();
  const { columns } = useResponsive();
  const { data, isLoading } = useDashboardStats(activeRestaurantId);
  const stats = data?.stats;

  const dailyData = useMemo(
    () =>
      (stats?.dailyStats ?? []).map((d) => ({
        label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        value: d.count,
      })),
    [stats],
  );

  const busyDaysData = useMemo(
    () => (stats?.busyDays ?? []).slice(0, 7).map((d) => ({ label: DAY_LABELS[d.day - 1] ?? "?", value: d.count })),
    [stats],
  );

  const guestDistributionData = useMemo(
    () => GUEST_BUCKET_ORDER.map((bucket) => ({ label: bucket, value: stats?.guestDistribution?.[bucket] ?? 0 })),
    [stats],
  );

  const statusData = useMemo(
    () =>
      Object.entries(stats?.statusBreakdown ?? {}).map(([status, count]) => ({
        label: STATUS_LABELS[status] ?? status,
        value: count ?? 0,
      })),
    [stats],
  );

  if (isLoading || !stats) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <View className={`flex-row gap-3 ${columns === 1 ? "flex-wrap" : ""}`}>
          <StatCard icon="calendar" label="Aujourd'hui" value={String(stats.today.bookings)} sublabel={`${stats.today.guests} couverts`} />
          <StatCard icon="trending-up" label="Cette semaine" value={String(stats.week.bookings)} />
          <StatCard icon="bar-chart-2" label="Ce mois" value={String(stats.month.bookings)} />
        </View>

        <View className="flex-row gap-3 mt-3">
          <StatCard icon="users" label="Clients" value={String(stats.totalClients)} />
          <StatCard icon="user-check" label="Moy. convives" value={stats.averageGuests.toFixed(1)} />
          <StatCard icon="clock" label="Délai résa." value={`${stats.averageLeadTime.toFixed(1)}j`} />
        </View>

        <Section title="Réservations — 7 derniers jours">
          {dailyData.length ? <SimpleBarChart data={dailyData} /> : <Text className="text-sm text-muted">Pas encore de données.</Text>}
        </Section>

        <Section title="Jours les plus demandés">
          {busyDaysData.length ? <SimpleBarChart data={busyDaysData} /> : <Text className="text-sm text-muted">Pas encore de données.</Text>}
        </Section>

        <Section title="Taille des groupes">
          <SimpleBarChart data={guestDistributionData} />
        </Section>

        <Section title="Statuts des réservations">
          {statusData.length ? <SimpleBarChart data={statusData} /> : <Text className="text-sm text-muted">Pas encore de données.</Text>}
        </Section>

        <Section title="Taux d'annulation">
          <Text className="text-3xl font-black text-primary">{stats.cancellationRate.toFixed(1)}%</Text>
          <Text className="text-xs text-muted mt-1">Sur l'ensemble des réservations reçues</Text>
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}
