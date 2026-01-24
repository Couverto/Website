import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Clock, Moon, Sun } from "lucide-react";
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              schedule[day].isClosed ? "bg-muted/30 border-muted-foreground/10 opacity-70" : "bg-background border-primary/10 shadow-sm"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-[140px]">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${schedule[day].isClosed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <Label className="font-bold capitalize text-base">{dayLabels[day]}</Label>
              </div>

              <div className="flex items-center gap-6 flex-1 justify-end">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-muted-foreground/10">
                  <span
                    className={`text-[10px] font-black uppercase tracking-tighter ${schedule[day].isClosed ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Fermé
                  </span>
                  <Switch
                    checked={!schedule[day].isClosed}
                    onCheckedChange={() => handleToggleClosed(day)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-tighter ${!schedule[day].isClosed ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Ouvert
                  </span>
                </div>

                {!schedule[day].isClosed && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPeriod(day)}
                    className="h-9 px-3 border-primary/20 hover:bg-primary/5 text-primary rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un créneau
                  </Button>
                )}
              </div>
            </div>

            {!schedule[day].isClosed && schedule[day].periods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedule[day].periods.map((period, idx) => (
                  <div key={idx} className="flex items-center gap-2 group animate-in slide-in-from-left-2 duration-300">
                    <div className="relative flex-1">
                      <Input
                        type="time"
                        value={period.open}
                        onChange={(e) => handlePeriodChange(day, idx, "open", e.target.value)}
                        className="h-10 rounded-xl border-primary/10 focus:border-primary pl-9"
                      />
                      <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground font-bold"> - </span>
                    <div className="relative flex-1">
                      <Input
                        type="time"
                        value={period.close}
                        onChange={(e) => handlePeriodChange(day, idx, "close", e.target.value)}
                        className="h-10 rounded-xl border-primary/10 focus:border-primary pl-9"
                      />
                      <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    {schedule[day].periods.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePeriod(day, idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
