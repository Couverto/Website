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

  if (!priceData) return null;

  const getTheme = () => {
    switch (count) {
      case 1: // $
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      case 2: // $$
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800";
      case 3: // $$$
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800";
      case 4: // $$$$
        return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm";
      case 5: // $$$$$
        return "bg-slate-950 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-stretch rounded-full border overflow-hidden transition-all duration-300",
        variant === "default" ? "h-7" : "h-6",
        getTheme(),
        className,
      )}
    >
      {/* Dollars side */}
      <div
        className={cn(
          "flex items-center justify-center border-r border-current/20 font-black tracking-tight",
          variant === "default" ? "px-2.5 text-sm" : "px-2 text-[11px]",
        )}
      >
        {value}
      </div>

      {/* Range side */}
      <div
        className={cn(
          "flex items-center justify-center font-bold whitespace-nowrap",
          variant === "default" ? "px-3 text-[11px]" : "px-2.5 text-[10px]",
        )}
      >
        {priceData.range}
      </div>
    </div>
  );
};
