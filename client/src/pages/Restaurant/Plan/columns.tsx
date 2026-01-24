import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Payment {
  _id: string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: fr });
    },
    meta: { label: "Date" },
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.planName}</span>;
    },
    meta: { label: "Plan" },
  },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(row.original.amount);
      return <span className="font-semibold">{formatted}</span>;
    },
    meta: { label: "Montant" },
  },
  {
    accessorKey: "paymentMethod",
    header: "Méthode",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="capitalize">
          {row.original.paymentMethod === "card" ? "Carte" : row.original.paymentMethod}
        </Badge>
      );
    },
    meta: { label: "Méthode" },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig = {
        completed: { label: "Payé", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" },
        pending: { label: "En attente", className: "bg-amber-500/15 text-amber-600 border-amber-500/20" },
        failed: { label: "Échoué", className: "bg-red-500/15 text-red-600 border-red-500/20" },
        refunded: { label: "Remboursé", className: "bg-blue-500/15 text-blue-600 border-blue-500/20" },
      };
      const config = statusConfig[status] || statusConfig.pending;
      return <Badge className={config.className}>{config.label}</Badge>;
    },
    meta: { label: "Statut" },
  },
];
