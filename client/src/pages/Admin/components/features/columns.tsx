import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check, X, EllipsisVertical, Copy, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Feature } from "@/interfaces/Feature";
import { toast } from "sonner";

export const useColumns = (
  openEditDialog: (feature: Feature) => void,
  openDeleteDialog: (feature: Feature) => void,
): ColumnDef<Feature>[] => {
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
      cell: ({ row }) => {
        return <div className="font-semibold text-base">{row.getValue("name")}</div>;
      },
      meta: { label: "Nom" },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="text-sm text-muted-foreground line-clamp-2 max-w-[400px]">{row.getValue("description") || "—"}</div>;
      },
      meta: { label: "Description" },
    },
    {
      accessorKey: "active",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.original.active;
        return isActive ? (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
            <Check className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-zinc-500/15 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/20">
            <X className="h-3 w-3 mr-1" />
            Inactif
          </Badge>
        );
      },
      meta: { label: "Statut" },
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
      cell: ({ row }) => {
        return (
          <div className="text-center font-mono text-sm bg-muted/50 rounded-md w-8 h-8 flex items-center justify-center">
            {row.getValue("position")}
          </div>
        );
      },
      meta: { label: "Position" },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const feature = row.original;

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
                  navigator.clipboard.writeText(feature._id);
                  toast.success("ID de la fonctionnalité copié");
                }}
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
                {"Copier l'ID"}
              </DropdownMenuItem>

              <DropdownMenuItem className="flex gap-2" onClick={() => openEditDialog(feature)}>
                <Pencil className="w-4 h-4 text-blue-500" /> {"Modifier la fonctionnalité"}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex gap-2 text-destructive focus:text-destructive" onClick={() => openDeleteDialog(feature)}>
                <Trash className="w-4 h-4" /> {"Supprimer la fonctionnalité"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
