import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, EllipsisVertical, Trash2, ArrowUpDown, ShieldCheck, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { toast } from "sonner";

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  admin: {
    label: "Administrateur",
    icon: ShieldCheck,
    color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50",
  },
  employee: {
    label: "Employé",
    icon: User,
    color: "text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800/50",
  },
};

interface Collaborator {
  _id: string;
  name: string;
  forename: string;
  email: string;
  username: string;
  avatar?: string;
  restaurantRole: string;
  createdAt: string;
}

export const getColumns = (
  callback: (action: string, data: any) => void,
  count: number,
  currentUserRole?: string,
  adminCount?: number,
): ColumnDef<Collaborator>[] => [
  {
    id: "name",
    accessorFn: (row) => `${row.forename} ${row.name}`,
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Utilisateur"}
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
    meta: { label: "Utilisateur" },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Email"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: { label: "Email" },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Membre depuis"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "dd MMM yyyy", { locale: fr }),
    meta: { label: "Membre depuis" },
  },
  {
    accessorKey: "restaurantRole",
    header: "Rôle",
    cell: ({ row }) => {
      const collab = row.original;
      const config = roleConfig[collab.restaurantRole] || roleConfig.employee;
      const Icon = config.icon;

      const isDisabled =
        (collab.restaurantRole === "admin" && currentUserRole !== "admin") || (collab.restaurantRole === "admin" && adminCount === 1);

      return (
        <Select
          value={collab.restaurantRole}
          onValueChange={(value) => callback("updateRole", { collaboratorId: collab._id, role: value })}
          disabled={isDisabled}
        >
          <SelectTrigger
            className={`w-[180px] h-9 border-none bg-transparent hover:bg-muted/50 transition-colors focus:ring-0 ${
              isDisabled ? "opacity-100 cursor-default hover:bg-transparent" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`flex items-center gap-1.5 px-2 py-0.5 font-medium ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </Badge>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>{"Administrateur"}</span>
              </div>
            </SelectItem>
            <SelectItem value="manager">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>{"Manager"}</span>
              </div>
            </SelectItem>
            <SelectItem value="employee">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <span>{"Employé"}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      );
    },
    meta: { label: "Rôle" },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
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
                toast.success("ID copié dans le presse-papiers");
              }}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              {"Copier l'ID"}
            </DropdownMenuItem>
            {count > 1 &&
              !(collab.restaurantRole === "admin" && currentUserRole !== "admin") &&
              !(collab.restaurantRole === "admin" && adminCount === 1) && (
                <DropdownMenuItem
                  className="flex gap-2 text-destructive focus:text-destructive"
                  onClick={() => callback("delete", collab._id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {"Retirer"}
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
