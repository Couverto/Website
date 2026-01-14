import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookingForm } from "./BookingForm";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantInterface;
}

export const BookingDialog = ({ open, onOpenChange, restaurant }: BookingDialogProps) => {
  const { t } = useTranslation();
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {success
              ? t("components.booking.dialog.success_title")
              : t("components.booking.dialog.title", { restaurantName: restaurant.name })}
          </DialogTitle>
          <DialogDescription>
            {success ? t("components.booking.dialog.success_description") : t("components.booking.dialog.description")}
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
            <p className="text-center text-muted-foreground">{t("components.booking.dialog.success_message")}</p>
            <button onClick={handleClose} className="text-primary hover:underline">
              {t("components.booking.dialog.close")}
            </button>
          </div>
        ) : (
          <BookingForm restaurant={restaurant} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
};
