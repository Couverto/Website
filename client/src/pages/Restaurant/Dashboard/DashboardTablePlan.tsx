import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Armchair, Users, Info, Map as MapIcon, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { BookingInterface } from "@/interfaces/Booking";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardTablePlanProps {
  restaurant: RestaurantInterface;
  bookings: BookingInterface[];
  onDismiss?: (bookingId: string) => void;
}

export const DashboardTablePlan: React.FC<DashboardTablePlanProps> = ({ restaurant, bookings, onDismiss }) => {
  const [activeZoneId, setActiveZoneId] = useState<string>(restaurant.zones[0]?.id || "");

  const activeZone = useMemo(
    () => restaurant.zones?.find((z: any) => z.id === activeZoneId) || restaurant.zones?.[0],
    [activeZoneId, restaurant.zones],
  );

  // Trust the backend for active bookings window
  const currentBookings = useMemo(() => {
    return bookings.filter((b: BookingInterface) => b.status === "CONFIRMED" || b.status === "PENDING");
  }, [bookings]);

  // Calculate viewport transformation to fit all tables
  const layout = useMemo(() => {
    if (!activeZone?.tables || activeZone.tables.length === 0) {
      return {
        aspectRatio: "4/3",
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: 1,
        contentWidth: 1,
        contentHeight: 1,
      };
    }

    const padding = 20;
    const minX = Math.min(...activeZone.tables.map((t: any) => t.x)) - padding;
    const minY = Math.min(...activeZone.tables.map((t: any) => t.y)) - padding;
    const maxX = Math.max(...activeZone.tables.map((t: any) => t.x + t.width)) + padding;
    const maxY = Math.max(...activeZone.tables.map((t: any) => t.y + t.height)) + padding;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const aspectRatio = `${contentWidth} / ${contentHeight}`;

    return {
      aspectRatio,
      minX,
      minY,
      contentWidth,
      contentHeight,
    };
  }, [activeZone]);

  // Helper to get active booking count for a zone
  const getZoneOccupancy = (zone: any) => {
    if (!zone.tables) return 0;
    return currentBookings.filter((b: BookingInterface) => zone.tables.some((t: any) => String(t.id || t._id) === String(b.tableId)))
      .length;
  };

  if (!restaurant.zones || restaurant.zones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Info className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">Aucun plan de salle défini</p>
          <p className="text-sm text-muted-foreground mt-1">Configurez votre plan de salle pour voir l'occupation en direct</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="bg-muted/30 border-b py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Occupation des tables</CardTitle>
              <CardDescription className="text-xs">Vue en direct de votre salle (+/- 2h)</CardDescription>
            </div>
          </div>

          {restaurant.zones.length > 1 && (
            <Tabs value={activeZoneId} onValueChange={setActiveZoneId} className="w-auto">
              <TabsList className="bg-background/50 border">
                {restaurant.zones.map((zone: any) => {
                  const count = getZoneOccupancy(zone);
                  return (
                    <TabsTrigger key={zone.id} value={zone.id} className="text-xs h-8 gap-2">
                      {zone.name}
                      {count > 0 && (
                        <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full font-bold">
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-muted/20 flex-1 flex flex-col justify-center min-h-0">
        {/* Aspect Ratio Container */}
        <div
          className="relative w-full transition-all duration-500 ease-in-out bg-background/50 rounded-xl border border-dashed border-muted-foreground/20 overflow-hidden shadow-inner mx-auto my-auto"
          style={{ aspectRatio: layout.aspectRatio, maxHeight: "100%" }}
        >
          {/* Legend - top left, above everything */}
          <div className="absolute top-3 left-3 flex gap-3 z-30 bg-background/90 backdrop-blur-sm p-1.5 px-3 rounded-full border shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
              <div className="w-2.5 h-2.5 rounded-full bg-background border-2 border-muted-foreground/30" />
              <span>Libre</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary/30" />
              <span>Occupé</span>
            </div>
          </div>

          <TooltipProvider delayDuration={200}>
            <div className="w-full h-full relative">
              {activeZone?.tables.map((table: any) => {
                const tid = String(table.id || table._id || "");
                const booking = currentBookings.find((b: BookingInterface) => b.tableId && String(b.tableId) === tid);
                const isOccupied = !!booking;

                // Calculate percentage-based positions relative to bounding box
                const left = ((table.x - layout.minX) / layout.contentWidth) * 100;
                const top = ((table.y - layout.minY) / layout.contentHeight) * 100;
                const width = (table.width / layout.contentWidth) * 100;
                const height = (table.height / layout.contentHeight) * 100;

                const tableContent = (
                  <div
                    key={table.id}
                    className={cn(
                      "absolute transition-all duration-500 border-2 shadow-sm flex flex-col items-center justify-center text-center p-0.5 overflow-hidden group",
                      isOccupied
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 z-20"
                        : "bg-background text-muted-foreground border-muted-foreground/20 hover:border-primary/50 z-10",
                    )}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      borderRadius: table.shape === "circle" ? "9999px" : "12%",
                    }}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full p-1 sm:p-2 relative">
                      <span
                        className={cn(
                          "font-black leading-tight truncate w-full",
                          isOccupied ? "text-[clamp(8px,2cqi,14px)]" : "text-[clamp(6px,1.5cqi,11px)] opacity-80",
                        )}
                      >
                        {isOccupied ? booking.customer.name : table.label}
                      </span>

                      <div
                        className={cn(
                          "flex items-center gap-0.5 mt-0.5 px-1 py-0.5 rounded-full transition-all",
                          isOccupied ? "bg-white/20 text-white group-hover:hidden" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isOccupied ? (
                          <>
                            <Clock className="h-[clamp(6px,1.2cqi,9px)] w-[clamp(6px,1.2cqi,9px)]" />
                            <span className="text-[clamp(6px,1.2cqi,9px)] font-bold">{format(new Date(booking.bookingDate), "HH:mm")}</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-[clamp(6px,1.5cqi,10px)] w-[clamp(6px,1.5cqi,10px)]" />
                            <span className="text-[clamp(6px,1.2cqi,9px)] font-bold">{table.seats}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (isOccupied) {
                  return (
                    <Tooltip key={table.id}>
                      <TooltipTrigger asChild>{tableContent}</TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="space-y-1">
                          <p className="font-bold">{booking.customer.name}</p>
                          <p className="text-white">
                            {booking.guests} couvert(s) • Arrivée {format(new Date(booking.bookingDate), "HH:mm")}
                          </p>
                          {onDismiss && (
                            <button
                              onClick={() => onDismiss(booking._id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-orange-500 hover:text-orange-600 mt-1 cursor-pointer"
                            >
                              <LogOut className="h-3 w-3" />
                              Marquer comme parti
                            </button>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return tableContent;
              })}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
