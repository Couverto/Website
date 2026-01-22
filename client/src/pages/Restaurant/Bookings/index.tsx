import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, MoreHorizontal, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSocketContext } from "@/contexts/socketContext";
import { BookingInterface, BookingStatus } from "@/interfaces/Booking";

export const RestaurantBookings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { socket } = useSocketContext(); // access socket
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [id, page, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const response = await api.get(`/bookings/restaurant/${id}`, { params });
      setBookings(response.data.bookings);
      setTotalPages(response.data.totalPages);
      setCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  /* Socket & Audio */
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: BookingInterface) => {
        // Play sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        const playPromise = audio.play();

        playPromise.catch((e) => {
          console.error("Audio play failed", e);
        });

        // Add to list and mark as new
        setBookings((prev) => [newBooking, ...prev]);
        setTotalPages((prev) => Math.ceil((count + 1) / 20)); // Approximate update
        setCount((prev) => prev + 1);

        // Add visual indicator
        setNewBookingIds((prev) => new Set(prev).add(newBooking._id));

        toast.info(t("pages.restaurant.bookings.new_booking_notification"), {
          action: {
            label: "🔊",
            onClick: () => audio.play(),
          },
        });
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
        // We probably don't want to leave the room if we just unmount this component?
        // Or maybe we do. Socket.io rooms are server side.
        // There is no "leaveRoom" exposed on client usually without custom event.
        // Server cleans up on disconnect.
        // If the user navigates away, they probably don't need updates for this restaurant specifically?
        // But they are still logged in.
        // It's fine to stay in the room or we can add a leave event if needed. For now, keep it simple.
      };
    }
  }, [socket, id, count]); // Count dependency still iffy for handlers but let's keep it consistent with previous logic or fix it.
  // Actually, 'count' is used inside handleNewBooking, so we need it in dependency or use functional update.
  // I used functional update for setBookings and setNewBookingIds.
  // But setCount(prev => prev + 1) is fine.
  // setTotalPages uses count. I should use functional update or reference.
  // Better to just depend on socket/id and use functional updates correctly.

  // FIX: Refactor handleNewBooking to not depend on stale closures if possible, or just depend on 'count'.
  // Since we reconstruct the listener when 'count' changes, it works but it's slight overhead (re-binding listener).
  // It's acceptable for this scale.

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/restaurant/${id}/${bookingId}/status`, { status: newStatus });
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus as BookingStatus } : b)));

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.bookings.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.bookings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("pages.restaurant.bookings.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                {t("pages.restaurant.bookings.search")}
              </Button>
            </form>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("pages.restaurant.bookings.filter_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pages.restaurant.bookings.all")}</SelectItem>
                <SelectItem value="PENDING">{t("pages.account.bookings_page.status.PENDING")}</SelectItem>
                <SelectItem value="CONFIRMED">{t("pages.account.bookings_page.status.CONFIRMED")}</SelectItem>
                <SelectItem value="CANCELLED">{t("pages.account.bookings_page.status.CANCELLED")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("pages.restaurant.bookings.no_bookings")}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("pages.restaurant.bookings.date")}</TableHead>
                    <TableHead>{t("pages.restaurant.bookings.customer")}</TableHead>
                    <TableHead>{t("pages.restaurant.bookings.guests")}</TableHead>
                    <TableHead>{t("pages.restaurant.bookings.status")}</TableHead>
                    <TableHead>{t("pages.restaurant.bookings.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {format(new Date(booking.bookingDate), "dd MMM yyyy", { locale: fr })}
                            {newBookingIds.has(booking._id) && (
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{format(new Date(booking.bookingDate), "HH:mm", { locale: fr })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(booking.status)}>
                          {t(`pages.account.bookings_page.status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">{t("pages.restaurant.bookings.showing", { count })}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    {t("pages.restaurant.bookings.previous")}
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                    {t("pages.restaurant.bookings.next")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
