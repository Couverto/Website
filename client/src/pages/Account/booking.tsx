import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { BookingInterface, BookingsResponse, BookingStatus } from "@/interfaces/Booking";
import { Calendar as CalendarIcon, Clock, Users, MapPin, Search, X, Pencil, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  t: (key: string, options?: any) => string;
  locale: any;
  isPast: boolean;
}

const BookingCard = ({ booking, onCancel, onEdit, t, locale, isPast }: BookingCardProps) => {
  const restaurant = booking.restaurant;
  const bookingDate = new Date(booking.bookingDate);

  if (!restaurant) {
    return (
      <Card className="overflow-hidden p-6 text-center text-muted-foreground">
        <div>{t("pages.account.bookings_page.restaurant_deleted")}</div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Restaurant Image */}
        <div className="relative h-48 md:h-auto md:w-48 shrink-0">
          <img
            src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <Badge className={cn("absolute top-2 right-2", STATUS_COLORS[booking.status])}>
            {t(`pages.account.bookings_page.status.${booking.status}`)}
          </Badge>
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-4">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
              <div className="flex items-center text-muted-foreground text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{restaurant.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{format(bookingDate, "PPP", { locale })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{format(bookingDate, "HH:mm", { locale })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{t("pages.account.bookings_page.guests", { count: booking.guests })}</span>
                </div>
              </div>

              {booking.notes && <p className="text-sm text-muted-foreground italic mb-4">"{booking.notes}"</p>}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {!isPast && booking.status !== "CANCELLED" && (
                <>
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-1" />
                    {t("pages.account.bookings_page.update_booking")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onCancel}>
                    <X className="w-4 h-4 mr-1" />
                    {t("pages.account.bookings_page.cancel_booking")}
                  </Button>
                </>
              )}
            </div>
          </div>
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "fr" ? fr : enUS;

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

        if (append) {
          setBookings((prev) => [...prev, ...data.bookings]);
        } else {
          setBookings(data.bookings);
        }
        setPage(data.page);
        setTotalPages(data.totalPages);
        setCount(data.count);
      } catch (error: any) {
        toast.error(t(error.response?.data?.error || "server.global.errors.not_found"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, search, t],
  );

  useEffect(() => {
    fetchBookings(0, false);
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLoadMore = () => {
    fetchBookings(page + 1, true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await axiosConfig.patch(`/bookings/${selectedBooking._id}/cancel`);
      toast.success(t("server.bookings.messages.cancelled"));
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings(0, false);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "server.global.errors.not_found"));
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

      await axiosConfig.put(`/bookings/${selectedBooking._id}`, {
        bookingDate: bookingDate.toISOString(),
        guests: editGuests,
      });

      toast.success(t("server.bookings.messages.updated"));
      setEditDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings(0, false);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "server.global.errors.not_found"));
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

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 11;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.account.bookings_page.title")}</CardTitle>
          <CardDescription>{t("pages.account.bookings_page.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("pages.account.bookings_page.search_placeholder")}
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
                <SelectItem value="all">{t("pages.account.bookings_page.filter_all")}</SelectItem>
                <SelectItem value="PENDING">{t("pages.account.bookings_page.filter_pending")}</SelectItem>
                <SelectItem value="CONFIRMED">{t("pages.account.bookings_page.filter_confirmed")}</SelectItem>
                <SelectItem value="CANCELLED">{t("pages.account.bookings_page.filter_cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchBookings(0, false)} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {loading ? (
              <>
                <BookingCardSkeleton />
                <BookingCardSkeleton />
                <BookingCardSkeleton />
              </>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t("pages.account.bookings_page.no_bookings")}</div>
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={() => openCancelDialog(booking)}
                  onEdit={() => openEditDialog(booking)}
                  t={t}
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
                {t("pages.account.bookings_page.load_more")} ({count - bookings.length} {t("pages.account.bookings_page.remaining")})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pages.account.bookings_page.cancel_confirm_title")}</DialogTitle>
            <DialogDescription>{t("pages.account.bookings_page.cancel_confirm_description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {t("global.buttons.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("pages.account.bookings_page.cancel_booking")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pages.account.bookings_page.update_booking")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Date picker */}
            <div className="space-y-2">
              <Label>{t("components.booking.form.date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP", { locale }) : t("components.booking.form.pick_date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={editDate} onSelect={setEditDate} disabled={(date) => date < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time picker */}
            <div className="space-y-2">
              <Label>{t("components.booking.form.time")}</Label>
              <Select value={editTime} onValueChange={setEditTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label>{t("components.booking.form.guests")}</Label>
              <Select value={editGuests.toString()} onValueChange={(v) => setEditGuests(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? t("pages.home.search.person") : t("pages.home.search.people")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("global.buttons.cancel")}
            </Button>
            <Button onClick={handleEditBooking} disabled={actionLoading || !editDate}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("global.buttons.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
