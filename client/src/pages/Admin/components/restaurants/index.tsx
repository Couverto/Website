import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { DataTable } from "@/components/customs/dataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantInterface>();
  const [restaurantCount, setRestaurantCount] = useState(0);
  const navigate = useNavigate();

  async function fetchRestaurants(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/restaurants?page=${page}&size=${size}`);
      setRestaurants(response.data.restaurants);
      setRestaurantCount(response.data.count);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors du chargement des restaurants");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!selectedRestaurant) return;
    try {
      await axiosConfig.delete(`/restaurants/${selectedRestaurant._id}`);
      toast.success("Restaurant supprimé avec succès");
      setOpenDeleteDialog(false);
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression du restaurant");
    }
  };

  function callback(action: string, data: any) {
    switch (action) {
      case "edit":
        navigate(`/admin/restaurants/${data}/edit`);
        break;
      case "stats":
        navigate(`/admin/restaurants/${data}/stats`);
        break;
      case "delete":
        setSelectedRestaurant(restaurants.find((r) => r._id === data));
        setOpenDeleteDialog(true);
        break;
      default:
        break;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{"Restaurants"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={getColumns(callback)}
            data={restaurants}
            dataCount={restaurantCount}
            fetchData={fetchRestaurants}
            isLoading={loading}
            callback={callback}
            searchElement="restaurant"
            actions={[]}
          />
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onOpenChange={() => setOpenDeleteDialog(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer un restaurant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Êtes-vous sûr de vouloir supprimer le restaurant <strong>{selectedRestaurant?.name}</strong> ? Cette action est irréversible
                et supprimera toutes les données associées (réservations, images, menu, etc.).
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
