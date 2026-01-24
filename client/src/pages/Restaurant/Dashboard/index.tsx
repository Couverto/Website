import { useParams, useOutletContext, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useMemo } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, Check, X, Plus, ExternalLink, ChevronRight, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RestaurantStats } from "@/interfaces/Restaurant";
import { BookingInterface } from "@/interfaces/Booking";
import { RestaurantContext } from "@/interfaces/Components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from "@/pages/Home/components/Booking/BookingForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const RestaurantDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const { socket } = useSocketContext();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(`/restaurants/${id}/stats`);
      setStats(response.data.stats);
      setUpcomingBookings(response.data.upcomingBookings);
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

  // Socket Logic
  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: BookingInterface) => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));

        setNewBookingIds((prev) => new Set(prev).add(newBooking._id));
        toast.info(t("pages.restaurant.bookings.new_booking_notification"));
        fetchStats();
      };

      const handleUpdateBooking = () => {
        fetchStats();
      };

      socket.on("newBooking", handleNewBooking);
      socket.on("updateBooking", handleUpdateBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
        socket.off("updateBooking", handleUpdateBooking);
      };
    }
  }, [socket, id, fetchStats, t]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/status`, { status: newStatus });
      if (newBookingIds.has(bookingId)) {
        setNewBookingIds((prev) => {
          const next = new Set(prev);
          next.delete(bookingId);
          return next;
        });
      }
      toast.success(t("pages.restaurant.bookings.status_updated"));
      fetchStats();
    } catch (error) {
      toast.error(t("pages.restaurant.bookings.status_error"));
    }
  };

  const recentBookings = useMemo(() => {
    return upcomingBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  }, [upcomingBookings]);

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
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("pages.restaurant.dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("pages.restaurant.dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {context?.restaurant && (
            <Button variant="outline" asChild>
              <Link to={`/restaurants/infos/${context.restaurant._id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("pages.restaurant.dashboard.view_public")}
              </Link>
            </Button>
          )}
          <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("pages.restaurant.dashboard.new_booking")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("pages.restaurant.dashboard.new_booking")}</DialogTitle>
              </DialogHeader>
              {context?.restaurant && (
                <BookingForm
                  restaurant={context.restaurant}
                  onSuccess={() => {
                    setIsBookingDialogOpen(false);
                    fetchStats();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.today_bookings")}</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.today.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.today.guests || 0} {t("pages.restaurant.dashboard.guests")}{" "}
              {t("pages.restaurant.dashboard.prevues_today") || "prévus aujourd'hui"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.pending_bookings") || "En attente"}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingBookings.filter((b) => b.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.dashboard.require_action") || "Nécessitent une action"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pages.restaurant.dashboard.week_summary") || "Cette semaine"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.week.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("pages.restaurant.dashboard.total_week_bookings") || "Réservations cette semaine"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings List Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("pages.restaurant.dashboard.recent_bookings") || "Dernières réservations"}</CardTitle>
              <CardDescription>
                {t("pages.restaurant.dashboard.recent_bookings_desc") || "Les 10 dernières réservations reçues"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/restaurant/${id}/bookings`}>
                {t("pages.restaurant.dashboard.view_all") || "Voir tout"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentBookings.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Info className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">
                  {t("pages.restaurant.dashboard.no_recent_bookings") || "Aucune réservation récente"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("pages.restaurant.dashboard.no_recent_bookings_hint") || "Les nouvelles réservations apparaîtront ici"}
                </p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-colors relative",
                    newBookingIds.has(booking._id) && "bg-primary/5",
                  )}
                >
                  {newBookingIds.has(booking._id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" title="Nouveau" />}

                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-muted rounded-lg p-2 text-center min-w-[3.5rem]">
                      <div className="text-sm font-bold">{format(new Date(booking.bookingDate), "dd MMM", { locale: fr })}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(booking.bookingDate), "HH:mm")}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{booking.customer.name}</span>
                        <Badge variant="outline" className={cn("text-[10px] h-4 px-1 uppercase font-bold", getStatusColor(booking.status))}>
                          {t(`pages.account.bookings_page.status.${booking.status}`)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {booking.guests} {t("pages.restaurant.dashboard.guests")}
                        </span>
                        {booking.customer.phone && <span className="flex items-center">{booking.customer.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {booking.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => updateStatus(booking._id, "CONFIRMED")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {t("global.buttons.confirm") || "Confirmer"}
                      </Button>
                    )}

                    {booking.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setBookingToCancel(booking._id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("global.buttons.cancel") || "Annuler"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages.restaurant.dashboard.cancel_confirm_title") || "Confirmer l'annulation ?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages.restaurant.dashboard.cancel_confirm_desc") ||
                "Cette action est irréversible. Le client recevra une notification d'annulation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!bookingToCancel}>{t("global.buttons.back") || "Retour"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (bookingToCancel) {
                  updateStatus(bookingToCancel, "CANCELLED");
                  setBookingToCancel(null);
                }
              }}
            >
              {t("global.buttons.confirm_cancel") || "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
