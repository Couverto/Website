import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState, useCallback } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { BookingInterface, BookingsResponse, BookingStatus } from "@/interfaces/Booking";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Search,
  X,
  Pencil,
  Loader2,
  RefreshCw,
  Phone,
  Globe,
  Navigation,
  MoreHorizontal,
} from "lucide-react";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";

const STATUS_COLORS: Record<BookingStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface BookingCardProps {
  booking: BookingInterface;
  onCancel: () => void;
  onEdit: () => void;
  locale: any;
  isPast: boolean;
}

const BookingCard = ({ booking, onCancel, onEdit, locale, isPast }: BookingCardProps) => {
  const restaurant = booking.restaurant;
  const bookingDate = new Date(booking.bookingDate);

  if (!restaurant) {
    return (
      <Card className="overflow-hidden p-6 text-center text-muted-foreground">
        <div>{"Restaurant supprimé"}</div>
      </Card>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.adress}, ${restaurant.city}`)}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="flex flex-col md:flex-row h-full relative">
        {/* Restaurant Image */}
        <div className="relative h-48 md:h-auto md:w-64 shrink-0 overflow-hidden">
          <img
            src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute top-3 left-3 z-20">
          <Badge className={cn("shadow-sm", STATUS_COLORS[booking.status])}>
            {booking.status === "PENDING"
              ? "En attente"
              : booking.status === "CONFIRMED"
                ? "Confirmée"
                : booking.status === "CANCELLED"
                  ? "Annulée"
                  : "Brouillon"}
          </Badge>
        </div>

        {/* Booking Details */}
        <div className="flex-1 flex flex-col p-5 space-y-4">
          {/* Header & Main Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1">{restaurant.name}</h3>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                  <span className="truncate">
                    {restaurant.adress}, {restaurant.city}
                  </span>
                </a>
              </div>
              {/* Quick Actions (Desktop mainly, available on mobile too) */}
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <Navigation className="w-4 h-4 mr-2" />
                        {"Y aller"}
                      </a>
                    </DropdownMenuItem>
                    {restaurant.website && (
                      <DropdownMenuItem asChild>
                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          <Globe className="w-4 h-4 mr-2" />
                          {"Site web"}
                        </a>
                      </DropdownMenuItem>
                    )}
                    {restaurant.phone && (
                      <DropdownMenuItem asChild>
                        <a href={`tel:${restaurant.phone}`} className="cursor-pointer">
                          <Phone className="w-4 h-4 mr-2" />
                          {"Appeler"}
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-background rounded-lg shadow-sm border">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{"Date"}</p>
                  <p className="text-sm font-semibold">{format(bookingDate, "PPP", { locale })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-background rounded-lg shadow-sm border">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{"Heure"}</p>
                  <p className="text-sm font-semibold">{format(bookingDate, "HH:mm", { locale })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-background rounded-lg shadow-sm border">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{"Couverts"}</p>
                  <p className="text-sm font-semibold">
                    {booking.guests} personne{booking.guests > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="bg-amber-50 border-amber-100 border text-amber-900 px-4 py-3 rounded-lg text-sm mb-2">
                <span className="font-semibold block mb-0.5">{"Notes"}:</span>"{booking.notes}"
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isPast && booking.status !== "CANCELLED" && (
            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                {"Modifier"}
              </Button>
              <Button variant="destructive" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                {"Annuler"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const BookingCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="flex flex-col md:flex-row">
      <Skeleton className="h-48 md:h-auto md:w-48 shrink-0" />
      <div className="flex-1 p-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  </Card>
);

export const AccountBooking = () => {
  const locale = fr;

  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingInterface | null>(null);

  // Edit form state
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [editGuests, setEditGuests] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        params.append("size", "10");
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (search.trim()) {
          params.append("search", search.trim());
        }

        const response = await axiosConfig.get<BookingsResponse>(`/bookings/my-bookings?${params}`);
        const data = response.data;

        const sortedBookings = [...data.bookings].sort((a, b) => {
          // Rule 1: Cancelled at the bottom
          if (a.status === "CANCELLED" && b.status !== "CANCELLED") return 1;
          if (a.status !== "CANCELLED" && b.status === "CANCELLED") return -1;

          // Rule 2: Chronological order (descending) within groups
          return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
        });

        if (append) {
          setBookings((prev) => [...prev, ...sortedBookings]);
        } else {
          setBookings(sortedBookings);
        }
        setPage(data.page);
        setTotalPages(data.totalPages);
        setCount(data.count);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Une erreur est survenue");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, search],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleLoadMore = () => {
    fetchBookings(page + 1, true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await axiosConfig.patch(`/bookings/${selectedBooking._id}/cancel`);
      toast.success("Réservation annulée avec succès");
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings(0, false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBooking = async () => {
    if (!selectedBooking || !editDate) return;
    setActionLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = editTime.split(":").map(Number);
      const bookingDate = new Date(editDate);
      bookingDate.setHours(hours, minutes);

      // Final validation before sending
      if (
        selectedBooking &&
        (selectedBooking.restaurant as any)?.openingHours &&
        (() => {
          const h = (selectedBooking.restaurant as any).openingHours;
          const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const dayName = dayNames[bookingDate.getDay()];
          const dayInfo = h[dayName];
          return !dayInfo || dayInfo.isClosed || !dayInfo.periods || dayInfo.periods.length === 0;
        })()
      ) {
        toast.error("Le restaurant est fermé ce jour-là");
        return;
      }

      await axiosConfig.put(`/bookings/${selectedBooking._id}`, {
        bookingDate: bookingDate.toISOString(),
        guests: editGuests,
      });

      toast.success("Réservation mise à jour avec succès");
      setEditDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings(0, false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (booking: BookingInterface) => {
    const date = new Date(booking.bookingDate);
    setSelectedBooking(booking);
    setEditDate(date);
    setEditTime(format(date, "HH:mm"));
    setEditGuests(booking.guests);
    setEditDialogOpen(true);
  };

  const openCancelDialog = (booking: BookingInterface) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const isPastBooking = (booking: BookingInterface) => {
    return new Date(booking.bookingDate) < new Date();
  };

  /* Time slots management */
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = useCallback(
    async (date: Date, restaurantId: string) => {
      setLoadingSlots(true);
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const { data } = await axiosConfig.get(`/restaurants/public/${restaurantId}/slots?date=${formattedDate}`);
        setTimeSlots(data.slots || []);
        setAvailability(data.availability || {});

        // If current editTime is not in new slots, clear it (unless it's empty)
        if (editTime && !data.slots.includes(editTime)) {
          setEditTime("");
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        setTimeSlots([]);
        setAvailability({});
      } finally {
        setLoadingSlots(false);
      }
    },
    [editTime],
  );

  // Fetch slots when editDate changes
  useEffect(() => {
    if (editDate && selectedBooking?.restaurant?._id && editDialogOpen) {
      fetchSlots(editDate, selectedBooking.restaurant._id);
    }
  }, [editDate, selectedBooking, editDialogOpen, fetchSlots]);

  // Calculate max guests
  const maxGuests =
    editTime && availability[editTime] !== undefined ? availability[editTime] : (selectedBooking?.restaurant as any)?.capacity || 20;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{"Mes Réservations"}</CardTitle>
          <CardDescription>{"Retrouvez et gérez toutes vos réservations"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={"Rechercher par restaurant..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Toutes"}</SelectItem>
                <SelectItem value="PENDING">{"En attente"}</SelectItem>
                <SelectItem value="CONFIRMED">{"Confirmées"}</SelectItem>
                <SelectItem value="CANCELLED">{"Annulées"}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchBookings(0, false)} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => <BookingCardSkeleton key={i} />)
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{"Aucune réservation trouvée"}</div>
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={() => openCancelDialog(booking)}
                  onEdit={() => openEditDialog(booking)}
                  locale={locale}
                  isPast={isPastBooking(booking)}
                />
              ))
            )}
          </div>

          {/* Load More */}
          {!loading && page + 1 < totalPages && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {"Charger plus"} ({count - bookings.length} {"restantes"})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Annuler cette réservation ?"}</DialogTitle>
            <DialogDescription>{"Cette action ne peut pas être annulée. La réservation sera définitivement annulée."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {"Annuler"}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {"Annuler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
            <DialogDescription>Modifiez la date, l'heure ou le nombre de couverts.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date Picker */}
            <div className="flex flex-col space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("justify-start text-left font-normal", !editDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => setEditDate(date || undefined)}
                    disabled={(date) => {
                      // Prevent selecting past dates
                      if (date < startOfDay(new Date())) return true;

                      // Check opening hours
                      if (!selectedBooking?.restaurant) return false;
                      const h = (selectedBooking.restaurant as any).openingHours;
                      if (!h) return false;
                      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                      const dayName = dayNames[date.getDay()];
                      const dayInfo = h[dayName];
                      return !dayInfo || dayInfo.isClosed || !dayInfo.periods || dayInfo.periods.length === 0;
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Time Picker */}
              <div className="flex flex-col space-y-2">
                <Label>
                  Heure{" "}
                  {editTime && availability[editTime] !== undefined && (
                    <span className="text-[10px] text-muted-foreground ml-1">({availability[editTime]} dispo)</span>
                  )}
                </Label>
                <Select value={editTime} onValueChange={setEditTime} disabled={loadingSlots || !editDate || timeSlots.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={!editDate ? "Date requise" : loadingSlots ? "Wait..." : "Heure"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                    {timeSlots.length === 0 && !loadingSlots && editDate && (
                      <div className="p-2 text-xs text-muted-foreground text-center">Aucun créneau</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Guests Picker */}
              <div className="flex flex-col space-y-2">
                <Label>Couverts</Label>
                <Select value={editGuests ? editGuests.toString() : ""} onValueChange={(v) => setEditGuests(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nb. personnes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "pers." : "pers."}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditBooking} disabled={actionLoading || !editDate || !editTime || !editGuests}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
