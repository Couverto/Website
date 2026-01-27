import { Outlet, useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "./components/RestaurantSidebar";
import { RestaurantBreadcrumb } from "./components/RestaurantBreadcrumb";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Loader2 } from "lucide-react";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { useSocketContext } from "@/contexts/socketContext";
import { toast } from "sonner";
import { BookingInterface } from "@/interfaces/Booking";
import { Separator } from "@/components/ui/separator";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { Badge } from "@/components/ui/badge";

export const RestaurantLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantInterface | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket } = useSocketContext();

  const fetchRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/${id}/details`);
      setRestaurant(response.data.restaurant);
      setUserRole(response.data.userRole || "employee");
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("Accès refusé : Vous n'êtes pas collaborateur de ce restaurant.");
        navigate("/", { replace: true });
        return;
      } else {
        setError("not_found");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  // Global Socket Logic (Notifications & Room Join)
  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: BookingInterface) => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));
        toast.info("Nouvelle réservation reçue !");
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id]);

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
        <h1 className="text-2xl font-bold">Restaurant non trouvé</h1>
        <p className="text-muted-foreground">Ce restaurant n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate("/account/restaurants")} className="text-primary hover:underline">
          Retour à mes restaurants
        </button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <RestaurantSidebar restaurant={restaurant || undefined} userRole={userRole} />
        <main className="flex-1 overflow-auto">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <RestaurantBreadcrumb restaurant={restaurant} />
              </div>
              <div className="flex items-center gap-2">
                <ThemeChanger />
              </div>
            </div>
          </header>
          <div className="p-6">
            <Outlet context={{ restaurant, userRole, refreshRestaurant: fetchRestaurant }} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
