import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MoreHorizontal,
  X,
  Trash2,
  Mail,
  StickyNote,
  Users,
  User as UserIcon,
  Calendar,
  Clock,
  Phone,
  ArrowUpDown,
  Store,
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
  onAction: (action: "CANCEL" | "DELETE" | "EMAIL", booking: BookingInterface) => void,
): ColumnDef<BookingInterface>[] => [
  {
    id: "restaurant",
    accessorFn: (row) => row.restaurant?.name || "Inconnu",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Restaurant"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const restaurant = row.original.restaurant as any;
      if (!restaurant) return <span className="text-muted-foreground italic">Inconnu</span>;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-md">
            {restaurant.logo ? <AvatarImage src={restaurant.logo} alt={restaurant.name} /> : null}
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-md">
              <Store className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm truncate max-w-[150px]">{restaurant.name}</span>
        </div>
      );
    },
    meta: { label: "Restaurant" },
  },
  {
    id: "name",
    accessorFn: (row) => (row.user ? `${row.user.forename} ${row.user.name}` : row.customer?.name),
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
      const displayName = hasUser ? `${booking.user!.forename} ${booking.user!.name}` : booking.customer?.name || "Inconnu";

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
            {hasUser && booking.user && <span className="text-xs text-muted-foreground truncate max-w-[150px]">@{booking.user.email}</span>}
            {!hasUser && booking.customer?.email && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">@{booking.customer.email}</span>
            )}
            {booking.customer?.phone && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                <Phone className="h-3 w-3" /> {booking.customer.phone}
              </span>
            )}
          </div>
        </div>
      );
    },
    meta: { label: "Client" },
  },
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
      if (!booking.bookingDate) return null;

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
          <div className="flex flex-col text-sm">
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
        <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold tracking-wider", colorClass)}>
          {status === "PENDING" ? "En attente" : status === "CONFIRMED" ? "Confirmée" : status === "CANCELLED" ? "Annulée" : "Brouillon"}
        </Badge>
      );
    },
    meta: { label: "Statut" },
  },
  {
    id: "notes",
    accessorFn: (row) => row.notes,
    header: "Notes",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="max-w-[150px] truncate text-xs text-muted-foreground" title={booking.notes}>
          {booking.notes ? `"${booking.notes}"` : <span className="italic opacity-50">Aucune</span>}
        </div>
      );
    },
    meta: { label: "Notes" },
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
          <DropdownMenuContent align="end" className="w-auto">
            <DropdownMenuLabel>Actions Administrateur</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {booking.status !== "CANCELLED" && (
              <DropdownMenuItem
                onClick={() => setTimeout(() => onAction("CANCEL", booking), 100)}
                className="text-orange-600 focus:text-orange-700 focus:bg-orange-50/50 cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => setTimeout(() => onAction("EMAIL", booking), 100)} className="cursor-pointer">
              <Mail className="h-4 w-4 mr-2" />
              Envoyer un rappel
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setTimeout(() => onAction("DELETE", booking), 100)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la réservation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
