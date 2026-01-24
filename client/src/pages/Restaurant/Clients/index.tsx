import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { DataTable } from "@/components/customs/dataTable";
import { getColumns } from "./columns";

interface Client {
  _id: string;
  userId?: string;
  name: string;
  forename?: string;
  email?: string;
  phone: string;
  avatar?: string;
  isRegistered: boolean;
  totalBookings: number;
  totalGuests: number;
  lastVisit: string;
  firstVisit: string;
}

export const RestaurantClients = () => {
  const { id } = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Track pageSize to allow refreshing

  // 1. Define fetcher with useCallback.
  // It handles the API call.
  // We include 'pageIndex' and 'size' as args because DataTable provides them.
  // We use 'search' from state (closure), but to avoid loop we must be careful.
  // Ideally, if search changes, we want this function to see new search.
  const fetchClients = useCallback(
    async (pageIndex: number, size: number) => {
      setLoading(true);
      try {
        const params: any = { page: pageIndex, size };
        // Use current search state.
        // Note: If this function runs and search is old, it uses old search.
        // But we will ensure it re-runs or is re-created when search changes?
        // No, we want 'onSearch' to trigger a refresh.
        // Better: pass search explicitly or rely on ref/state.

        // Since we can't easily pass explicit search arg via DataTable's fetchData prop (it only takes page/size),
        // we rely on the closure or state.
        // BUT we must add 'search' to dependencies if we want it to update!
        // If we add 'search', fetchClients changes identity on search change.
        // DataTable calls fetchData(pageIndex, pageSize) inside its useEffect on pagination change.
        // If fetchData identity changes, DataTable effect might NOT run unless it depends on fetchData.
        // (My DataTable implementation usually depends on pagination state, not fetchData identity, but let's assume it's robust).

        if (search) params.search = search;

        const response = await api.get(`/bookings/restaurant/${id}/clients`, { params });
        setClients(response.data.clients);
        setCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setLoading(false);
      }
    },
    [id, search],
  ); // Re-create when search changes.

  // 2. onSearch handler
  // Updates state.
  const onSearchChange = useCallback((query: string) => {
    setSearch(query);
  }, []);

  // 3. Effect to trigger fetch when search changes
  // When search changes, fetchClients is recreated.
  // We want to reset to page 0 and fetch.
  useEffect(() => {
    fetchClients(0, pageSize);
  }, [fetchClients, pageSize]);
  // Dependency on fetchClients (which depends on search) ensures this runs when search changes.

  // Memoize columns
  const columns = useMemo(() => getColumns(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{"Clients"}</h1>
        <p className="text-muted-foreground">{"Retrouvez tous vos clients et leurs statistiques"}</p>
      </div>

      <div className="bg-card rounded-md border p-4">
        <DataTable
          columns={columns}
          data={clients}
          dataCount={count}
          fetchData={(p, s) => {
            setPageSize(s);
            fetchClients(p, s);
          }}
          isLoading={loading}
          callback={() => {}}
          searchElement="name"
          onSearch={onSearchChange}
        />
      </div>
    </div>
  );
};
