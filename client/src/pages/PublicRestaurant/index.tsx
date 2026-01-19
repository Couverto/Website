import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Loader2, MapPin, Clock, Phone, Globe, Star, ChefHat, Wallet, ChevronLeft } from "lucide-react";
import { BookingDialog } from "../Home/components/Booking/BookingDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

interface PublicRestaurant {
  _id: string;
  name: string;
  description?: string;
  adress?: string;
  city?: string;
  phone?: string;
  website?: string;
  coverImage?: string;
  images?: string[];
  cuisineType?: string[];
  priceRange?: string;
  openingHours?: Record<string, string>;
  menu?: string;
  rating?: number;
}

export const PublicRestaurant = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/public/${id}`);
        setRestaurant(response.data.restaurant);
      } catch (err: any) {
        setError(t("server.global.errors.not_found"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || t("server.global.errors.not_found")}</h2>
        <Button onClick={() => navigate(-1)}>{t("common.back_home")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 bg-background/80 backdrop-blur-sm border-none shadow-md hover:bg-background"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">{restaurant.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <Badge variant="secondary" className="mb-4">
                {Array.isArray(restaurant.cuisineType) ? restaurant.cuisineType.join(", ") : restaurant.cuisineType || "Cuisine"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.city}</span>
                </div>
                {restaurant.priceRange && (
                  <div className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    <span>{restaurant.priceRange}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-foreground">{restaurant.rating || "NEW"}</span>
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all" onClick={() => setIsBookingOpen(true)}>
              {t("pages.public_restaurant.book_table")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">{t("pages.public_restaurant.tabs.overview")}</TabsTrigger>
                <TabsTrigger value="menu">{t("pages.public_restaurant.tabs.menu")}</TabsTrigger>
                <TabsTrigger value="reviews">{t("pages.public_restaurant.tabs.reviews")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">{t("pages.public_restaurant.about")}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {restaurant.description || t("pages.public_restaurant.no_description")}
                  </p>
                </section>

                {restaurant.images && restaurant.images.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{t("pages.public_restaurant.photos")}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {restaurant.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Gallery ${idx}`}
                          className="rounded-lg object-cover w-full h-48 hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="menu">
                <Card>
                  <CardContent className="pt-6">
                    {restaurant.menu ? (
                      <div className="whitespace-pre-wrap text-muted-foreground">{restaurant.menu}</div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t("pages.public_restaurant.no_menu_available")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                    <p>{t("pages.public_restaurant.no_reviews_yet")}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg">{t("pages.public_restaurant.info")}</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t("pages.public_restaurant.address")}</div>
                      <div className="text-sm text-muted-foreground">{restaurant.adress}</div>
                      <div className="text-sm text-muted-foreground">{restaurant.city}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t("pages.public_restaurant.hours")}</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {restaurant.openingHours && Object.keys(restaurant.openingHours).length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between gap-4">
                                <span className="capitalize w-24">{t(`server.restaurant.settings.days.${day.toLowerCase()}`, day)}</span>
                                <span>{hours as string}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          t("common.not_specified")
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm">{restaurant.phone}</span>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Type assertion needed because PublicRestaurant interface might differ slightly from RestaurantInterface expected by BookingDialog */}
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} restaurant={restaurant as any} />
    </div>
  );
};
