import { Users, Utensils, LayoutDashboard, Mail, Calendar, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: any;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {(trend || description) && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
          {trend === "down" && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
          <span className={cn(trend === "up" && "text-emerald-500", trend === "down" && "text-rose-500")}>{trendValue}</span>
          {description && <span className="opacity-70">{description}</span>}
        </p>
      )}
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: { total: 0, newLast7Days: 0 },
    restaurants: { total: 0, newLast7Days: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0, totalGuests: 0 },
    system: { totalLogs: 0, errorLogsLast24h: 0 },
    authMethods: { google: 0, local: 0 },
  });

  const data = [
    { name: "Lun", value: 4 },
    { name: "Mar", value: 3 },
    { name: "Mer", value: 7 },
    { name: "Jeu", value: 5 },
    { name: "Ven", value: 8 },
    { name: "Sam", value: 12 },
    { name: "Dim", value: 10 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminStatsRes, authStatsRes] = await Promise.all([
          axiosConfig.get("/admin/stats"),
          axiosConfig.get("/users/stats/authTypes"),
        ]);

        const authData = authStatsRes.data.data;
        const googleUsers = authData.find((s: any) => s.label === "Google")?.value || 0;
        const localUsers = authData.find((s: any) => s.label === "Local")?.value || 0;

        setStats({
          ...adminStatsRes.data,
          authMethods: {
            google: googleUsers,
            local: localUsers,
          },
        });
      } catch (error: any) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("pages.admin.dashboard")}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats.users.total}
          icon={Users}
          trend="up"
          trendValue={`+${stats.users.newLast7Days}`}
          description="cette semaine"
        />
        <StatCard
          title="Restaurants"
          value={stats.restaurants.total}
          icon={Utensils}
          trend="up"
          trendValue={`+${stats.restaurants.newLast7Days}`}
          description="cette semaine"
        />
        <StatCard
          title="Réservations Total"
          value={stats.bookings.total}
          icon={Calendar}
          description={`${stats.bookings.totalGuests} couverts`}
        />
        <StatCard
          title="Santé Système"
          value={stats.system.errorLogsLast24h > 0 ? "Attention" : "Sain"}
          icon={Activity}
          trend={stats.system.errorLogsLast24h > 0 ? "down" : "up"}
          trendValue={`${stats.system.errorLogsLast24h} erreurs`}
          description="dernières 24h"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Aperçu des Inscriptions</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Méthodes d'Authentification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Google</span>
                    <span className="text-sm text-muted-foreground">{stats.authMethods.google}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(stats.authMethods.google / (stats.users.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email / Mot de passe</span>
                    <span className="text-sm text-muted-foreground">{stats.authMethods.local}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-muted-foreground transition-all"
                      style={{ width: `${(stats.authMethods.local / (stats.users.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
