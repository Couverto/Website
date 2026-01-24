import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, EllipsisVertical, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TFunction } from "i18next";
import { toast } from "sonner";

interface Collaborator {
  _id: string;
  name: string;
  forename: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export const getColumns = (
  callback: (action: string, data: any) => void,
  t: TFunction<"translation">,
  count: number,
): ColumnDef<Collaborator>[] => [
  {
    id: "name",
    accessorFn: (row) => `${row.forename} ${row.name}`,
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.restaurant.collaborators.user")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const collab = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={collab.avatar} />
            <AvatarFallback>
              {collab.forename?.charAt(0)}
              {collab.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {collab.forename} {collab.name}
            </p>
            <p className="text-sm text-muted-foreground">@{collab.username}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.restaurant.collaborators.email")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("pages.restaurant.collaborators.joined")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "dd MMM yyyy", { locale: fr }),
  },
  {
    id: "actions",
    enableHiding: false,
    header: t("pages.restaurant.collaborators.actions"),
    cell: ({ row }) => {
      const collab = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
              <span className="sr-only">Open menu</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(collab._id);
                toast.success(t("pages.restaurant.collaborators.copy_id_success"));
              }}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              {t("pages.restaurant.collaborators.copy_id")}
            </DropdownMenuItem>
            {count > 1 && (
              <DropdownMenuItem
                className="flex gap-2 text-destructive focus:text-destructive"
                onClick={() => callback("delete", collab._id)}
              >
                <Trash2 className="w-4 h-4" />
                {t("pages.restaurant.collaborators.remove")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
