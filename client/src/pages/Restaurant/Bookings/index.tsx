import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import { RestaurantContext } from "@/interfaces/Components";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/customs/dataTable";
import { getColumns } from "./columns";
import { useOutletContext } from "react-router-dom";

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
  const { id } = useParams();
  const { availablePages } = useOutletContext<RestaurantContext>();
  const { socket } = useSocketContext();
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const hasTablePlan = availablePages?.includes("tablePlan") ?? false;

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

        toast.info("Nouvelle réservation reçue !");
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id]);

  const updateStatus = useCallback(
    async (bookingId: string, newStatus: string, reason?: string) => {
      try {
        await api.patch(`/bookings/restaurant/${id}/${bookingId}/status`, { status: newStatus, reason });
        setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus as BookingStatus } : b)));

        // Remove "new" indicator if action taken
        setNewBookingIds((prev) => {
          if (!prev.has(bookingId)) return prev;
          const next = new Set(prev);
          next.delete(bookingId);
          return next;
        });

        toast.success("Statut mis à jour");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour");
      }
    },
    [id],
  );

  /* Dialogs State */
  const [selectedBooking, setSelectedBooking] = useState<BookingInterface | null>(null);
  const [actionType, setActionType] = useState<"CONFIRM" | "CANCEL" | null>(null);
  const [cancellationReason, setCancellationReason] = useState(
    "Bonjour, nous sommes sincèrement désolés de vous informer que votre réservation a dû être annulée par l’établissement en raison d’un imprévu indépendant de notre volonté. Nous comprenons la gêne que cela peut occasionner et vous présentons toutes nos excuses. N’hésitez pas à reprendre contact avec nous pour toute question ou pour effectuer une nouvelle réservation, nous restons à votre disposition pour vous accompagner.",
  );

  const handleAction = useCallback((action: "CONFIRM" | "CANCEL", booking: BookingInterface) => {
    setSelectedBooking(booking);
    setActionType(action);
  }, []);

  const handleConfirmAction = async () => {
    if (!selectedBooking) return;
    try {
      await updateStatus(selectedBooking._id, "CONFIRMED");
    } finally {
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const handleCancelAction = async () => {
    if (!selectedBooking) return;
    try {
      await updateStatus(selectedBooking._id, "CANCELLED", cancellationReason);
    } finally {
      // Reset reason
      setCancellationReason(
        "Bonjour, nous sommes sincèrement désolés de vous informer que votre réservation a dû être annulée par l’établissement en raison d’un imprévu indépendant de notre volonté. Nous comprenons la gêne que cela peut occasionner et vous présentons toutes nos excuses. N’hésitez pas à reprendre contact avec nous pour toute question ou pour effectuer une nouvelle réservation, nous restons à votre disposition pour vous accompagner.",
      );
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const columns = useMemo(() => getColumns(handleAction, hasTablePlan), [handleAction, hasTablePlan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{"Réservations"}</h1>
        <p className="text-muted-foreground">{"Gérez toutes les réservations de votre restaurant"}</p>
      </div>

      <div className="bg-card rounded-md border p-4">
        <DataTable
          columns={columns}
          data={bookings}
          dataCount={count}
          fetchData={fetchWithState}
          isLoading={loading}
          callback={() => {}}
          searchElement="name"
          onSearch={onSearchChange}
        />
      </div>

      {/* Global Confirmation Dialog */}
      <AlertDialog open={actionType === "CONFIRM" && !!selectedBooking} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action changera le statut de la réservation à "Confirmée" et informera le client.
              {hasTablePlan && selectedBooking?.tableLabel && (
                <div className="mt-2 p-2 bg-primary/5 border border-primary/10 rounded-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Table assignée:</span>
                  <p className="font-bold text-lg">
                    {selectedBooking.tableLabel} ({selectedBooking.zoneName || "Salle"})
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Cancellation Dialog */}
      <AlertDialog open={actionType === "CANCEL" && !!selectedBooking} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
            </AlertDialogDescription>
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
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelAction();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Annuler la réservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
