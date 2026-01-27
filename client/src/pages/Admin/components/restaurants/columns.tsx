import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Copy,
  EllipsisVertical,
  Pencil,
  Trash,
  Utensils,
  MapPin,
  Phone,
  Calendar,
  Globe,
  BarChart3,
  Users,
  ImageIcon,
  MessageSquare,
  UserPlus,
  Settings,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Badge } from "@/components/ui/badge";

export const getColumns = (callback: (action: string, data: any) => void): ColumnDef<RestaurantInterface>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {"Restaurant"} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const restaurant = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {restaurant.coverImage ? (
              <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <Utensils className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{restaurant.name}</span>
            <span className="text-xs text-muted-foreground">@{restaurant.slug}</span>
          </div>
        </div>
      );
    },
    meta: { label: "Restaurant" },
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {"Ville"} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {row.getValue("city")}
      </div>
    ),
    meta: { label: "Ville" },
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-3.5 w-3.5" />
        {row.getValue("phone")}
      </div>
    ),
    meta: { label: "Téléphone" },
  },
  {
    accessorKey: "isClosed",
    header: "Statut",
    cell: ({ row }) => {
      const isClosed = row.getValue("isClosed") as boolean;
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 font-medium border-0 px-2.5 py-0.5 ${
            !isClosed
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {!isClosed ? "Ouvert" : "Fermé"}
        </Badge>
      );
    },
    meta: { label: "Statut" },
  },
  {
    accessorKey: "subscriptionStatus",
    header: "Abonnement",
    cell: ({ row }) => {
      const status = row.getValue("subscriptionStatus") as string;
      const restaurant = row.original;
      const isExpired = status === "expired";
      const isActive = status === "active";
      // Plan name (handle populated object or string)
      const planName = typeof restaurant.plan === "object" && restaurant.plan ? restaurant.plan.name : "";

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`w-fit gap-1.5 font-medium border-0 px-2.5 py-0.5 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 hover:bg-emerald-100"
                : isExpired
                  ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            {status === "active" ? "Actif" : status === "cancelled" ? "Annulé" : status === "expired" ? "Expiré" : "Aucun"}
          </Badge>
          {planName && <span className="text-xs text-muted-foreground font-medium">{planName}</span>}
        </div>
      );
    },
    meta: { label: "Abonnement" },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {"Créé le"} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("createdAt");
      if (!value) return <span className="text-muted-foreground text-xs">-</span>;
      const formatted = format(new Date(value as Date), "dd MMM yyyy", { locale: fr });
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {formatted}
        </div>
      );
    },
    meta: { label: "Créé le" },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    meta: { label: "Actions" },
    cell: ({ row }) => {
      const restaurant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50 hover:text-primary">
              <span className="sr-only">Open menu</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(restaurant._id);
                toast.success("ID du restaurant copié");
              }}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              {"Copier l'ID"}
            </DropdownMenuItem>
            {restaurant.website && (
              <DropdownMenuItem className="flex gap-2" onClick={() => window.open(restaurant.website, "_blank")}>
                <Globe className="w-4 h-4 text-muted-foreground" />
                {"Visiter le site"}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="flex gap-2" onClick={() => callback("dashboard", restaurant._id)}>
              <Settings className="w-4 h-4 text-blue-500" /> {"Paramétrer le restaurant"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex gap-2 text-destructive focus:text-destructive"
              onClick={() => callback("delete", restaurant._id)}
            >
              <Trash className="w-4 h-4" /> {"Supprimer le restaurant"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
