import { ColumnDef } from "@tanstack/react-table";
import { PaymentInterface } from "@/interfaces/Payment";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Utensils } from "lucide-react";

export const getColumns = (): ColumnDef<PaymentInterface>[] => [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {"Date"} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm", { locale: fr });
    },
  },
  {
    accessorKey: "restaurant",
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
      const restaurant = row.original.restaurant as any;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            {restaurant?.coverImage ? (
              <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
            ) : (
              <Utensils className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="font-semibold text-sm">{restaurant?.name || "Inconnu"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "planName",
    header: "Offre",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {"Montant"} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.amount.toLocaleString()} €</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status === "completed" ? "default" : status === "pending" ? "outline" : "destructive"}
          className={status === "completed" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
        >
          {status === "completed" ? "Payé" : status === "pending" ? "En attente" : status === "failed" ? "Échoué" : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Méthode",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.paymentMethod}</span>;
    },
  },
];
