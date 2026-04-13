import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
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
import { ThemeChanger } from "@/components/customs/themeChanger";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/customs/loading";
import { ConfigurationAlert } from "@/components/business/ConfigurationAlert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/authContext";
import { NOTIFICATION_SOUNDS } from "@/constants/sounds";

export const RestaurantLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState<RestaurantInterface | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();

  const fetchRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/${id}/details`);
      setRestaurant(response.data.restaurant);
      setUserRole(response.data.userRole || "employee");
      setAvailablePages(response.data.availablePages || []);
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
        toast.info("Nouvelle réservation reçue !");

        if (location.pathname.includes("/bookings")) {
          return;
        }

        if (authUser?.notificationSound && authUser.notificationSound !== "none") {
          const sound = NOTIFICATION_SOUNDS.find((s) => s.id === authUser.notificationSound) || NOTIFICATION_SOUNDS.find((s) => s.id === "default");
          if (sound?.url) {
            const audio = new Audio(sound.url);
            audio.play().catch((e) => console.error("Audio play failed", e));
          }
        }
      };

      socket.on("newBooking", handleNewBooking);

      return () => {
        socket.off("newBooking", handleNewBooking);
      };
    }
  }, [socket, id, authUser, location.pathname]);

  // Route Protection Interceptor
  useEffect(() => {
    if (!loading && restaurant) {
      const pageKey = location.pathname.split("/").pop(); // e.g. "stats", "gallery"
      const corePages = ["plan"]; // Allow users to upgrade their plan. "dashboard" is now a feature page.

      if (userRole === "admin") {
        setIsLocked(false);
      } else if (pageKey && !corePages.includes(pageKey)) {
        // Exception for table-plan
        const checkKey = pageKey === "table-plan" ? "tablePlan" : pageKey;
        if (!availablePages.includes(checkKey)) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      } else {
        setIsLocked(false);
      }
    }
  }, [loading, restaurant, location.pathname, availablePages]);

  if (loading) {
    return <Loading />;
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
        <RestaurantSidebar restaurant={restaurant || undefined} userRole={userRole} availablePages={availablePages} />
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
            {restaurant && <ConfigurationAlert restaurant={restaurant} />}
            {isLocked ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-muted w-24 h-24 flex items-center justify-center rounded-full mb-6">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Fonctionnalité Verrouillée</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Le forfait de ce restaurant n'inclut pas l'accès à cette fonctionnalité.
                </p>
                {userRole === "admin" && <Button onClick={() => navigate(`/restaurant/${id}/plan`)}>Voir les abonnements</Button>}
              </div>
            ) : (
              <Outlet
                context={{
                  restaurant,
                  userRole,
                  availablePages,
                  refreshRestaurant: fetchRestaurant,
                }}
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
