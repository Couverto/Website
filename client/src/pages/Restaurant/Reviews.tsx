import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare, Loader2, Send, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const RestaurantReviews = () => {
  const { id: restaurantId } = useParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    try {
      await axiosConfig.post(`/reviews/${reviewId}/reply`, {
        text: replyText[reviewId],
      });
      toast.success("Réponse envoyée !");
      setReplyingTo(null);
      setReplyText({ ...replyText, [reviewId]: "" });
      fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Avis Clients</h2>
          <p className="text-muted-foreground mt-1">Gérez les avis et répondez à vos clients</p>
        </div>

        {reviews.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{avgRating}</div>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${parseFloat(avgRating) >= star ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted/30"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="border-l pl-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>{reviews.length} avis au total</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun avis</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Vos clients n'ont pas encore laissé d'avis. Les avis apparaîtront ici une fois reçus.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={review.user?.avatar} alt={review.user?.forename} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {review.user?.forename?.charAt(0) || "?"}
                      {review.user?.name?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-lg">
                          {review.user?.forename} {review.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-1 rounded-md">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${review.rating >= star ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted/20"}`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-1">{review.rating}/5</span>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-foreground/90 leading-relaxed mt-3 bg-muted/30 p-3 rounded-lg">"{review.comment}"</p>
                    )}

                    {/* Reply Section */}
                    {review.reply ? (
                      <div className="mt-4 bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">Votre réponse</span>
                          <span className="text-xs text-muted-foreground">
                            • {format(new Date(review.reply.createdAt), "d MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.reply.text}</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {replyingTo === review._id ? (
                          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                            <Textarea
                              placeholder="Écrivez votre réponse..."
                              value={replyText[review._id] || ""}
                              onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                              className="min-h-[100px] resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} disabled={submitting}>
                                Annuler
                              </Button>
                              <Button size="sm" onClick={() => handleReply(review._id)} disabled={!replyText[review._id] || submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Envoyer
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setReplyingTo(review._id)} className="mt-2">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Répondre à cet avis
                          </Button>
                        )}
                      </div>
                    )}
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
