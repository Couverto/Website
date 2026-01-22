import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, Clock, Check, X, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RestaurantInterface } from "@/interfaces/Restaurant";

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
  restaurant: RestaurantInterface;
}

export const RestaurantDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const { socket } = useSocketContext();

  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchStats = async () => {
      // ... existing fetch logic
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

  // Socket Logic
  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: Booking) => {
        // Play sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        const playPromise = audio.play();

        playPromise.catch((e) => {
          console.error("Audio play failed", e);
          // If blocked, show button in toast to enable
        });

        // Add to upcoming list if it's future/today (simplification: just add it to top for visibility)
        setUpcomingBookings((prev) => [newBooking, ...prev]);

        // Update stats (optimistic)
        if (new Date(newBooking.bookingDate).toDateString() === new Date().toDateString()) {
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  today: { ...prev.today, bookings: prev.today.bookings + 1, guests: prev.today.guests + newBooking.guests },
                }
              : null,
          );
        }

        // Visual indicator
        setNewBookingIds((prev) => new Set(prev).add(newBooking._id));

        toast.info(t("pages.restaurant.bookings.new_booking_notification"), {});
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/status`, { status: newStatus });
      setUpcomingBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b)));

      // Remove "new" indicator if action taken
      if (newBookingIds.has(bookingId)) {
        setNewBookingIds((prev) => {
          const next = new Set(prev);
          next.delete(bookingId);
          return next;
        });
      }

      toast.success(t("pages.restaurant.bookings.status_updated"));
    } catch (error) {
      toast.error(t("pages.restaurant.bookings.status_error"));
    }
  };

  const getStatusColor = (status: string) => {
    // ... same as before
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
    // ... existing loading skeleton
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
      {/* ... existing header and cards ... */}
      {/* Need to include existing JSX up to upcoming bookings map */}
      {/* I will use careful replacement */}
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.dashboard.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... Cards code copy ... */}
        {/* Skipping generic cards content for brevity in prompt, I'll rely on matching or I'll just rewrite the list part. 
            Actually I should replace the whole file content to be safe and clean since I'm adding imports and state.
        */}
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
                    <div className="text-center relative">
                      <div className="text-2xl font-bold">{format(new Date(booking.bookingDate), "dd", { locale: fr })}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(new Date(booking.bookingDate), "MMM", { locale: fr })}
                      </div>

                      {/* Indicator */}
                      {newBookingIds.has(booking._id) && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{booking.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.bookingDate), "HH:mm", { locale: fr })} • {booking.guests}{" "}
                        {t("pages.restaurant.dashboard.guests")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {t(`pages.account.bookings_page.status.${booking.status}`)}
                    </Badge>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {booking.status !== "CONFIRMED" && (
                          <DropdownMenuItem onClick={() => updateStatus(booking._id, "CONFIRMED")}>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            {t("pages.restaurant.bookings.confirm")}
                          </DropdownMenuItem>
                        )}
                        {booking.status !== "CANCELLED" && (
                          <DropdownMenuItem onClick={() => updateStatus(booking._id, "CANCELLED")}>
                            <X className="h-4 w-4 mr-2 text-red-600" />
                            {t("pages.restaurant.bookings.cancel")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
