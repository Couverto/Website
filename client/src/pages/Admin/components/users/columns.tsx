import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, EllipsisVertical, Pencil, Trash, User2, ShieldCheck, Mail, Calendar, Key } from "lucide-react";
import { toast } from "sonner";
import { AvatarWithStatusCell } from "../../../../components/customs/avatarStatusCell";
import { UserInterface } from "@/interfaces/User";
import { Badge } from "@/components/ui/badge";
import { TFunction } from "i18next";
import { IconBadge } from "@/components/customs/IconBadge";

const roleSettings: Record<string, { icon: any; color: string; bg: string }> = {
  admin: { icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30 border-purple-200" },
  user: { icon: User2, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200" },
};

export const getColumns = (callback: (action: string, data: any) => void, t: TFunction<"translation">): ColumnDef<UserInterface>[] => [
  {
    id: "user",
    accessorFn: (row) => `${row.name} ${row.forename} ${row.username}`,
    header: t("pages.admin.users_page.user"),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithStatusCell user={user} />
          <div className="flex flex-col min-w-[120px]">
            <span className="font-semibold text-sm truncate max-w-[150px]">
              {user.name} {user.forename}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">@{user.username}</span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.users_page.role")} <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const { icon: Icon, color, bg } = roleSettings[role] || { icon: User2, color: "text-gray-500", bg: "bg-gray-100" };
      return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ${bg}`}>
          {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
          <span className={`text-xs font-medium capitalize ${color}`}>{t(`pages.admin.users_page.roles.${role}`) || role}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.users_page.email")}
        <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "auth_type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.users_page.auth_type")}
        <ArrowUpDown className="w-3 h-3 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("auth_type") as string;
      const isGoogle = type === "google";

      return (
        <Badge
          variant="outline"
          className={`gap-1.5 font-medium border-0 px-2.5 py-0.5 ${
            isGoogle
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-100"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200"
          }`}
        >
          {isGoogle ? (
            // Simple G text or maybe a colored dot
            <span className="font-bold text-blue-600 dark:text-blue-400">G</span>
          ) : (
            <Key className="h-3 w-3 opacity-70" />
          )}
          {type === "google" ? "Google" : "Email & Mot de passe"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-medium text-xs uppercase tracking-wider hover:text-primary"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("pages.admin.users_page.joined")}
        <ArrowUpDown className="w-3 h-3 ml-2" />
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
    meta: { label: "Joined" },
  },
  {
    id: "actions",
    enableHiding: false,
    header: "",
    cell: ({ row }) => {
      const user = row.original;

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
                navigator.clipboard.writeText(user._id);
                toast.success(t("pages.admin.users_page.copy_id_success"));
              }}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              {t("pages.admin.users_page.copy_id")}
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2" onClick={() => callback("update", user._id)}>
              <Pencil className="w-4 h-4 text-blue-500" /> {t("pages.admin.users_page.update_user")}
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 text-destructive focus:text-destructive" onClick={() => callback("delete", user._id)}>
              <Trash className="w-4 h-4" /> {t("pages.admin.users_page.delete_user")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
