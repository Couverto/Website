import { cn } from "@/lib/utils";
import { PRICES } from "@/constants/restaurantResources";

interface PriceIndicatorProps {
  value: string; // "$", "$$", "$$$", "$$$$", "$$$$$"
  className?: string;
  variant?: "default" | "compact";
}

export const PriceIndicator = ({ value, className, variant = "default" }: PriceIndicatorProps) => {
  const priceData = PRICES.find((p) => p.value === value);
  const count = value.length;
  const maxBars = 5;

  if (!priceData) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-foreground/10",
        variant === "default" ? "px-3 py-1.5" : "px-2.5 py-1",
        className,
      )}
    >
      {/* Segmented bars with gradient */}
      <div className="flex items-end gap-[2px]">
        {Array.from({ length: maxBars }).map((_, i) => {
          const isActive = i < count;
          // Each bar slightly taller than the last
          const heightClass =
            variant === "default" ? ["h-1.5", "h-2", "h-2.5", "h-3", "h-3.5"][i] : ["h-1", "h-1.5", "h-2", "h-2.5", "h-3"][i];

          return (
            <div
              key={i}
              className={cn(
                "rounded-[1px] transition-all duration-300",
                variant === "default" ? "w-[4px]" : "w-[3px]",
                heightClass,
                isActive ? "bg-primary" : "bg-foreground/10 dark:bg-white/15",
              )}
              style={isActive ? { opacity: 0.35 + (i / (maxBars - 1)) * 0.65 } : undefined}
            />
          );
        })}
      </div>
      {/* Range text */}
      <span
        className={cn(
          "font-semibold text-foreground/80 dark:text-white/80 whitespace-nowrap",
          variant === "default" ? "text-[11px]" : "text-[10px]",
        )}
      >
        {priceData.range}
      </span>
    </div>
  );
};
