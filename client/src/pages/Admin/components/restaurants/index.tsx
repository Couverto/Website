import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RestaurantForm } from "./restaurantForm";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { DataTable } from "@/components/customs/dataTable";
import { useTranslation } from "react-i18next";

export const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantInterface>();
  const [restaurantCount, setRestaurantCount] = useState(0);

  const { t } = useTranslation();

  async function fetchRestaurants(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/restaurants?page=${page}&size=${size}`);
      setRestaurants(response.data.restaurants);
      setRestaurantCount(response.data.count);
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "Error fetching restaurants"));
    } finally {
      setLoading(false);
    }
  }

  function callback(action: string, data: any) {
    setSelectedRestaurant(undefined);
    switch (action) {
      case "create":
        setAction("create");
        setOpenDialog(true);
        break;
      case "update":
        setSelectedRestaurant(restaurants.find((r) => r._id === data));
        setAction("update");
        setOpenDialog(true);
        break;
      case "delete":
        setSelectedRestaurant(restaurants.find((r) => r._id === data));
        setAction("delete");
        setOpenDialog(true);
      default:
        break;
    }
  }

  return (
    <div>
      <div className="container px-4 mx-auto">
        <DataTable
          columns={getColumns(callback, t)}
          data={restaurants}
          dataCount={restaurantCount}
          fetchData={fetchRestaurants}
          isLoading={loading}
          callback={callback}
          searchElement="name"
          actions={["create"]}
        />
      </div>
      {openDialog && (
        <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t(`pages.admin.restaurants_page.actions_type.` + action)} {t("pages.admin.restaurants_page.a_restaurant")}
              </DialogTitle>
            </DialogHeader>
            <RestaurantForm dialog={setOpenDialog} refresh={fetchRestaurants} action={action} restaurant={selectedRestaurant} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
