import { cn } from "@/lib/utils";

interface FakeTablePlanProps {
  className?: string;
}

export const FakeTablePlan = ({ className }: FakeTablePlanProps) => {
  return (
    <div className={cn("w-full h-full bg-muted/30 p-4 relative overflow-hidden flex items-center justify-center", className)}>
      {/* Floor Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative w-full h-full border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-wrap gap-4 items-center justify-center content-center min-h-[180px]">
        {/* Round Table 1 */}
        <div className="relative w-16 h-16 rounded-full border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Rect Table 2 */}
        <div className="relative w-20 h-14 rounded-md border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="w-12 h-8 rounded-sm bg-green-500/10 border border-green-500/20" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Round Table 3 (Occupied) */}
        <div className="relative w-14 h-14 rounded-full border-2 border-orange-500/30 bg-orange-50/50 shadow-sm flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-600 flex items-center justify-center">
            2
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-orange-500/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-orange-500/20" />
        </div>

        {/* Square Table 4 */}
        <div className="relative w-14 h-14 rounded-md border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      {/* Floating Controls Mockup */}
      <div className="absolute bottom-4 right-4 flex gap-1">
        <div className="w-6 h-6 rounded bg-primary/20" />
        <div className="w-6 h-6 rounded bg-primary/20" />
      </div>
    </div>
  );
};
