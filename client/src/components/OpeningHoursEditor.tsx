import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Clock } from "lucide-react";

const dayLabels: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

interface Period {
  open: string;
  close: string;
}

interface DaySchedule {
  isClosed: boolean;
  periods: Period[];
}

interface OpeningHoursEditorProps {
  value: Record<string, DaySchedule>;
  onChange: (value: Record<string, DaySchedule>) => void;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const OpeningHoursEditor = ({ value = {}, onChange }: OpeningHoursEditorProps) => {
  // Initialize if empty
  const schedule = DAYS.reduce(
    (acc, day) => {
      acc[day] = value[day] || { isClosed: false, periods: [{ open: "12:00", close: "14:00" }] };
      return acc;
    },
    {} as Record<string, DaySchedule>,
  );

  const handleToggleClosed = (day: string) => {
    const updated = { ...schedule };
    updated[day].isClosed = !updated[day].isClosed;
    onChange(updated);
  };

  const handleAddPeriod = (day: string) => {
    const updated = { ...schedule };
    updated[day].periods.push({ open: "19:00", close: "22:00" });
    onChange(updated);
  };

  const handleRemovePeriod = (day: string, index: number) => {
    const updated = { ...schedule };
    updated[day].periods.splice(index, 1);
    onChange(updated);
  };

  const handlePeriodChange = (day: string, index: number, field: keyof Period, time: string) => {
    const updated = { ...schedule };
    updated[day].periods[index][field] = time;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
              schedule[day].isClosed ? "bg-muted/30 border-muted-foreground/10 opacity-70" : "bg-background border-primary/10 shadow-sm"
            }`}
          >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Day Name */}
              <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                <div
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${schedule[day].isClosed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Label className="font-bold capitalize text-sm sm:text-base">{dayLabels[day]}</Label>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 px-2 sm:px-3 py-1.5 rounded-full border border-muted-foreground/10 flex-shrink-0">
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${schedule[day].isClosed ? "text-primary" : "text-muted-foreground"}`}
                >
                  Fermé
                </span>
                <Switch
                  checked={!schedule[day].isClosed}
                  onCheckedChange={() => handleToggleClosed(day)}
                  className="data-[state=checked]:bg-primary scale-90 sm:scale-100"
                />
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${!schedule[day].isClosed ? "text-primary" : "text-muted-foreground"}`}
                >
                  Ouvert
                </span>
              </div>
            </div>

            {/* Periods */}
            {!schedule[day].isClosed && (
              <div className="mt-4 pt-4 border-t border-primary/5 space-y-3">
                <div className="space-y-3">
                  {schedule[day].periods.map((period, idx) => (
                    <div
                      key={idx}
                      className="group/slot relative flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 animate-in slide-in-from-left-2"
                    >
                      {/* Time inputs */}
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="relative flex-1 min-w-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">
                            De
                          </span>
                          <Input
                            type="time"
                            value={period.open}
                            onChange={(e) => handlePeriodChange(day, idx, "open", e.target.value)}
                            className="h-10 w-full rounded-xl border-primary/5 focus:border-primary pl-8 sm:pl-10 bg-background/50 text-sm font-semibold"
                          />
                        </div>
                        <div className="w-2 h-px bg-muted-foreground/20 flex-shrink-0" />
                        <div className="relative flex-1 min-w-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">
                            À
                          </span>
                          <Input
                            type="time"
                            value={period.close}
                            onChange={(e) => handlePeriodChange(day, idx, "close", e.target.value)}
                            className="h-10 w-full rounded-xl border-primary/5 focus:border-primary pl-8 sm:pl-10 bg-background/50 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      {schedule[day].periods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePeriod(day, idx)}
                          className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 sm:opacity-0 sm:group-hover/slot:opacity-100 self-end sm:self-auto flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add period button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPeriod(day)}
                  className="w-full sm:w-auto h-9 px-3 border-primary/20 hover:bg-primary/5 text-primary rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un créneau
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
