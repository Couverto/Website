import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, MapPin, Calendar, Users } from "lucide-react";
import { useAuthContext } from "@/contexts/authContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BookingInfo {
  _id: string;
  restaurant: {
    _id: string;
    name: string;
    address?: string;
  };
  bookingDate: string;
  guests: number;
  customer: {
    name: string;
  };
}

export const AddReview = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingBooking, setFetchingBooking] = useState(true);
  const [rating, setRating] = useState(0);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { authUser } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!authUser) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/register?redirect=${currentUrl}`);
    }
  }, [authUser, navigate]);

  // Fetch booking info
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !authUser) return;

      try {
        setFetchingBooking(true);
        const response = await axiosConfig.get(`/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        setError(err.response?.data?.error || "Impossible de charger les informations de la réservation.");
      } finally {
        setFetchingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingId, authUser]);

  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold mb-2">Lien invalide</h2>
        <p className="text-muted-foreground">L'identifiant de la réservation est manquant.</p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  if (fetchingBooking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p className="text-muted-foreground">{error || "Réservation introuvable."}</p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note.");
      return;
    }

    setLoading(true);
    try {
      await axiosConfig.post("/reviews", {
        bookingId,
        rating,
        comment: data.comment,
      });
      toast.success("Votre avis a été enregistré avec succès !");
      navigate("/account/bookings");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Restaurant Info Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-8 border border-primary/20">
        <h1 className="text-2xl font-bold mb-2">Donnez votre avis</h1>
        <p className="text-lg font-semibold text-primary">{booking.restaurant.name}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(booking.bookingDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {booking.guests} {booking.guests > 1 ? "personnes" : "personne"}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">Partagez votre expérience pour aider les autres utilisateurs et le restaurateur.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Note globale</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`p-1 transition-colors hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Votre commentaire (optionnel)
          </label>
          <Textarea
            {...register("comment")}
            placeholder="Qu'avez-vous pensé du service, de la cuisine, de l'ambiance ?"
            className="min-h-[150px]"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Envoi en cours..." : "Publier mon avis"}
        </Button>
      </form>
    </div>
  );
};
