import { Outlet, useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "./components/RestaurantSidebar";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Loader2 } from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  description?: string;
}

export const RestaurantLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        setRestaurant(response.data.restaurant);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("not_collaborator");
        } else {
          setError("not_found");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">{error === "not_collaborator" ? "Accès refusé" : "Restaurant non trouvé"}</h1>
        <p className="text-muted-foreground">
          {error === "not_collaborator" ? "Vous n'êtes pas collaborateur de ce restaurant." : "Ce restaurant n'existe pas."}
        </p>
        <button onClick={() => navigate("/account/restaurants")} className="text-primary hover:underline">
          Retour à mes restaurants
        </button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <RestaurantSidebar restaurant={restaurant || undefined} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="lg:hidden mb-4">
              <SidebarTrigger />
            </div>
            <Outlet context={{ restaurant }} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
