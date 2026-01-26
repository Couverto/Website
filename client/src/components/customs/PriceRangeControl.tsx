import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceIndicator } from "./PriceIndicator";
import { PRICES } from "@/constants/restaurantResources";
import { cn } from "@/lib/utils";

interface PriceRangeControlProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

export const PriceRangeControl = ({ value, onChange, error, className }: PriceRangeControlProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-14 text-base border-muted-foreground/20 focus:border-primary transition-all rounded-2xl shadow-sm",
          error && "border-red-500 bg-red-50/30",
          className,
        )}
      >
        <SelectValue placeholder="Sélectionner une gamme de prix" />
      </SelectTrigger>
      <SelectContent className="rounded-2xl border-primary/10 shadow-xl overflow-hidden">
        {PRICES.map((price) => (
          <SelectItem
            key={price.id}
            value={price.value}
            className="h-14 rounded-xl focus:bg-primary/5 transition-colors cursor-pointer m-1"
          >
            <div className="flex items-center gap-4">
              <PriceIndicator value={price.value} />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {price.id === "vlow"
                    ? "Très abordable"
                    : price.id === "low"
                      ? "Abordable"
                      : price.id === "medium"
                        ? "Intermédiaire"
                        : price.id === "high"
                          ? "Chic"
                          : "Luxueux"}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
