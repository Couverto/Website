import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Loader2, Users } from "lucide-react";

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  totalBookings: number;
  totalGuests: number;
  lastVisit: string;
  firstVisit: string;
}

export const RestaurantClients = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [id, page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;

      const response = await api.get(`/bookings/restaurant/${id}/clients`, { params });
      setClients(response.data.clients);
      setCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchClients();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.clients.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.clients.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {count} {t("pages.restaurant.clients.total")}
              </CardTitle>
              <CardDescription>{t("pages.restaurant.clients.description")}</CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("pages.restaurant.clients.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                {t("pages.restaurant.clients.search")}
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("pages.restaurant.clients.no_clients")}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("pages.restaurant.clients.name")}</TableHead>
                    <TableHead>{t("pages.restaurant.clients.contact")}</TableHead>
                    <TableHead className="text-center">{t("pages.restaurant.clients.visits")}</TableHead>
                    <TableHead className="text-center">{t("pages.restaurant.clients.total_guests")}</TableHead>
                    <TableHead>{t("pages.restaurant.clients.last_visit")}</TableHead>
                    <TableHead>{t("pages.restaurant.clients.first_visit")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div>
                          <p>{client.phone}</p>
                          {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{client.totalBookings}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{client.totalGuests}</span>
                      </TableCell>
                      <TableCell>{format(new Date(client.lastVisit), "dd MMM yyyy", { locale: fr })}</TableCell>
                      <TableCell>{format(new Date(client.firstVisit), "dd MMM yyyy", { locale: fr })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-end mt-4 gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  {t("pages.restaurant.clients.previous")}
                </Button>
                <Button variant="outline" size="sm" disabled={clients.length < 20} onClick={() => setPage((p) => p + 1)}>
                  {t("pages.restaurant.clients.next")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
