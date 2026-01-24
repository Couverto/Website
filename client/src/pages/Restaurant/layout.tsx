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
import { useTranslation } from "react-i18next";
import { BookingInterface } from "@/interfaces/Booking";
import { Separator } from "@/components/ui/separator";

export const RestaurantLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();
  const { socket } = useSocketContext();

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

  // Global Socket Logic (Notifications & Room Join)
  useEffect(() => {
    if (socket && id) {
      socket.emit("joinRestaurant", id);

      const handleNewBooking = (newBooking: BookingInterface) => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));
        toast.info(t("pages.restaurant.bookings.new_booking_notification"));
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id, t]);

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
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <RestaurantBreadcrumb restaurant={restaurant} />
            </div>
          </header>
          <div className="p-6">
            <Outlet context={{ restaurant }} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
