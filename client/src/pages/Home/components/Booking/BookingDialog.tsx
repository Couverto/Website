import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { useState } from "react";
import { BookingDialogProps } from "@/interfaces/Components";

export const BookingDialog = ({ open, onOpenChange, restaurant, initialData }: BookingDialogProps) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    // Keep dialog open for a moment to show success or switch to success view
    // For now, let's close it after a short delay or just let the user close it?
    // Better UX: Show a success message inside the dialog
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset success state after closing
    setTimeout(() => setSuccess(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{success ? "Réservation Confirmée !" : `Réserver une table chez ${restaurant.name}`}</DialogTitle>
          <DialogDescription>
            {success ? "Au plaisir de vous recevoir." : "Remplissez les détails ci-dessous pour confirmer votre réservation."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-center text-muted-foreground">
              {"Votre réservation a été créée avec succès. Vous recevrez une confirmation sous peu."}
            </p>
            <Link to="/account/bookings" className="text-primary font-medium hover:underline" onClick={handleClose}>
              {"Voir mes réservations"}
            </Link>
            <button onClick={handleClose} className="text-muted-foreground text-sm hover:underline">
              {"Fermer"}
            </button>
          </div>
        ) : (
          <BookingForm restaurant={restaurant} onSuccess={handleSuccess} initialData={initialData} />
        )}
      </DialogContent>
    </Dialog>
  );
};
