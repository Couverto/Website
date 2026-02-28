import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MoreHorizontal,
  Check,
  X,
  Users,
  User as UserIcon,
  Calendar,
  Clock,
  Phone,
  ArrowUpDown,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldBan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BookingInterface } from "@/interfaces/Booking";

export const getColumns = (
  onAction: (action: "CONFIRM" | "CANCEL" | "CAPTURE_IMPRINT" | "RELEASE_IMPRINT", booking: BookingInterface) => void,
): ColumnDef<BookingInterface>[] => [
  {
    id: "name",
    accessorFn: (row) => (row.user ? `${row.user.forename} ${row.user.name}` : row.customer.name),
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Client"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const booking = row.original;
      const isCancelled = booking.status === "CANCELLED";
      const hasUser = !!booking.user;
      const displayName = hasUser ? `${booking.user!.forename} ${booking.user!.name}` : booking.customer.name;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {hasUser && booking.user!.avatar ? <AvatarImage src={booking.user!.avatar} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {displayName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-[120px]">
            <span className={cn("font-semibold text-sm truncate max-w-[150px]", isCancelled && "line-through opacity-70")}>
              {displayName}
            </span>
            {hasUser && <span className="text-xs text-muted-foreground truncate max-w-[150px]">@{booking.user?.email}</span>}
          </div>
        </div>
      );
    },
    meta: { label: "Client" },
  },
  // Phone column - separate because same user can book with different phones
  {
    id: "phone",
    accessorFn: (row) => row.customer.phone,
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Téléphone"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {booking.customer.phone}
        </span>
      );
    },
    meta: { label: "Téléphone" },
  },
  // Date column - horizontal layout
  {
    accessorKey: "bookingDate",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Date"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const booking = row.original;
      const isPending = booking.status === "PENDING";
      const isConfirmed = booking.status === "CONFIRMED";
      const isCancelled = booking.status === "CANCELLED";

      return (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1 h-8 rounded-full",
              isPending && "bg-yellow-500",
              isConfirmed && "bg-green-500",
              isCancelled && "bg-red-500 opacity-50",
              !isPending && !isConfirmed && !isCancelled && "bg-muted",
            )}
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(booking.bookingDate), "dd MMM yyyy", { locale: fr })}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-primary">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(booking.bookingDate), "HH:mm")}
            </span>
          </div>
        </div>
      );
    },
    meta: { label: "Date" },
  },
  {
    accessorKey: "guests",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Couverts"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <span className="flex items-center gap-1.5 font-medium bg-muted/30 px-2.5 py-1 rounded-full w-fit text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          {booking.guests}
        </span>
      );
    },
    meta: { label: "Couverts" },
  },
  ...(hasTablePlan
    ? [
        {
          id: "table",
          accessorFn: (row: BookingInterface) => row.tableLabel || "Non assignée",
          header: ({ column }: any) => (
            <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              {"Table"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }: any) => {
            const booking = row.original;
            if (!booking.tableLabel) {
              return <span className="text-xs text-muted-foreground italic tracking-tight">Non assignée</span>;
            }

            return (
              <div className="flex flex-col">
                <span className="font-semibold text-primary/80 text-sm">{booking.tableLabel}</span>
                {booking.zoneName && <span className="text-[10px] text-muted-foreground uppercase font-medium">{booking.zoneName}</span>}
              </div>
            );
          },
          meta: { label: "Table" },
        } as ColumnDef<BookingInterface>,
      ]
    : []),
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Statut"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const bankImprintStatus = row.original.bankImprintStatus;
      const bankImprintAmount = row.original.bankImprintAmount;
      let colorClass = "bg-gray-500/10 text-gray-600 border-gray-500/20";

      switch (status) {
        case "CONFIRMED":
          colorClass = "bg-green-500/10 text-green-600 border-green-500/20";
          break;
        case "PENDING":
          colorClass = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
          break;
        case "CANCELLED":
          colorClass = "bg-red-500/10 text-red-600 border-red-500/20";
          break;
      }

      return (
        <div className="flex flex-col gap-1.5 items-start">
          <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold tracking-wider", colorClass)}>
            {status === "PENDING" ? "En attente" : status === "CONFIRMED" ? "Confirmée" : status === "CANCELLED" ? "Annulée" : "Brouillon"}
          </Badge>

          {bankImprintStatus && bankImprintStatus !== "none" && (
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider flex items-center gap-1 bg-background">
              {bankImprintStatus === "secured" && (
                <>
                  <ShieldCheck className="h-3 w-3 text-blue-500" />{" "}
                  <span className="text-blue-600 font-semibold">Caution : {bankImprintAmount}€</span>
                </>
              )}
              {bankImprintStatus === "captured" && (
                <>
                  <ShieldAlert className="h-3 w-3 text-orange-500" />{" "}
                  <span className="text-orange-600 font-semibold">Encaissée : {bankImprintAmount}€</span>
                </>
              )}
              {bankImprintStatus === "released" && (
                <>
                  <ShieldBan className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Libérée</span>
                </>
              )}
            </Badge>
          )}
        </div>
      );
    },
    meta: { label: "Statut" },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted hover:text-primary data-[state=open]:bg-muted">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {booking.bankImprintStatus === "secured" && (
              <>
                <DropdownMenuLabel className="p-0 py-1.5 px-2 text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  Empreinte Bancaire
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setTimeout(() => onAction("CAPTURE_IMPRINT", booking), 100)}
                  className="text-orange-600 focus:text-orange-700 focus:bg-orange-50/50 cursor-pointer text-xs"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Encaisser ({booking.bankImprintAmount}€)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeout(() => onAction("RELEASE_IMPRINT", booking), 100)}
                  className="cursor-pointer text-muted-foreground focus:bg-muted/50 text-xs"
                >
                  <ShieldBan className="h-4 w-4 mr-2" />
                  Libérer la caution
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {booking.status !== "CONFIRMED" && (
              <DropdownMenuItem
                onClick={() => setTimeout(() => onAction("CONFIRM", booking), 100)}
                className="text-green-600 focus:text-green-700 focus:bg-green-50/50 cursor-pointer"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmer
              </DropdownMenuItem>
            )}

            {booking.status !== "CANCELLED" && (
              <DropdownMenuItem
                onClick={() => setTimeout(() => onAction("CANCEL", booking), 100)}
                className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
