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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardTablePlanProps {
  restaurant: RestaurantInterface;
  bookings: BookingInterface[];
  selectedDate?: Date;
  selectedService?: string | null;
  onDismiss?: (bookingId: string) => void;
  onToggleTableClosure?: (tableId: string, startTime?: string, endTime?: string, date?: Date) => void;
  onQuickBook?: (tableId: string, tableName: string) => void;
}

export const DashboardTablePlan: React.FC<DashboardTablePlanProps> = ({ 
  restaurant, 
  bookings, 
  selectedDate = new Date(),
  selectedService,
  onDismiss, 
  onToggleTableClosure,
  onQuickBook
}) => {
  const [activeZoneId, setActiveZoneId] = useState<string>(restaurant.zones[0]?.id || "");

  const todayServices = useMemo(() => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = days[new Date().getDay()];
    const hours = restaurant.openingHours?.[dayName];
    if (!hours || hours.isClosed) return [];
    return hours.periods || [];
  }, [restaurant.openingHours]);

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
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-orange-500/30" />
              <span>Bloqué</span>
            </div>
          </div>          <TooltipProvider delayDuration={200}>
            <div className="w-full h-full relative">
              {activeZone?.tables.map((table: any) => {
                const tid = String(table.id || table._id || "").toLowerCase().trim();
                const booking = currentBookings.find((b: BookingInterface) => b.tableId && String(b.tableId).toLowerCase().trim() === tid);
                const isOccupied = !!booking;

                const tableClosuresForThisTable = restaurant.tableClosures?.filter((c: any) => c.tableId === tid) || [];
                
                  const currentClosure = tableClosuresForThisTable.find((c: any) => {
                    const s = new Date(c.startDate).getTime();
                    const e = new Date(c.endDate).getTime();
                    
                    if (selectedService) {
                      const [startStr, endStr] = selectedService.split("-");
                      const [startH, startM] = startStr.split(":").map(Number);
                      const [endH, endM] = endStr.split(":").map(Number);
                      
                      const serviceStart = new Date(selectedDate);
                      serviceStart.setHours(startH, startM, 0, 0);
                      const serviceStartMs = serviceStart.getTime();
                      
                      const serviceEnd = new Date(selectedDate);
                      serviceEnd.setHours(endH, endM, 59, 999);
                      
                      // Handle midnight crossing
                      if (endH < startH) {
                        serviceEnd.setDate(serviceEnd.getDate() + 1);
                      }
                      const serviceEndMs = serviceEnd.getTime();
                      
                      // Closure overlaps with service window
                      return serviceStartMs < e && serviceEndMs > s;
                    }
                    
                    const now = new Date();
                    return now.getTime() >= s && now.getTime() <= e;
                  });
                
                const isReserved = (table as any).status === "reserved" || !!currentClosure;

                // Calculate percentage-based positions relative to bounding box
                const left = ((table.x - layout.minX) / layout.contentWidth) * 100;
                const top = ((table.y - layout.minY) / layout.contentHeight) * 100;
                const width = (table.width / layout.contentWidth) * 100;
                const height = (table.height / layout.contentHeight) * 100;

                const tableContent = (
                  <div
                    className={cn(
                      "absolute transition-all duration-300 border-2 shadow-sm flex flex-col items-center justify-center text-center p-0.5 overflow-hidden group",
                      !isOccupied && "cursor-pointer active:scale-95",
                      isOccupied
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 z-20"
                        : isReserved
                          ? "bg-orange-500 text-white border-orange-600 z-10 shadow-sm"
                          : "bg-background text-muted-foreground border-muted-foreground/20 hover:border-primary/50 z-10",
                    )}
                    title={isOccupied ? "Occupée" : isReserved ? "Cliquer pour gérer le blocage" : "Cliquer pour bloquer (téléphone)"}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      borderRadius: table.shape === "circle" ? "9999px" : "12%",
                    }}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full p-1 sm:p-2 relative pointer-events-none">
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
                          isOccupied ? "bg-white/20 text-white group-hover:hidden" : 
                          isReserved ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
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

                const toggleServiceClosure = (open: string, close: string) => {
                  onToggleTableClosure?.(tid, open, close, selectedDate);
                };

                const isBlockedForService = (open: string, close: string) => {
                  return tableClosuresForThisTable.some((c: any) => {
                    const s = new Date(c.startDate).getTime();
                    const e = new Date(c.endDate).getTime();
                    
                    const targetS = new Date(selectedDate);
                    const [sh, sm] = open.split(":").map(Number);
                    targetS.setHours(sh, sm, 0, 0);
                    
                    const targetE = new Date(selectedDate);
                    const [eh, em] = close.split(":").map(Number);
                    targetE.setHours(eh, em, 59, 999);
                    
                    if (eh < sh) targetE.setDate(targetE.getDate() + 1);
                    
                    const targetSMs = targetS.getTime();
                    const targetEMs = targetE.getTime();
                    
                    return Math.abs(s - targetSMs) < 2000 && Math.abs(e - targetEMs) < 2000;
                  });
                };

                const tableContentWithClick = (
                  <div 
                    onClick={(e) => {
                      if (selectedService) {
                        e.stopPropagation();
                        
                        const isBlocked = isBlockedForService(selectedService.split("-")[0], selectedService.split("-")[1]);
                        
                        if (isBlocked) {
                          // If blocked, click unblocks
                          const [open, close] = selectedService.split("-");
                          toggleServiceClosure(open, close);
                        } else {
                          // If free, click opens Quick Booking
                          onQuickBook?.(tid, table.label);
                        }
                      }
                    }}
                  >
                    {tableContent}
                  </div>
                );


                if (selectedService) {
                  return <div key={table.id}>{tableContentWithClick}</div>;
                }

                // Wrap in DropdownMenu if no specific service selected
                return (
                  <DropdownMenu key={table.id}>
                    <DropdownMenuTrigger asChild>
                      {tableContent}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      <DropdownMenuLabel>Bloquer la table {table.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {todayServices.map((period: any, idx: number) => {
                        const isThisPeriodBlocked = isBlockedForService(period.open, period.close);

                        return (
                          <DropdownMenuItem 
                            key={idx} 
                            onClick={() => toggleServiceClosure(period.open, period.close)}
                            className="flex justify-between"
                          >
                            <span>Service {period.open}-{period.close}</span>
                            {isThisPeriodBlocked && <Badge variant="destructive" className="text-[10px] h-4">Bloqué</Badge>}
                          </DropdownMenuItem>
                        );
                      })}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onToggleTableClosure?.(tid, undefined, undefined, selectedDate)}
                        className="font-semibold text-orange-600 focus:text-orange-600"
                      >
                        Toute la journée
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
