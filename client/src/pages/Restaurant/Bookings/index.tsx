import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSocketContext } from "@/contexts/socketContext";
import { BookingInterface, BookingStatus } from "@/interfaces/Booking";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/customs/dataTable";
import { getColumns } from "./columns";

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

export const RestaurantBookings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { socket } = useSocketContext();
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [count, setCount] = useState(0);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  // Memoize fetcher for DataTable
  const fetchBookings = useCallback(
    async (pageIndex: number, pageSize: number) => {
      setLoading(true);
      try {
        const params: any = { page: pageIndex, size: pageSize };
        if (statusFilter !== "all") params.status = statusFilter;
        if (search) params.search = search;

        const response = await api.get(`/bookings/restaurant/${id}`, { params });
        setBookings(response.data.bookings);
        setCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    },
    [id, statusFilter, search],
  );

  const fetchWithState = useCallback(
    (p: number, s: number) => {
      setPageSize(s);
      fetchBookings(p, s);
    },
    [fetchBookings],
  );

  const onSearchChange = useCallback((q: string) => {
    setSearch(q);
  }, []);

  // Trigger fetch when search/filter changes
  useEffect(() => {
    fetchBookings(0, pageSize);
  }, [search, statusFilter, fetchBookings, pageSize]);

  /* Socket & Audio - Real-time updates */
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: BookingInterface) => {
        // Play sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));

        // Add to list
        setBookings((prev) => [newBooking, ...prev]);
        setCount((prev) => prev + 1);

        // Add visual indicator
        setNewBookingIds((prev) => new Set(prev).add(newBooking._id));

        toast.info(t("pages.restaurant.bookings.new_booking_notification"));
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id, t]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.bookings.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.bookings.subtitle")}</p>
      </div>

      <div className="bg-card rounded-md border p-4">
        <DataTable
          columns={getColumns(updateStatus, (id) => setBookingToCancel(id), t, newBookingIds)}
          data={bookings}
          dataCount={count}
          fetchData={fetchWithState}
          isLoading={loading}
          callback={() => {}}
          searchElement="name"
          onSearch={onSearchChange}
        />
      </div>

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
