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

            {!schedule[day].isClosed && (
              <div className="mt-4 pt-4 border-t border-primary/5 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {schedule[day].periods.map((period, idx) => (
                    <div
                      key={idx}
                      className="group/slot relative flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 animate-in slide-in-from-left-2 duration-300"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">
                            De
                          </span>
                          <Input
                            type="time"
                            value={period.open}
                            onChange={(e) => handlePeriodChange(day, idx, "open", e.target.value)}
                            className="h-10 rounded-xl border-primary/5 focus:border-primary pl-10 bg-background/50 text-sm font-semibold"
                          />
                        </div>
                        <div className="w-2 h-px bg-muted-foreground/20" />
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">
                            À
                          </span>
                          <Input
                            type="time"
                            value={period.close}
                            onChange={(e) => handlePeriodChange(day, idx, "close", e.target.value)}
                            className="h-10 rounded-xl border-primary/5 focus:border-primary pl-10 bg-background/50 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      {schedule[day].periods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePeriod(day, idx)}
                          className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover/slot:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
