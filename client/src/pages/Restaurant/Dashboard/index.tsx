import { useParams, useOutletContext, Link } from "react-router-dom";
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
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const { socket } = useSocketContext();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState(
    "Bonjour, nous sommes sincèrement désolés de vous informer que votre réservation a dû être annulée par l’établissement en raison d’un imprévu indépendant de notre volonté. Nous comprenons la gêne que cela peut occasionner et vous présentons toutes nos excuses. N’hésitez pas à reprendre contact avec nous pour toute question ou pour effectuer une nouvelle réservation, nous restons à votre disposition pour vous accompagner.",
  );

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
  // Socket Logic
  useEffect(() => {
    if (socket && id) {
      const handleNewBooking = (newBooking: BookingInterface) => {
        setNewBookingIds((prev) => new Set(prev).add(newBooking._id));
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
  }, [socket, id, fetchStats]);

  const updateStatus = async (bookingId: string, newStatus: string, reason?: string) => {
    try {
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/status`, { status: newStatus, reason });
      if (newBookingIds.has(bookingId)) {
        setNewBookingIds((prev) => {
          const next = new Set(prev);
          next.delete(bookingId);
          return next;
        });
      }
      toast.success("Statut mis à jour");
      fetchStats();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
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
          <h1 className="text-3xl font-bold">{"Tableau de bord"}</h1>
          <p className="text-muted-foreground">{"Vue d'ensemble de votre restaurant"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {context?.restaurant && (
            <Button variant="outline" asChild>
              <Link to={`/restaurants/infos/${context.restaurant._id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                {"Voir la page publique"}
              </Link>
            </Button>
          )}
          <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {"Nouvelle réservation"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{"Nouvelle réservation"}</DialogTitle>
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
            <CardTitle className="text-sm font-medium">{"Réservations aujourd'hui"}</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.today.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.today.guests || 0} couvert(s) prévus aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingBookings.filter((b) => b.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.week.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">Réservations cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings List Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dernières réservations</CardTitle>
              <CardDescription>Les 10 dernières réservations reçues</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/restaurant/${id}/bookings`}>
                {"Voir tout"}
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
                <p className="text-muted-foreground font-medium">Aucune réservation récente</p>
                <p className="text-sm text-muted-foreground mt-1">Les nouvelles réservations apparaîtront ici</p>
              </div>
            ) : (
              recentBookings.map((booking) => {
                const isPending = booking.status === "PENDING";
                const isConfirmed = booking.status === "CONFIRMED";
                const isCancelled = booking.status === "CANCELLED";

                return (
                  <div
                    key={booking._id}
                    className={cn(
                      "group flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-all border-l-4",
                      newBookingIds.has(booking._id) ? "bg-primary/5 border-l-primary" : "border-l-transparent",
                      isPending && "border-l-yellow-500",
                      isConfirmed && "border-l-green-500",
                      isCancelled && "border-l-red-500 opacity-60",
                    )}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Date & Time Box */}
                      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-2 min-w-[4.5rem] border">
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {format(new Date(booking.bookingDate), "MMM", { locale: fr })}
                        </span>
                        <span className="text-2xl font-bold leading-none">{format(new Date(booking.bookingDate), "dd")}</span>
                        <span className="text-sm font-semibold text-primary mt-1">{format(new Date(booking.bookingDate), "HH:mm")}</span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold text-lg truncate", isCancelled && "line-through")}>{booking.customer.name}</span>
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px] h-5 px-1.5 uppercase tracking-wider font-bold", getStatusColor(booking.status))}
                          >
                            {booking.status === "PENDING"
                              ? "En attente"
                              : booking.status === "CONFIRMED"
                                ? "Confirmée"
                                : booking.status === "CANCELLED"
                                  ? "Annulée"
                                  : "Brouillon"}
                          </Badge>
                          {booking.notes && (
                            <div className="relative group/note">
                              <Info className="h-4 w-4 text-orange-400 cursor-help" />
                              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/note:block px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap z-10">
                                {booking.notes}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-foreground font-medium bg-muted/30 px-2 py-0.5 rounded-full">
                            <Users className="h-3.5 w-3.5" />
                            {booking.guests} {"couvert(s)"}
                          </span>
                          {booking.customer.phone && (
                            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                              {booking.customer.phone}
                            </span>
                          )}
                          {booking.customer.email && (
                            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors truncate max-w-[200px]">
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                              {booking.customer.email}
                            </span>
                          )}
                        </div>

                        {booking.notes ? (
                          <p className="text-xs text-orange-600/80 italic truncate max-w-[400px]">Note: "{booking.notes}"</p>
                        ) : (
                          <p className="text-xs text-orange-600/80 italic truncate max-w-[400px]">Aucune note</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {isPending && (
                        <Button
                          size="sm"
                          className="h-9 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          onClick={() => updateStatus(booking._id, "CONFIRMED")}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          {"Confirmer"}
                        </Button>
                      )}

                      {!isCancelled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          onClick={() => setBookingToCancel(booking._id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Annuler</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog
        open={!!bookingToCancel}
        onOpenChange={(open) => {
          if (!open) {
            setBookingToCancel(null);
            setCancellationReason(
              "Bonjour, nous sommes sincèrement désolés de vous informer que votre réservation a dû être annulée par l’établissement en raison d’un imprévu indépendant de notre volonté. Nous comprenons la gêne que cela peut occasionner et vous présentons toutes nos excuses. N’hésitez pas à reprendre contact avec nous pour toute question ou pour effectuer une nouvelle réservation, nous restons à votre disposition pour vous accompagner.",
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. Le client recevra une notification d'annulation.</AlertDialogDescription>
            <div className="space-y-2 py-4">
              <label htmlFor="reason" className="text-sm font-medium text-foreground">
                Motif de l'annulation (optionnel)
              </label>
              <textarea
                id="reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ex: Problème technique, intempéries..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!bookingToCancel}>Retour</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (bookingToCancel) {
                  updateStatus(bookingToCancel, "CANCELLED", cancellationReason);
                  setBookingToCancel(null);
                  setCancellationReason("");
                }
              }}
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
