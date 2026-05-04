import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Trash2, Plus, AlertCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

interface ExceptionalOpening {
  startDate: Date | string;
  endDate: Date | string;
  reason?: string;
  periods: { open: string; close: string }[];
}

interface ExceptionalOpeningsEditorProps {
  value?: ExceptionalOpening[];
  onChange: (value: ExceptionalOpening[]) => void;
}

export const ExceptionalOpeningsEditor = ({ value = [], onChange }: ExceptionalOpeningsEditorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [newOpening, setNewOpening] = useState<ExceptionalOpening>({
    startDate: tomorrow,
    endDate: tomorrow,
    reason: "",
    periods: [{ open: "12:00", close: "14:00" }],
  });

  const handleAdd = () => {
    // Basic validation
    if (!newOpening.startDate || !newOpening.endDate) return;
    if (newOpening.periods.length === 0 || newOpening.periods.some((p) => !p.open || !p.close)) return;

    // Ensure startDate <= endDate
    let start = new Date(newOpening.startDate);
    let end = new Date(newOpening.endDate);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    // Normalize to UTC noon to avoid timezone offset issues (local midnight can shift YYYY-MM-DD)
    const normalizeToUTCNoon = (d: Date) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      return new Date(Date.UTC(y, m, day, 12, 0, 0, 0));
    };

    const openingToAdd = {
      startDate: normalizeToUTCNoon(start),
      endDate: normalizeToUTCNoon(end),
      reason: newOpening.reason || undefined,
      periods: newOpening.periods,
    };

    onChange([...value, openingToAdd]);
    setIsAdding(false);
    setNewOpening({
      startDate: tomorrow,
      endDate: tomorrow,
      reason: "",
      periods: [{ open: "12:00", close: "14:00" }],
    });
  };

  const handleDelete = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const addPeriod = () => {
    setNewOpening({
      ...newOpening,
      periods: [...newOpening.periods, { open: "19:00", close: "23:00" }],
    });
  };

  const removePeriod = (index: number) => {
    if (newOpening.periods.length <= 1) return; // Must keep at least one
    const newPeriods = [...newOpening.periods];
    newPeriods.splice(index, 1);
    setNewOpening({ ...newOpening, periods: newPeriods });
  };

  const updatePeriod = (index: number, field: "open" | "close", value: string) => {
    const newPeriods = [...newOpening.periods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setNewOpening({ ...newOpening, periods: newPeriods });
  };

  return (
    <div className="space-y-4">
      {/* List of existing openings */}
      <div className="space-y-2">
        {value.length === 0 && !isAdding && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2 py-2">
            <AlertCircle className="h-4 w-4" />
            Aucune ouverture exceptionnelle programmée.
          </div>
        )}

        {value.map((opening, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-2 rounded-full">
                <CalendarIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  Du {format(new Date(opening.startDate), "dd MMMM yyyy", { locale: fr })} au{" "}
                  {format(new Date(opening.endDate), "dd MMMM yyyy", { locale: fr })}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {opening.periods.map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] bg-green-500/10 text-green-700 border-green-200">
                      {p.open} - {p.close}
                    </Badge>
                  ))}
                </div>
                {opening.reason && <div className="text-xs text-muted-foreground mt-0.5">{opening.reason}</div>}
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

      {/* Add New Opening Form */}
      {isAdding ? (
        <div className="p-4 border rounded-lg bg-green-50/30 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label className="mb-2">Date de début</Label>
              <div className="relative">
                <DatePicker
                  selected={new Date(newOpening.startDate)}
                  onChange={(date: Date | null) => date && setNewOpening({ ...newOpening, startDate: date })}
                  locale="fr"
                  dateFormat="dd/MM/yyyy"
                  minDate={tomorrow}
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
                  selected={new Date(newOpening.endDate)}
                  onChange={(date: Date | null) => date && setNewOpening({ ...newOpening, endDate: date })}
                  locale="fr"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date(newOpening.startDate)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>

          {/* Periods (Horaires) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horaires d'ouverture
            </Label>
            {newOpening.periods.map((period, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={period.open}
                  onChange={(e) => updatePeriod(index, "open", e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">à</span>
                <Input
                  type="time"
                  value={period.close}
                  onChange={(e) => updatePeriod(index, "close", e.target.value)}
                  className="w-32"
                />
                {newOpening.periods.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removePeriod(index)} className="h-8 w-8">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPeriod} className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Ajouter un service
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Raison (optionnel)</Label>
            <Input
              placeholder="Ex: Jour férié, Événement spécial..."
              value={newOpening.reason}
              onChange={(e) => setNewOpening({ ...newOpening, reason: e.target.value })}
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
          Ajouter une ouverture exceptionnelle
        </Button>
      )}
    </div>
  );
};
