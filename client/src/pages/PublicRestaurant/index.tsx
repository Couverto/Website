import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Loader2, MapPin, Clock, Phone, Globe, Star, ChefHat, Wallet, ChevronLeft, MessageSquare } from "lucide-react";
import { BookingDialog } from "../Home/components/Booking/BookingDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/customs/loading";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SEO } from "@/components/SEO";
import { ImageViewer } from "@/components/customs/ImageViewer";
import { PriceIndicator } from "@/components/customs/PriceIndicator";
import { MenuMediaItem } from "./components/MenuMediaItem";
import { getNextOpeningText } from "@/utils/getNextOpening";

interface PublicRestaurant {
  _id: string;
  name: string;
  description?: string;
  adress?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  coverImage?: string;
  images?: string[];
  cuisineType?: string[];
  priceRange?: string;
  openingHours?: Record<string, { isClosed: boolean; periods: { open: string; close: string }[] }>;
  menu?: string[];
  rating?: number;
  features?: string[];
  paymentMethods?: string[];
  averagePrice?: number;
  capacity?: number;
  socials?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  isOpenNow?: boolean;
  isClosed?: boolean;
  reviews?: string[];
}

export const PublicRestaurant = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/public/${id}`);
        const data = response.data.restaurant;
        setRestaurant(data);

        if (data.coverImage) {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = data.coverImage!; // Non-null assertion safe due to check
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
      } catch (err: any) {
        setError("Ressource non trouvée");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await api.get(`/reviews/restaurant/${id}`);
        setReviewsList(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (id) {
      fetchRestaurant();
      fetchReviews();
    }
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Ressource non trouvée"}</h2>
        <Button onClick={() => navigate(-1)}>{"Retour à l'accueil"}</Button>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.adress} ${restaurant.city}`)}`;

  // Compute dynamic rating from reviews
  const computedRating =
    reviewsList.length > 0 ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1) : null;
  const displayRating = computedRating || restaurant.rating || "NEW";

  const nextOpeningText = !restaurant.isClosed && !restaurant.isOpenNow ? getNextOpeningText(restaurant.openingHours) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    image: restaurant.images || [restaurant.coverImage],
    description: restaurant.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.adress,
      addressLocality: restaurant.city,
      addressCountry: "FR",
    },
    url: `${window.location.origin}/restaurants/infos/${restaurant._id}`,
    telephone: restaurant.phone,
    priceRange: restaurant.priceRange,
    servesCuisine: Array.isArray(restaurant.cuisineType) ? restaurant.cuisineType.join(", ") : restaurant.cuisineType,
    openingHoursSpecification: restaurant.openingHours
      ? Object.entries(restaurant.openingHours).flatMap(([day, schedule]) => {
          if (schedule.isClosed) return [];
          return schedule.periods.map((p) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: day,
            opens: p.open,
            closes: p.close,
          }));
        })
      : [],
    menu: restaurant.menu?.[0],
    acceptsReservations: "True",
    aggregateRating:
      reviewsList.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: displayRating,
            reviewCount: reviewsList.length,
          }
        : undefined,
  };

  const keywords = `${restaurant.name}, restaurant, ${restaurant.city}, réservation, table${
    Array.isArray(restaurant.cuisineType) && restaurant.cuisineType.length > 0
      ? ", " + restaurant.cuisineType.join(", ")
      : restaurant.cuisineType
        ? ", " + restaurant.cuisineType
        : ""
  }`.trim();

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <SEO
        title={`${restaurant.name} - ${restaurant.city} - Réservation Couverto`}
        description={`Réservez une table chez ${restaurant.name} à ${restaurant.city}. ${Array.isArray(restaurant.cuisineType) ? restaurant.cuisineType.join(", ") : restaurant.cuisineType}. ${restaurant.description?.substring(0, 150) || ""}...`}
        keywords={keywords}
        image={restaurant.coverImage}
        url={`/restaurants/infos/${restaurant._id}`}
        jsonLd={jsonLd}
      />
      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 hidden md:inline-flex bg-background/80 backdrop-blur-sm border-none shadow-md hover:bg-background"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">{restaurant.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="hidden md:flex flex-wrap items-center gap-2 mb-4">
                {Array.isArray(restaurant.cuisineType) && restaurant.cuisineType.length > 0 ? (
                  <>
                    {restaurant.cuisineType.slice(0, 3).map((cuisine, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-background/80 backdrop-blur-md border-none shadow-sm px-3 py-1 text-xs"
                      >
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisineType.length > 3 && (
                      <span className="text-xs text-muted-foreground font-medium">+{restaurant.cuisineType.length - 3}</span>
                    )}
                  </>
                ) : (
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                    {restaurant.cuisineType || "Cuisine"}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2 drop-shadow-sm">{restaurant.name}</h1>
              <div className="hidden md:flex items-center gap-4 text-muted-foreground">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
                >
                  <MapPin className="h-4 w-4 group-hover:animate-bounce" />
                  <span className="underline decoration-dotted underline-offset-4 font-medium text-foreground/90 shadow-black/10 drop-shadow-md">
                    {restaurant.city}
                  </span>
                </a>

                <PriceIndicator value={restaurant.priceRange || "$"} variant="compact" />

                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-foreground">{displayRating}</span>
                </div>
              </div>
              <div className="hidden md:block mt-4">
                {restaurant.isClosed ? (
                  <Badge variant="destructive" className="mt-4 text-sm py-1 px-3 bg-red-600 hover:bg-red-700">
                    {"Restaurant fermé"}
                  </Badge>
                ) : (
                  restaurant.isOpenNow !== undefined && (
                    <Badge
                      variant={restaurant.isOpenNow ? "default" : "outline"}
                      className={`mt-4 text-sm py-1 px-3 ${
                        restaurant.isOpenNow
                          ? "bg-green-500 hover:bg-green-600"
                          : nextOpeningText?.startsWith("Ouvre")
                            ? "bg-primary/10 text-primary/80 border-primary/20 hover:bg-primary/15"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15 dark:text-amber-400"
                      }`}
                    >
                      {restaurant.isOpenNow ? "Ouvert maintenant" : nextOpeningText || "Fermé actuellement"}
                    </Badge>
                  )
                )}
              </div>
            </div>
            <div className="hidden md:block w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all h-12 md:h-11"
                onClick={() => setIsBookingOpen(true)}
                disabled={restaurant.isClosed || (restaurant.capacity || 0) <= 0}
              >
                {restaurant.isClosed ? "Restaurant fermé" : (restaurant.capacity || 0) <= 0 ? "Complet" : "Réserver une table"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Info Section */}
      <div className="md:hidden container mx-auto px-4 mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {Array.isArray(restaurant.cuisineType) && restaurant.cuisineType.length > 0 ? (
            <>
              {restaurant.cuisineType.map((cuisine, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs">
                  {cuisine}
                </Badge>
              ))}
            </>
          ) : (
            <Badge variant="secondary">{restaurant.cuisineType || "Cuisine"}</Badge>
          )}
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground border-b pb-4">
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="underline decoration-dotted underline-offset-4">{restaurant.city}</span>
          </a>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span>
              {restaurant.priceRange === "$"
                ? "Très abordable"
                : restaurant.priceRange === "$$"
                  ? "Abordable"
                  : restaurant.priceRange === "$$$"
                    ? "Prix moyen"
                    : restaurant.priceRange === "$$$$"
                      ? "Haut de gamme"
                      : "Luxe"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium text-foreground">{restaurant.rating || "NEW"}</span>
          </div>
          <div className="mt-1">
            {restaurant.isClosed ? (
              <Badge variant="destructive" className="bg-red-600 text-[10px] py-0 px-2">
                {"Restaurant fermé"}
              </Badge>
            ) : (
              restaurant.isOpenNow !== undefined && (
                <Badge
                  variant={restaurant.isOpenNow ? "default" : "outline"}
                  className={`text-[10px] py-0 px-2 ${
                    restaurant.isOpenNow
                      ? "bg-green-500 hover:bg-green-600"
                      : nextOpeningText?.startsWith("Ouvre")
                        ? "bg-primary/10 text-primary/80 border-primary/20 hover:bg-primary/15"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15 dark:text-amber-400"
                  }`}
                >
                  {restaurant.isOpenNow ? "Ouvert maintenant" : nextOpeningText || "Fermé actuellement"}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8 h-auto p-1 bg-muted/50 rounded-xl w-full md:w-auto grid grid-cols-3 md:flex gap-1">
                <TabsTrigger
                  value="overview"
                  className="px-6 py-2.5 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
                >
                  {"Aperçu"}
                </TabsTrigger>
                <TabsTrigger
                  value="menu"
                  className="px-6 py-2.5 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
                >
                  {"Menu"}
                </TabsTrigger>
                {reviewsList.length > 0 && (
                  <TabsTrigger
                    value="reviews"
                    className="px-6 py-2.5 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
                  >
                    {"Avis"} <span className="ml-1 text-xs text-muted-foreground">({reviewsList.length})</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{"À propos"}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {restaurant.description || "Aucune description disponible."}
                  </p>
                </section>

                {restaurant.images && restaurant.images.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{"Photos"}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {restaurant.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Gallery ${idx}`}
                          className="rounded-lg object-cover w-full h-48 hover:opacity-90 transition-opacity cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setIsGalleryOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {restaurant.features && restaurant.features.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{"Équipements"}</h2>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.features.map((f) => (
                        <Badge key={f} variant="secondary" className="px-3 py-1 text-sm">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{"Moyens de paiement"}</h2>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.paymentMethods.map((m) => (
                        <Badge key={m} variant="secondary" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/10">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="menu">
                <Card>
                  <CardContent className="pt-6">
                    {restaurant.menu && restaurant.menu.length > 0 ? (
                      <div className="space-y-6">
                        {restaurant.menu.map((url, idx) => (
                          <MenuMediaItem key={idx} url={url} index={idx} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{"Menu non disponible."}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6">
                  {/* Rating Summary */}
                  {reviewsList.length > 0 && (
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          {/* Average Rating */}
                          <div className="text-center md:text-left">
                            <div className="text-5xl font-bold text-primary">{displayRating}</div>
                            <div className="flex items-center justify-center md:justify-start gap-0.5 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${parseFloat(displayRating as string) >= star ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted/30"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{reviewsList.length} avis</p>
                          </div>

                          {/* Rating Distribution */}
                          <div className="flex-1 w-full md:w-auto space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewsList.filter((r) => r.rating === rating).length;
                              const percentage = (count / reviewsList.length) * 100;
                              return (
                                <div key={rating} className="flex items-center gap-2">
                                  <span className="text-xs w-3 font-medium">{rating}</span>
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-8">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  <Card>
                    <CardContent className="pt-6">
                      {loadingReviews ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : reviewsList.length > 0 ? (
                        <div className="space-y-6">
                          {reviewsList.map((review, index) => (
                            <div key={review._id} className={`${index !== reviewsList.length - 1 ? "pb-6 border-b" : ""}`}>
                              <div className="flex gap-4">
                                {/* Avatar */}
                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                  <AvatarImage src={review.user?.avatar} alt={review.user?.forename} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {review.user?.forename?.charAt(0) || "?"}
                                    {review.user?.name?.charAt(0) || ""}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-semibold">
                                      {review.user?.forename} {review.user?.name?.charAt(0)}.
                                    </span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
                                    </span>
                                  </div>

                                  {/* Stars */}
                                  <div className="flex items-center gap-0.5 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${review.rating >= star ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted/20"}`}
                                      />
                                    ))}
                                  </div>

                                  {/* Comment */}
                                  {review.comment && <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>}

                                  {/* Restaurant Reply */}
                                  {review.reply && (
                                    <div className="mt-4 bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-sm">Réponse du restaurant</span>
                                        <span className="text-xs text-muted-foreground">
                                          • {format(new Date(review.reply.createdAt), "d MMM yyyy", { locale: fr })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{review.reply.text}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>{"Aucun avis pour le moment."}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg">{"Informations"}</h3>

                <div className="space-y-4">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 group hover:text-primary transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 group-hover:animate-bounce" />
                    <div>
                      <div className="font-medium">{"Adresse"}</div>
                      <div className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors underline decoration-dotted underline-offset-2">
                        {restaurant.adress}
                      </div>
                    </div>
                  </a>

                  <Separator />
                  {/* 
                  {(restaurant.capacity ?? 0) > 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <ChefHat className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{"Capacité"}</div>
                          <div className="text-sm text-muted-foreground">
                            <div className="text-sm text-muted-foreground">
                              {restaurant.capacity} place{restaurant.capacity! > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )} */}

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{"Horaires d'ouverture"}</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {restaurant.openingHours && Object.keys(restaurant.openingHours).length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {Object.entries(restaurant.openingHours).map(([day, schedule]: [string, any]) => {
                              const dayMap: Record<string, string> = {
                                monday: "Lundi",
                                tuesday: "Mardi",
                                wednesday: "Mercredi",
                                thursday: "Jeudi",
                                friday: "Vendredi",
                                saturday: "Samedi",
                                sunday: "Dimanche",
                                MO: "Lundi",
                                TU: "Mardi",
                                WE: "Mercredi",
                                TH: "Jeudi",
                                FR: "Vendredi",
                                SA: "Samedi",
                                SU: "Dimanche",
                              };
                              return (
                                <div key={day} className="flex justify-between gap-4">
                                  <span className="capitalize w-24">{dayMap[day] || day}</span>
                                  <span className={`${schedule?.isClosed ? "text-destructive font-medium" : ""}`}>
                                    {schedule?.isClosed
                                      ? "Fermé"
                                      : schedule?.periods?.map((p: any) => `${p.open} - ${p.close}`).join(", ") || "-"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          "Non spécifié"
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a href={`tel:${restaurant.phone}`} className="text-sm hover:text-primary transition-colors">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary shrink-0" />
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {restaurant.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {restaurant.socials && Object.values(restaurant.socials).some(Boolean) && (
                    <>
                      <Separator />
                      <div className="flex gap-4 pt-2">
                        {restaurant.socials.facebook && (
                          <a
                            href={restaurant.socials.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                        {restaurant.socials.instagram && (
                          <a
                            href={restaurant.socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.047-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.067-.06-1.407-.06-4.123v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08zm-1.87 9.176a3 3 0 101.87 0 1.5 1.5 0 01-1.87 0zm6.576-5.826a1.05 1.05 0 11-2.1 0 1.05 1.05 0 012.1 0zM12 7a5 5 0 100 10 5 5 0 000-10z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:hidden z-40 animate-in slide-in-from-bottom-full duration-500 safe-area-bottom">
        <Button
          size="lg"
          className="w-full shadow-lg font-bold text-lg h-12"
          onClick={() => setIsBookingOpen(true)}
          disabled={restaurant.isClosed || (restaurant.capacity || 0) <= 0}
        >
          {restaurant.isClosed ? "Fermé" : (restaurant.capacity || 0) <= 0 ? "Complet" : "Réserver une table"}
        </Button>
      </div>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        restaurant={restaurant as any}
        initialData={{
          date: searchParams.get("date") || undefined,
          guests: searchParams.get("guests") || undefined,
        }}
      />

      <ImageViewer
        images={restaurant.images || []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={currentImageIndex}
      />
    </div>
  );
};
