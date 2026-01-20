import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Loader2, MapPin, Clock, Phone, Globe, Star, ChefHat, Wallet, ChevronLeft, FileText, ExternalLink } from "lucide-react";
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.adress} ${restaurant.city}`)}`;

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
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
                >
                  <MapPin className="h-4 w-4 group-hover:animate-bounce" />
                  <span className="underline decoration-dotted underline-offset-4">{restaurant.city}</span>
                </a>
                {restaurant.priceRange && (
                  <div className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    <span>
                      {t(
                        `create.steps.identity.price_options.${
                          restaurant.priceRange === "$"
                            ? "vlow"
                            : restaurant.priceRange === "$$"
                              ? "low"
                              : restaurant.priceRange === "$$$"
                                ? "medium"
                                : restaurant.priceRange === "$$$$"
                                  ? "high"
                                  : "vhigh"
                        }`,
                      )}
                    </span>
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

                {restaurant.features && restaurant.features.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{t("pages.public_restaurant.features")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.features.map((f) => {
                        const key = f.toLowerCase().replace(/ /g, "_");
                        const translationKey = `create.steps.details.options.${key}`;
                        return (
                          <Badge key={f} variant="secondary" className="px-3 py-1 text-sm">
                            {t(translationKey, { defaultValue: f })}
                          </Badge>
                        );
                      })}
                    </div>
                  </section>
                )}

                {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">{t("pages.public_restaurant.payment_methods")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.paymentMethods.map((m) => {
                        const key = m.toLowerCase().replace(/ /g, "_");
                        return (
                          <Badge key={m} variant="secondary" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/10">
                            {t(`create.steps.details.payment_options.${key}`, m)}
                          </Badge>
                        );
                      })}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="menu">
                <Card>
                  <CardContent className="pt-6">
                    {restaurant.menu && restaurant.menu.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {restaurant.menu.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t("pages.public_restaurant.view_menu", { count: idx + 1 })}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                  {url.split(".").pop()?.toUpperCase() || "PDF"}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                      </div>
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
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 group hover:text-primary transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 group-hover:animate-bounce" />
                    <div>
                      <div className="font-medium">{t("pages.public_restaurant.address")}</div>
                      <div className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors underline decoration-dotted underline-offset-2">
                        {restaurant.adress}, {restaurant.city}
                      </div>
                    </div>
                  </a>

                  <Separator />

                  {(restaurant.capacity ?? 0) > 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <ChefHat className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t("pages.public_restaurant.capacity")}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("pages.public_restaurant.seats", { count: restaurant.capacity })}
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

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
      {/* Type assertion needed because PublicRestaurant interface might differ slightly from RestaurantInterface expected by BookingDialog */}
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} restaurant={restaurant as any} />
    </div>
  );
};
