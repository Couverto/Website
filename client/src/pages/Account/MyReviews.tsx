import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Review {
  _id: string;
  restaurant: {
    _id: string;
    name: string;
    coverImage?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  reply?: {
    text: string;
    createdAt: string;
  };
}

export const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await axiosConfig.get("/reviews/my-reviews");
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await axiosConfig.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.success("Avis supprimé avec succès");
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos avis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes avis</h1>
        <p className="text-muted-foreground">Retrouvez tous les avis que vous avez laissés.</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun avis</h3>
            <p className="text-muted-foreground text-center mb-4">Vous n'avez pas encore laissé d'avis sur vos réservations.</p>
            <Button onClick={() => navigate("/account/bookings")}>Voir mes réservations</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Restaurant Image */}
                  {review.restaurant?.coverImage && (
                    <div className="md:w-48 h-32 md:h-auto shrink-0">
                      <img src={review.restaurant.coverImage} alt={review.restaurant.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{review.restaurant?.name || "Restaurant"}</h3>
                        <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${review.rating >= star ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted/20"}`}
                            />
                          ))}
                        </div>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={deletingId === review._id}
                            >
                              {deletingId === review._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Votre avis sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(review._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {review.comment && <p className="text-sm text-foreground/90">{review.comment}</p>}

                    {/* Restaurant Reply */}
                    {review.reply && (
                      <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          <span className="font-semibold text-xs">Réponse du restaurant</span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(review.reply.createdAt), "d MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm italic text-muted-foreground">{review.reply.text}</p>
                      </div>
                    )}

                    {/* View Restaurant Link */}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-primary"
                      onClick={() => navigate(`/restaurants/infos/${review.restaurant?._id}`)}
                    >
                      Voir le restaurant
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
