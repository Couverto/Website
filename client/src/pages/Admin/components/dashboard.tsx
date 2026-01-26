import {
  Users,
  Utensils,
  LayoutDashboard,
  Mail,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";

import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
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
  const [stats, setStats] = useState({
    users: { total: 0, newLast7Days: 0, trend: [] },
    restaurants: { total: 0, newLast7Days: 0, trend: [] },
    bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0, totalGuests: 0 },
    system: { totalLogs: 0, errorLogsLast24h: 0 },
    finance: { totalRevenue: 0, revenueByDay: [], revenueByPlan: [] },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosConfig.get("/admin/stats");
        setStats(response.data);
      } catch (error: any) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{"Tableau de bord"}</h2>
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
          title="Chiffre d'Affaires"
          value={`${(stats.finance?.totalRevenue ?? 0).toLocaleString()} €`}
          icon={DollarSign}
          trend="up"
          trendValue="+5%"
          description="somme totale"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {"Évolution des revenus (30j)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.finance?.revenueByDay ?? []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="_id" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} formatter={(value: any) => [`${value} €`, "Revenu"]} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              {"Répartition des abonnements"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.finance?.revenueByPlan ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="_id"
                  >
                    {(stats.finance?.revenueByPlan ?? []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} €`, "Revenu"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {"Nouveaux Utilisateurs (30j)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.users.trend}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="_id" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              {"Nouveaux Restaurants (30j)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.restaurants.trend}>
                  <defs>
                    <linearGradient id="colorRestaurants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="_id" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRestaurants)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
