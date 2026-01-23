import { Users, Utensils, LayoutDashboard, Mail, Calendar, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  caption,
  icon: Icon,
  color = "primary",
}: {
  title: string;
  value: string | number;
  caption: string;
  icon: any;
  color?: string;
}) => (
  <div className="relative group overflow-hidden p-8 border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] bg-white dark:bg-zinc-900/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-default">
    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20", `bg-${color}`)} />

    <div className="relative z-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", `bg-${color}/10`)}>
          <Icon className={cn("w-6 h-6", `text-${color}`)} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-4xl font-black tracking-tighter italic">{value}</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">{caption}</p>
      </div>
    </div>
  </div>
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
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Welcome Header */}
      <div className="relative group p-10 overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-[3rem] bg-zinc-900 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mb-32 blur-[80px] opacity-30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">{t("pages.admin.dashboard")}</h1>
            </div>
            <p className="max-w-xl text-zinc-400 font-medium leading-relaxed">{t("pages.admin.dashboard_page.auth_methods_description")}</p>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Système</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-sm font-bold text-white tracking-tight">Opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats.users.total}
          caption={`+${stats.users.newLast7Days} ces 7 derniers jours`}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Restaurants"
          value={stats.restaurants.total}
          caption={`+${stats.restaurants.newLast7Days} ces 7 derniers jours`}
          icon={Utensils}
          color="accent"
        />
        <StatCard
          title="Réservations"
          value={stats.bookings.total}
          caption={`${stats.bookings.totalGuests || 0} couverts au total`}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Santé Système"
          value={stats.system.errorLogsLast24h}
          caption="Erreurs (24h)"
          icon={Activity}
          color={stats.system.errorLogsLast24h > 0 ? "destructive" : "emerald-500"}
        />
      </div>

      {/* Secondary Stats Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-10 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900/50 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black tracking-tighter italic uppercase">Méthodes d'Auth</h4>
            <Mail className="w-5 h-5 opacity-20" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                <span>Google OAuth</span>
                <span>{stats.authMethods.google}</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(stats.authMethods.google / (stats.users.total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                <span>Mot de passe classique</span>
                <span>{stats.authMethods.local}</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-1000"
                  style={{ width: `${(stats.authMethods.local / (stats.users.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group p-10 overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h4 className="text-lg font-black tracking-tighter italic uppercase">Besoin d'aide ?</h4>
            <p className="max-w-xs text-xs font-medium text-muted-foreground leading-relaxed">
              L'overhaul premium de votre dashboard est maintenant actif. Contactez le support si vous avez des suggestions !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
