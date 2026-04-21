import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, CalendarPlus, Lock, Unlock } from "lucide-react";

interface TableActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableLabel: string;
  isBlocked: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  onCreateBooking: () => void;
}

export const TableActionDialog: React.FC<TableActionDialogProps> = ({
  open,
  onOpenChange,
  tableLabel,
  isBlocked,
  onBlock,
  onUnblock,
  onCreateBooking,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Table {tableLabel}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {isBlocked ? (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-500" />
                Cette table est actuellement bloquée.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => { onUnblock(); onOpenChange(false); }}
              >
                <Unlock className="h-4 w-4 text-green-600" />
                Débloquer la table
              </Button>
              <Button
                className="w-full justify-start gap-2"
                onClick={() => { onUnblock(); onCreateBooking(); onOpenChange(false); }}
              >
                <CalendarPlus className="h-4 w-4" />
                Créer une réservation
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={() => { onBlock(); onOpenChange(false); }}
              >
                <Ban className="h-4 w-4" />
                Bloquer la table
              </Button>
              <Button
                className="w-full justify-start gap-2"
                onClick={() => { onCreateBooking(); onOpenChange(false); }}
              >
                <CalendarPlus className="h-4 w-4" />
                Créer une réservation
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
