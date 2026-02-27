import { useMemo, useState, useCallback, useEffect } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/customs/dataTable";
import { getColumns } from "./columns";
import { BookingInterface } from "@/interfaces/Booking";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = useCallback(
    async (pageIndex: number, size: number) => {
      setLoading(true);
      try {
        const params: any = { page: pageIndex, size: size };
        if (search) params.search = search;
        // You can add a status filter if needed from the UI state similarly

        const response = await api.get(`/admin/bookings`, { params });
        setBookings(response.data.bookings);
        setBookingCount(response.data.count);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Erreur lors du chargement des réservations");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  const fetchWithState = useCallback(
    (page: number, size: number) => {
      setPageSize(size);
      fetchBookings(page, size);
    },
    [fetchBookings],
  );

  const onSearchChange = useCallback((q: string) => {
    setSearch(q);
  }, []);

  // Use effect for search changes specifically if datatable doesn't trigger it automatically on search change
  useEffect(() => {
    // A small debounce could be added here if needed, but DataTable might handle it
    fetchBookings(0, pageSize);
  }, [search, fetchBookings, pageSize]);

  // Actions State
  const [selectedBooking, setSelectedBooking] = useState<BookingInterface | null>(null);
  const [actionType, setActionType] = useState<"CANCEL" | "DELETE" | "EMAIL" | null>(null);

  const handleAction = useCallback((action: "CANCEL" | "DELETE" | "EMAIL", booking: BookingInterface) => {
    setSelectedBooking(booking);
    setActionType(action);
  }, []);

  const closeDialogs = () => {
    setSelectedBooking(null);
    setActionType(null);
  };

  const executeAction = async () => {
    if (!selectedBooking || !actionType) return;

    setActionLoading(true);
    try {
      switch (actionType) {
        case "CANCEL":
          // using the restaurant endpoint if we want to cancel on behalf, or just a direct admin method?
          // We don't have an admin cancel endpoint yet, so let's hit the general/restaurant cancel or update status.
          // Wait, we didn't add an explicit /admin/bookings/:id/cancel endpoint because the instructions said "Admin actions (Cancel...)"
          // I will use the patch directly on the booking via restaurant endpoint, or an admin patch.
          // Let's use the updateStatus from the restaurant endpoint, or write a dedicated call.
          // Actually, we can just use the update status method if admin is allowed to call it (requires role checking).
          // But since admin can update booking status with the /bookings/restaurant/:id/:bookingId/status endpoint... wait, verifyCollaborator doesn't allow global admin!
          // Okay, let me create a shortcut by using `api.patch("/bookings/restaurant/...")`? No, Admin shouldn't be a collaborator everywhere.
          // Instead, I will use /admin/bookings/:id/status if I had one or just update it via some general one.
          // Wait, I missed adding a specific `updateBookingStatusAdmin` in `adminRoutes.ts` implementation!
          // I'll add an optimistic local update and a fallback. But let's check `api.patch("/admin/bookings/:id/status")` anyway (I'll add it).
          break;
        case "DELETE":
          await api.delete(`/admin/bookings/${selectedBooking._id}`);
          toast.success("Réservation supprimée définitivement.");
          fetchBookings(0, pageSize); // Refresh
          break;
        case "EMAIL":
          await api.post(`/admin/bookings/${selectedBooking._id}/email`);
          toast.success("Email envoyé avec succès.");
          break;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setActionLoading(false);
      closeDialogs();
    }
  };

  // Use the new explicit admin cancel endpoint which handles emails.
  const handleCancelAction = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/bookings/${selectedBooking._id}/cancel`);
      toast.success("Réservation annulée.");
      setBookings((prev) => prev.map((b) => (b._id === selectedBooking._id ? { ...b, status: "CANCELLED" } : b)));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(false);
      closeDialogs();
    }
  };

  const columns = useMemo(() => getColumns(handleAction), [handleAction]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{"Réservations Globales"}</CardTitle>
          <CardDescription>Vue d'ensemble de toutes les réservations sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={bookings}
            dataCount={bookingCount}
            fetchData={fetchWithState}
            isLoading={loading}
            callback={() => {}}
            searchElement="name"
            onSearch={onSearchChange}
          />
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={actionType === "CANCEL"} onOpenChange={(o) => (!o && !actionLoading ? closeDialogs() : undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Un email d'annulation sera envoyé au client avec la mention (Rappel
              Admin).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelAction();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={actionType === "DELETE"} onOpenChange={(o) => (!o && !actionLoading ? closeDialogs() : undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Attention : Cette action est irréversible. La réservation sera complètement effacée de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeAction();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Alert/Confirm Dialog */}
      <AlertDialog open={actionType === "EMAIL"} onOpenChange={(o) => (!o && !actionLoading ? closeDialogs() : undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un rappel email ?</AlertDialogTitle>
            <AlertDialogDescription>
              En envoyant ce rappel, le client recevra à nouveau un email récapitulatif de{" "}
              {selectedBooking?.status === "CANCELLED" ? "l'annulation " : "la réservation "} pour le restaurant{" "}
              <span className="font-semibold text-foreground">{(selectedBooking?.restaurant as any)?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeAction();
              }}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
