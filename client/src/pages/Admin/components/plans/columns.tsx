import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check, X } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      cell: ({ row }) => {
        return <div className="font-semibold text-base">{row.getValue("name")}</div>;
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
        return (
          <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
            {formatted}
            <span className="text-xs font-normal text-muted-foreground ml-1">/mois</span>
          </Badge>
        );
      },
      meta: { label: "Prix" },
    },
    {
      accessorKey: "features",
      header: "Fonctionnalités",
      cell: ({ row }) => {
        const features = row.original.features || [];
        if (features.length === 0) {
          return <span className="text-muted-foreground text-sm">Aucune</span>;
        }

        const displayedFeatures = features.slice(0, 3);
        const remainingCount = features.length - 3;

        return (
          <div className="flex flex-wrap gap-1.5 max-w-[300px]">
            {displayedFeatures.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs font-normal bg-primary/5 border-primary/20 text-primary">
                {feature.name}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs font-normal bg-muted cursor-help">
                      +{remainingCount}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      {features.slice(3).map((feature, index) => (
                        <span key={index} className="text-xs">
                          {feature.name}
                        </span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
      meta: { label: "Fonctionnalités" },
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
