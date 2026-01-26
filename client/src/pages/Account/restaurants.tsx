import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Skeleton } from "@/components/ui/skeleton";

export const AccountRestaurants = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = authUser?.role === "admin";

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axiosConfig.get("/restaurants/my");
        setRestaurants(data.restaurants);
      } catch (error) {
        console.error("Failed to fetch restaurants", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{"Mes Restaurants"}</CardTitle>
            <CardDescription>{"Gérez vos établissements ici."}</CardDescription>
          </div>
          <Button
            onClick={() => navigate("/pro/create-restaurant")}
            disabled={!isAdmin}
            title={!isAdmin ? "Réservé aux administrateurs" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            {"Ajouter un restaurant"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore de restaurant.</p>
              {isAdmin && (
                <Link to="/pro/create-restaurant">
                  <Button variant="outline">Créez votre premier établissement</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-32 bg-muted rounded-t-xl overflow-hidden relative">
                      {restaurant.coverImage ? (
                        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <span className="text-4xl font-bold">{restaurant.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle>{restaurant.name}</CardTitle>
                      <CardDescription>{restaurant.city}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
