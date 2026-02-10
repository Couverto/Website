import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

interface ExceptionalClosure {
  startDate: Date | string;
  endDate: Date | string;
  reason?: string;
}

interface ExceptionalClosuresEditorProps {
  value?: ExceptionalClosure[];
  onChange: (value: ExceptionalClosure[]) => void;
}

export const ExceptionalClosuresEditor = ({ value = [], onChange }: ExceptionalClosuresEditorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newClosure, setNewClosure] = useState<ExceptionalClosure>({
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
  });

  const handleAdd = () => {
    // Basic validation
    if (!newClosure.startDate || !newClosure.endDate) return;

    // Ensure startDate <= endDate. If not, swap or error? Let's swap for UX.
    let start = new Date(newClosure.startDate);
    let end = new Date(newClosure.endDate);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    const closureToAdd = {
      startDate: start,
      endDate: end,
      reason: newClosure.reason,
    };

    onChange([...value, closureToAdd]);
    setIsAdding(false);
    setNewClosure({ startDate: new Date(), endDate: new Date(), reason: "" });
  };

  const handleDelete = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {/* List of existing closures */}
      <div className="space-y-2">
        {value.length === 0 && !isAdding && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2 py-2">
            <AlertCircle className="h-4 w-4" />
            Aucune fermeture exceptionnelle programmée.
          </div>
        )}

        {value.map((closure, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-2 rounded-full">
                <CalendarIcon className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  Du {format(new Date(closure.startDate), "dd MMMM yyyy", { locale: fr })} au{" "}
                  {format(new Date(closure.endDate), "dd MMMM yyyy", { locale: fr })}
                </div>
                {closure.reason && <div className="text-xs text-muted-foreground">{closure.reason}</div>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Closure Form */}
      {isAdding ? (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label className="mb-2">Date de début</Label>
              <div className="relative">
                <DatePicker
                  selected={new Date(newClosure.startDate)}
                  onChange={(date: Date | null) => date && setNewClosure({ ...newClosure, startDate: date })}
                  locale="fr"
                  dateFormat="dd/MM/yyyy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
              </div>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="mb-2">Date de fin</Label>
              <div className="relative">
                <DatePicker
                  selected={new Date(newClosure.endDate)}
                  onChange={(date: Date | null) => date && setNewClosure({ ...newClosure, endDate: date })}
                  locale="fr"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date(newClosure.startDate)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Raison (optionnel)</Label>
            <Input
              placeholder="Ex: Vacances annuelles, Rénovation..."
              value={newClosure.reason}
              onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une fermeture exceptionnelle
        </Button>
      )}
    </div>
  );
};
