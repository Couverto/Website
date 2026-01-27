import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const RestaurantReviews = () => {
  const { id: restaurantId } = useParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      const response = await axiosConfig.get(`/reviews/restaurant/${restaurantId}`);
      setReviews(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText[reviewId]) return;

    try {
      await axiosConfig.post(`/reviews/${reviewId}/reply`, {
        text: replyText[reviewId],
      });
      toast.success("Réponse envoyée !");
      setReplyingTo(null);
      fetchReviews(); // Refresh to show reply
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la réponse.");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Avis Clients</h2>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">Aucun avis pour le moment.</p>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {review.user?.forename} {review.user?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${review.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mt-2 text-sm">{review.comment}</p>

                {/* Reply Section */}
                {review.reply ? (
                  <div className="mt-4 bg-muted/50 p-3 rounded-md border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-semibold text-sm">Réponse du restaurant</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.reply.createdAt), "d MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm italic text-muted-foreground">{review.reply.text}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {replyingTo === review._id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Votre réponse..."
                          value={replyText[review._id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReply(review._id)}>
                            Envoyer
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(review._id)}>
                        Répondre
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
