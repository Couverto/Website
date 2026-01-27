import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useConfigContext } from "@/contexts/configContext";

export const AddReview = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      navigate("/account/bookings"); // Redirect to bookings or home
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Donnez votre avis</h1>
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
