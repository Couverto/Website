import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  today: { bookings: number; guests: number };
  week: { bookings: number };
  month: { bookings: number };
  totalClients: number;
}

interface Booking {
  _id: string;
  bookingDate: string;
  guests: number;
  status: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

interface RestaurantContext {
  restaurant: {
    _id: string;
    name: string;
  };
}

export const RestaurantDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/restaurants/${id}/stats`);
        setStats(response.data.stats);
        setUpcomingBookings(response.data.upcomingBookings);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStats();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.dashboard.subtitle")}</p>
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
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.restaurant.dashboard.upcoming_bookings")}</CardTitle>
          <CardDescription>{t("pages.restaurant.dashboard.upcoming_bookings_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("pages.restaurant.dashboard.no_upcoming")}</p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{format(new Date(booking.bookingDate), "dd", { locale: fr })}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(new Date(booking.bookingDate), "MMM", { locale: fr })}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{booking.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.bookingDate), "HH:mm", { locale: fr })} • {booking.guests}{" "}
                        {t("pages.restaurant.dashboard.guests")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {t(`pages.account.bookings_page.status.${booking.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
