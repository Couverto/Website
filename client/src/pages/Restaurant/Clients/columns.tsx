import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User as UserIcon, ArrowUpDown, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Client {
  _id: string;
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  isRegistered: boolean;
  totalBookings: number;
  totalGuests: number;
  lastVisit: string;
  firstVisit: string;
}

export const getColumns = (): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Utilisateur"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {client.avatar && <AvatarImage src={client.avatar} alt={client.name} />}
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {client.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{client.name}</span>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>
      );
    },
    meta: { label: "Utilisateur" },
  },
  {
    id: "contact",
    accessorFn: (row) => row.phone,
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Contact"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {client.phone}
        </span>
      );
    },
    meta: { label: "Contact" },
  },
  {
    accessorKey: "totalBookings",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Visites"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="outline" className="font-bold">
          {row.original.totalBookings}
        </Badge>
      </div>
    ),
    meta: { label: "Visites" },
  },
  {
    accessorKey: "totalGuests",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Total couverts"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center text-muted-foreground font-medium">{row.original.totalGuests}</div>,
    meta: { label: "Total couverts" },
  },
  {
    accessorKey: "lastVisit",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Dernière visite"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.original.lastVisit), "dd MMM yyyy", { locale: fr }),
    meta: { label: "Dernière visite" },
  },
  {
    accessorKey: "firstVisit",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {"Première visite"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.original.firstVisit), "dd MMM yyyy", { locale: fr }),
    meta: { label: "Première visite" },
  },
];
