import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    usersCount: 0,
    restaurantsCount: 0,
    adminsCount: 0,
    authMethods: {
      password: 0,
      google: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel fetches for efficiency
        const [usersRes, restaurantsRes] = await Promise.all([
          axiosConfig.get("/users?page=0&size=1000"), // Temporary: fetch all to count auth types if backend doesn't provide it
          axiosConfig.get("/restaurants?page=0&size=1"),
        ]);

        const users = usersRes.data.users || [];
        const passwordUsers = users.filter((u: any) => !u.authType || u.authType === "password").length;
        const googleUsers = users.filter((u: any) => u.authType === "google").length;
        const admins = users.filter((u: any) => u.role === "admin").length;

        setStats({
          usersCount: usersRes.data.count,
          restaurantsCount: restaurantsRes.data.count,
          adminsCount: admins,
          authMethods: {
            password: passwordUsers,
            google: googleUsers,
          },
        });
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard stats");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col px-4 space-y-6 md:px-8 py-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("pages.admin.dashboard")}</h1>
          <p className="text-muted-foreground">{t("pages.admin.dashboard_page.auth_methods_description")}</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.admin.dashboard_page.total_users")}</CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.usersCount}</div>
            <p className="text-xs text-muted-foreground">{stats.adminsCount} administrateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.admin.restaurants_page.restaurant")}s</CardTitle>
            <Utensils className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.restaurantsCount}</div>
            <p className="text-xs text-muted-foreground">Restaurants inscrits</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
