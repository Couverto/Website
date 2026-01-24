import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Plan } from "@/interfaces/Plan";

export const useColumns = (openEditSheet: (plan: Plan) => void, openDeleteDialog: (plan: Plan) => void): ColumnDef<Plan>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {"Nom"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      meta: { label: "Nom" },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {"Prix"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
      meta: { label: "Prix" },
    },
    {
      accessorKey: "active",
      header: "Actif",
      cell: ({ row }) => (row.original.active ? "Oui" : "Non"),
      meta: { label: "Actif" },
    },
    {
      accessorKey: "position",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {"Position"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      meta: { label: "Position" },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const plan = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditSheet(plan)} className="cursor-pointer">
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog(plan)} className="cursor-pointer text-destructive focus:text-destructive">
                {"Supprimer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
