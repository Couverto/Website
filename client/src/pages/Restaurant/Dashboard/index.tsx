import { useParams, useOutletContext, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  Clock,
  Check,
  X,
  Plus,
  ExternalLink,
  ChevronRight,
  Info,
  Armchair,
  Layout,
  MessageSquare,
  MoveHorizontal,
  Phone,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RestaurantStats } from "@/interfaces/Restaurant";
import { BookingInterface } from "@/interfaces/Booking";
import { RestaurantContext } from "@/interfaces/Components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingForm } from "@/pages/Home/components/Booking/BookingForm";
import { DashboardTablePlan } from "./DashboardTablePlan";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const RestaurantDashboard = () => {
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const { socket } = useSocketContext();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingInterface[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingInterface[]>([]);
  const [dayBookings, setDayBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingToMove, setBookingToMove] = useState<BookingInterface | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [cancellationReason, setCancellationReason] = useState(
    "Bonjour, nous sommes sincèrement désolés de vous informer que votre réservation a dû être annulée par l’établissement en raison d’un imprévu indépendant de notre volonté. Nous comprenons la gêne que cela peut occasionner et vous présentons toutes nos excuses. N’hésitez pas à reprendre contact avec nous pour toute question ou pour effectuer une nouvelle réservation, nous restons à votre disposition pour vous accompagner.",
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const hasTablePlan = context?.availablePages?.includes("tablePlan");

  const isFullDayClosed = useMemo(() => {
    if (!context?.restaurant?.exceptionalClosures) return false;
    const todayStr = format(selectedDate, "yyyy-MM-dd");
    const sTarget = new Date(todayStr + "T00:00:00.000Z").getTime();
    const eTarget = new Date(todayStr + "T23:59:59.999Z").getTime();

    return context.restaurant.exceptionalClosures.some((closure: any) => {
      const s = new Date(closure.startDate).getTime();
      const e = new Date(closure.endDate).getTime();
      return Math.abs(s - sTarget) < 2000 && Math.abs(e - eTarget) < 2000;
    });
  }, [context?.restaurant?.exceptionalClosures, selectedDate]);

  const todayServices = useMemo(() => {
    if (!context?.restaurant?.openingHours) return [];
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[selectedDate.getDay()];
    // @ts-ignore - handle potential map or object
    const schedule = context.restaurant.openingHours instanceof Map 
      ? context.restaurant.openingHours.get(dayName)
      : (context.restaurant.openingHours as any)[dayName];
    if (!schedule || schedule.isClosed || !schedule.periods) return [];
    return schedule.periods;
  }, [context?.restaurant?.openingHours, selectedDate]);

  const findClosestService = useCallback((periods: any[]) => {
    if (periods.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // If it is today, find the closest one. If another day, find the first one.
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    
    if (!isToday) return `${periods[0].open}-${periods[0].close}`;

    let closest = periods[0];
    let minDiff = Infinity;

    for (const p of periods) {
      const [h, m] = p.open.split(":").map(Number);
      const openMinutes = h * 60 + m;
      const diff = Math.abs(openMinutes - currentMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    return `${closest.open}-${closest.close}`;
  }, [selectedDate]);

  // Set default service
  useEffect(() => {
    if (todayServices.length > 0 && !selectedService) {
      setSelectedService(findClosestService(todayServices));
    }
  }, [todayServices, findClosestService, selectedService]);

  const getServiceStatus = useCallback((period: { open: string; close: string }) => {
    if (!context?.restaurant?.exceptionalClosures) return "open";
    const todayStr = new Date().toISOString().split("T")[0];
    const sTarget = new Date(todayStr + "T" + period.open + ":00.000Z").getTime();
    const eTarget = new Date(todayStr + "T" + period.close + ":00.999Z").getTime();

    const isClosed = context.restaurant.exceptionalClosures.some((closure: any) => {
      const s = new Date(closure.startDate).getTime();
      const e = new Date(closure.endDate).getTime();
      return Math.abs(s - sTarget) < 2000 && Math.abs(e - eTarget) < 2000;
    });
    return isClosed ? "closed" : "open";
  }, [context?.restaurant?.exceptionalClosures]);

  const [isTogglingClosure, setIsTogglingClosure] = useState(false);

  const toggleTodayClosure = async (startTime?: string, endTime?: string) => {
    try {
      setIsTogglingClosure(true);
      const response = await api.patch(`/restaurants/${id}/toggle-today-closure`, {
        startTime,
        endTime,
        date: format(selectedDate, "yyyy-MM-dd")
      });
      toast.success(response.data.message);
      if (context?.refreshRestaurant) {
        await context.refreshRestaurant();
      }
    } catch (error) {
      toast.error("Erreur lors de la modification de la fermeture");
    } finally {
      setIsTogglingClosure(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${id}/stats`, {
        params: { date: format(selectedDate, "yyyy-MM-dd") }
      });
      setStats(response.data.stats);
      setUpcomingBookings(response.data.upcomingBookings);
      setRecentBookings(response.data.recentBookings || []);
      setDayBookings(response.data.dayBookings || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [id, selectedDate]);

  const isTimeInService = (bookingTime: string, start: string, end: string) => {
    if (end > start) {
      return bookingTime >= start && bookingTime <= end;
    } else {
      // Crossing midnight
      return bookingTime >= start || bookingTime <= end;
    }
  };

  const getRestaurantTime = (date: Date | string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date));
  };

  const filteredStats = useMemo(() => {
    if (!stats || !selectedService) return null;

    const [start, end] = selectedService!.split("-");
    const filtered = upcomingBookings.filter(b => {
      const time = getRestaurantTime(b.bookingDate);
      return isTimeInService(time, start, end);
    });

    return {
      bookings: filtered.length,
      guests: filtered.reduce((acc, b) => acc + b.guests, 0),
    };
  }, [stats, selectedService, upcomingBookings]);

  const filteredUpcomingBookings = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    let base = upcomingBookings.filter(b => b.bookingDate.startsWith(dateStr));
    
    if (!selectedService) return base;
    const [start, end] = selectedService!.split("-");
    return base.filter(b => {
      const time = getRestaurantTime(b.bookingDate);
      return isTimeInService(time, start, end);
    });
  }, [upcomingBookings, selectedService, selectedDate]);

  const filteredRecentBookings = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    let base = recentBookings.filter(b => b.bookingDate.startsWith(dateStr));

    if (!selectedService) return base;
    const [start, end] = selectedService!.split("-");
    return base.filter(b => {
      const time = getRestaurantTime(b.bookingDate);
      return isTimeInService(time, start, end);
    });
  }, [recentBookings, selectedService, selectedDate]);

  const filteredDayBookings = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    let base = dayBookings.filter(b => b.bookingDate.startsWith(dateStr));

    if (!selectedService) return base;
    const [start, end] = selectedService!.split("-");
    return base.filter(b => {
      const time = getRestaurantTime(b.bookingDate);
      return isTimeInService(time, start, end);
    });
  }, [dayBookings, selectedService, selectedDate]);

  // Refresh Logic
  useEffect(() => {
    fetchStats();
    // Refresh every minute to keep "Active Bookings" live
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [id, fetchStats]);

  // Reset selected service when date changes
  useEffect(() => {
    setSelectedService(null);
  }, [selectedDate]);

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

  const handleMoveTable = async (bookingId: string, tableId: string, zoneId: string) => {
    try {
      setIsMoving(true);
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/table`, { tableId, zoneId });
      toast.success("Table mise à jour");
      setBookingToMove(null);
      fetchStats();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la table");
    } finally {
      setIsMoving(false);
    }
  };

  const handleDismissBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/dismiss`);
      toast.success("Table libérée");
      fetchStats();
    } catch (error) {
      toast.error("Erreur lors de la libération de la table");
    }
  };

  const handleToggleTableClosure = async (tableId: string, startTime?: string, endTime?: string, date?: Date) => {
    try {
      const targetDate = date || selectedDate;
      await api.patch(`/restaurants/${id}/tables/${tableId}/toggle-closure`, {
        startTime,
        endTime,
        date: format(targetDate, "yyyy-MM-dd"),
      });
      if (context?.refreshRestaurant) {
        await context.refreshRestaurant();
      }
      fetchStats();
    } catch (error) {
      toast.error("Erreur lors de la modification du statut de la table");
    }
  };

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

  if (loading && !stats) {
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
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{"Tableau de Bord"}</h2>
          <p className="text-muted-foreground">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Aperçu de votre activité pour aujourd'hui." 
              : `Aperçu de votre activité pour le ${format(selectedDate, "dd MMMM yyyy", { locale: fr })}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {context?.restaurant && (
            <>
              <Button
                variant={isFullDayClosed ? "default" : "outline"}
                className={cn(
                  "font-bold transition-all",
                  isFullDayClosed
                    ? "bg-red-600 hover:bg-red-700 text-white border-red-700"
                    : "text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700",
                )}
                onClick={() => toggleTodayClosure()}
                disabled={isTogglingClosure}
              >
                {isTogglingClosure ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isFullDayClosed ? (
                  <Clock className="h-4 w-4 mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {isFullDayClosed ? `Réouvrir le ${format(selectedDate, "dd/MM")}` : `Fermer le ${format(selectedDate, "dd/MM")}`}
              </Button>

              <Button variant="outline" asChild>
                <Link to={`/restaurants/infos/${context.restaurant._id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {"Voir la page publique"}
                </Link>
              </Button>
            </>
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
            <div className="text-2xl font-bold text-primary">{filteredStats?.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">{filteredStats?.guests || 0} couvert(s) prévus</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupation actuelle</CardTitle>
            <Armchair className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.activeBookings?.length || 0} / {context?.restaurant?.capacity || 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Tables occupées en ce moment{" "}
              {(() => {
                if (!context?.restaurant?.openingHours) return null;
                const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const now = new Date();
                const today = days[now.getDay()];
                const schedule = (context.restaurant.openingHours as any)[today];

                if (!schedule || schedule.isClosed || !schedule.periods?.length)
                  return <span className="text-muted-foreground/60">(Fermé)</span>;

                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const currentPeriod = schedule.periods.find((p: any) => {
                  const [startH, startM] = p.open.split(":").map(Number);
                  const [endH, endM] = p.close.split(":").map(Number);
                  const start = startH * 60 + startM;
                  const end = endH * 60 + endM;
                  // Handle overnight? Assuming simple day hours for now as per typical restaurant logic
                  return currentMinutes >= start && currentMinutes < end;
                });

                if (currentPeriod) {
                  return (
                    <span>
                      ({currentPeriod.open} - {currentPeriod.close})
                    </span>
                  );
                }

                return <span className="text-muted-foreground/60">(Fermé)</span>;
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux clients</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Dans votre base de données</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Column: Table Plan Map */}
        {hasTablePlan && context?.restaurant && (
          <DashboardTablePlan 
            restaurant={context.restaurant} 
            bookings={filteredDayBookings} 
            selectedDate={selectedDate}
            selectedService={selectedService}
            onDismiss={handleDismissBooking} 
            onToggleTableClosure={handleToggleTableClosure}
          />
        )}

        {/* Right Column: Recent Bookings */}
        <Card className={cn("border-primary/10 shadow-sm overflow-hidden flex flex-col", hasTablePlan ? "col-span-1" : "lg:col-span-3")}>
          <CardHeader className="bg-muted/30 border-b py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  {"Réservations du service"}
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                  {"Pour le service sélectionné"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 px-2 hover:bg-primary/5 hover:text-primary">
                <Link to={`/restaurant/${id}/bookings`} className="flex items-center">
                  <span className="text-xs font-bold mr-1">Voir tout</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div
              className={cn(
                "max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20",
                hasTablePlan
                  ? "divide-y"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 min-h-[300px] content-start",
              )}
            >
              {filteredRecentBookings.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <Info className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">Aucune réservation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {"Aucune réservation pour ce service"}
                  </p>
                </div>
              ) : (
                filteredRecentBookings.map((booking: any) => {
                  const isPending = booking.status === "PENDING";
                  const isConfirmed = booking.status === "CONFIRMED";
                  const isCancelled = booking.status === "CANCELLED";

                  return (
                    <div
                      key={booking._id}
                      className={cn(
                        "group flex flex-col transition-all relative overflow-hidden",
                        hasTablePlan
                          ? "p-4 gap-3 border-l-4 hover:bg-muted/20"
                          : "p-4 gap-4 rounded-xl border bg-card/60 shadow-sm hover:shadow hover:bg-muted/10 border-l-4",
                        newBookingIds.has(booking._id)
                          ? "bg-primary/5 border-l-primary"
                          : hasTablePlan
                            ? "border-l-transparent"
                            : "border-l-muted-foreground/20",
                        isPending && "border-l-yellow-500",
                        isConfirmed && "border-l-green-500",
                        isCancelled && "border-l-red-500 opacity-60",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Compact Date Box */}
                        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-1.5 min-w-[3.2rem] border shadow-sm">
                          <span className="text-[9px] font-black uppercase text-muted-foreground/80">
                            {format(new Date(booking.bookingDate), "MMM", { locale: fr })}
                          </span>
                          <span className="text-lg font-black leading-none">{format(new Date(booking.bookingDate), "dd")}</span>
                          <span className="text-[9px] font-black text-primary mt-1">{format(new Date(booking.bookingDate), "HH:mm")}</span>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("font-bold text-sm truncate", isCancelled && "line-through")}>{booking.customer.name}</span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] h-4 px-1.5 uppercase tracking-widest font-black leading-none",
                                getStatusColor(booking.status),
                              )}
                            >
                              {booking.status === "PENDING" ? "Attente" : isConfirmed ? "Confirmée" : isCancelled ? "Annulée" : "B?"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1 font-bold text-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                              <Users className="h-3 w-3" />
                              {booking.guests}
                            </span>
                            {!hasTablePlan && booking.customer.phone && (
                              <span className="flex items-center gap-1 font-medium text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-muted/50">
                                <Phone className="h-3 w-3" />
                                {booking.customer.phone}
                              </span>
                            )}
                            {hasTablePlan && booking.tableLabel && (
                              <span className="flex items-center gap-1 text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                                <Armchair className="h-3 w-3" />
                                {booking.tableLabel}
                              </span>
                            )}
                            {booking.notes && (
                              <div className="flex items-start gap-1 w-full mt-1 p-2 bg-muted/30 rounded border border-dashed text-[10px] italic">
                                <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="truncate">{booking.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      {!isCancelled && (
                        <div className="flex items-center gap-2 pt-1 mt-1 border-t border-dashed border-muted-foreground/10">
                          {isPending && (
                            <Button
                              size="sm"
                              className="h-8 text-[10px] font-bold flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                              onClick={() => updateStatus(booking._id, "CONFIRMED")}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accepter
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "h-8 text-[10px] font-bold flex-1 hover:bg-red-50 hover:text-red-600 transition-colors",
                              isPending ? "text-red-400" : "text-muted-foreground",
                            )}
                            onClick={() => setBookingToCancel(booking._id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            {isPending ? "Refuser" : "Annuler"}
                          </Button>
                          {hasTablePlan && isConfirmed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[10px] font-bold flex-1 border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => setBookingToMove(booking)}
                            >
                              <MoveHorizontal className="h-3 w-3 mr-1" />
                              Déplacer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Agenda Menu */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-background/60 backdrop-blur-xl border border-primary/20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-background/80 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] group">
        <div className="flex items-center gap-1 pl-2 pr-1 border-r border-primary/10">
          <CalendarDays className="h-4 w-4 text-primary opacity-70" />
          <span className="text-xs font-bold text-primary/80 uppercase tracking-wider px-1">Agenda</span>
        </div>

        <div className="px-2">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => date && setSelectedDate(date)}
            dateFormat="dd MMM"
            locale={fr}
            popperPlacement="top"
            customInput={
              <button className="h-9 px-4 rounded-full font-semibold hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                {format(selectedDate, "dd MMM", { locale: fr })}
              </button>
            }
          />
        </div>

        {todayServices.length > 0 && (
          <Select value={selectedService || ""} onValueChange={setSelectedService}>
            <SelectTrigger className="bg-transparent border-none shadow-none focus:ring-0 h-9 px-3 font-medium rounded-full hover:bg-primary/5 transition-colors w-[150px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent className="mb-2" side="top">
              {todayServices.map((s: any, i: number) => (
                <SelectItem key={i} value={`${s.open}-${s.close}`}>
                  {`Service ${i + 1} (${s.open})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all ml-1"
          onClick={() => setSelectedDate(new Date())}
          title="Revenir à aujourd'hui"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>

      {/* Move Table Dialog */}
      <Dialog open={!!bookingToMove} onOpenChange={(open) => !open && setBookingToMove(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoveHorizontal className="h-5 w-5 text-primary" />
              Réassigner une table
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Client</p>
                <p className="font-bold">{bookingToMove?.customer.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Couverts</p>
                <p className="font-bold text-right">{bookingToMove?.guests}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Sélectionner la nouvelle table</label>
              <Select
                disabled={isMoving}
                defaultValue={
                  bookingToMove?.tableId && bookingToMove?.zoneId ? `${bookingToMove.tableId}|${bookingToMove.zoneId}` : undefined
                }
                onValueChange={(val) => {
                  if (bookingToMove) {
                    const [tid, zid] = val.split("|");
                    handleMoveTable(bookingToMove._id, tid, zid);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une table" />
                </SelectTrigger>
                <SelectContent>
                  {context?.restaurant?.zones?.map((zone) => (
                    <div key={zone.id}>
                      <div className="px-2 py-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/30">
                        {zone.name}
                      </div>
                      {zone.tables.map((table) => (
                        <SelectItem key={table.id} value={`${table.id}|${zone.id}`}>
                          Table {table.label} ({table.seats} places)
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
