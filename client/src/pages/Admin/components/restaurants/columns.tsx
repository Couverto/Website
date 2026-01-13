import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RestaurantInterface } from "@/interfaces/Restaurant";

export const getColumns = (callback: Function, t: any): ColumnDef<RestaurantInterface>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("pages.admin.restaurants_page.table.name")}
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "address", // Using model field name from server response (which returns 'adress' but interface has 'adress')
    header: t("pages.admin.restaurants_page.table.address"),
    cell: ({ row }) => <div className="lowercase">{row.original.adress}</div>,
  },
  {
    accessorKey: "city",
    header: t("pages.admin.restaurants_page.table.city"),
  },
  {
    accessorKey: "collaborators",
    header: t("pages.admin.restaurants_page.table.collaborators"),
    cell: ({ row }) => {
      const collaborators = row.original.collaborators as any[];
      if (!collaborators || collaborators.length === 0) return <div>-</div>;

      const displayCollaborators = collaborators.slice(0, 3);
      const remaining = collaborators.length > 3 ? collaborators.length - 3 : 0;

      return (
        <div className="flex -space-x-2">
          {displayCollaborators.map((collaborator: any, index: number) => (
            <div key={index} title={`${collaborator.forename} ${collaborator.name}`}>
              {/*  We need to import Avatar components. Since I can't easily add import at top with replace_file, I will assume they are imported or I will use simple img for now to avoid risking messing up imports with multiple replaces or large rewrite. 
                 Actually, I should rewrite the file to include imports properly. 
                 */}
              <img
                src={collaborator.avatar || "https://github.com/shadcn.png"}
                alt={collaborator.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            </div>
          ))}
          {remaining > 0 && (
            <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-500 border-2 border-white rounded-full">
              +{remaining}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: t("pages.admin.restaurants_page.table.rating"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const restaurant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("pages.admin.restaurants_page.table.actions")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(restaurant._id)}>
              {t("pages.admin.restaurants_page.table.copy_id")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callback("update", restaurant._id)} className="text-yellow-600 cursor-pointer">
              <Pencil className="w-4 h-4 mr-2" />
              {t("pages.admin.restaurants_page.table.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => callback("delete", restaurant._id)} className="text-red-600 cursor-pointer">
              <Trash className="w-4 h-4 mr-2" />
              {t("pages.admin.restaurants_page.table.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
