import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Percent,
  CalendarCheck,
  Clock8,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantStats as StatsInterface } from "@/interfaces/Restaurant";
import { RestaurantContext } from "@/interfaces/Components";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useSocketContext } from "@/contexts/socketContext";

export const RestaurantStats = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { socket } = useSocketContext();
  const [stats, setStats] = useState<StatsInterface | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(`/restaurants/${id}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id, fetchStats]);

  // Socket Logic for Real-time Stats
  useEffect(() => {
    if (socket && id) {
      const handleRefresh = () => {
        fetchStats();
      };

      socket.on("newBooking", handleRefresh);
      socket.on("updateBooking", handleRefresh);

      return () => {
        socket.off("newBooking", handleRefresh);
        socket.off("updateBooking", handleRefresh);
      };
    }
  }, [socket, id, fetchStats]);

  const GUEST_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
  const guestPieData = stats?.guestDistribution ? Object.entries(stats.guestDistribution).map(([name, value]) => ({ name, value })) : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.dashboard.title_stats") || "Statistiques"}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.dashboard.subtitle_stats") || "Analyse détaillée de votre activité"}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.today_bookings")}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.today.guests || 0} {t("pages.restaurant.dashboard.guests")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.week_bookings")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.week.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.this_week")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.month_bookings")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.month.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.this_month")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.total_clients")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.unique_clients")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pages.restaurant.dashboard.cancellation_rate") || "Taux d'annulation"}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancellationRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">
              {t("pages.restaurant.dashboard.cancellation_rate_desc") || "Basé sur l'historique"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.avg_guests") || "Couverts moyens"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageGuests ?? 0}</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.per_booking") || "Par réservation"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.avg_lead_time") || "Anticipation"}</CardTitle>
            <Clock8 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.averageLeadTime ?? 0).toFixed(1)}j</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.avg_lead_time_desc") || "Moyenne d'avance"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.busiest_day") || "Jour le plus actif"}</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.busyDays && stats.busyDays.length > 0
                ? format(new Date().setDate(new Date().getDate() - new Date().getDay() + stats.busyDays[0].day), "EEEE", { locale: fr })
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.most_bookings") || "Le plus de réservations"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-primary" />
              <CardTitle>{t("pages.restaurant.dashboard.weekly_trend")}</CardTitle>
            </div>
            <CardDescription>{t("pages.restaurant.dashboard.weekly_trend_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), "eee dd", { locale: fr })} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(val) => format(new Date(val), "PPPP", { locale: fr })}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle>{t("pages.restaurant.dashboard.guest_distribution")}</CardTitle>
            </div>
            <CardDescription>{t("pages.restaurant.dashboard.guest_distribution_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={guestPieData} cx="50%" cy="45%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                    {guestPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GUEST_COLORS[index % GUEST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value: string) => (
                      <span className="text-xs font-medium text-muted-foreground mr-2">
                        {value} {t("pages.restaurant.dashboard.guests")}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
