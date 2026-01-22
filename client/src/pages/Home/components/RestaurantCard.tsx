import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Utensils, MoreHorizontal, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { BookingDialog } from "./Booking/BookingDialog";
import { useState } from "react";
import { RestaurantCardProps } from "@/interfaces/Components";

export const RestaurantCard = ({ restaurant, filters }: RestaurantCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleCardClick = () => {
    const params = new URLSearchParams();
    if (filters?.date) params.append("date", filters.date);
    if (filters?.guests) params.append("guests", filters.guests);
    const queryString = params.toString();
    navigate(`/restaurants/infos/${restaurant._id}${queryString ? `?${queryString}` : ""}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {restaurant.rating > 0 && (
              <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm border-none shadow-sm flex items-center gap-1 w-fit">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{restaurant.rating}</span>
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/restaurants/infos/${restaurant._id}`)}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>{t("common.learn_more")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            {restaurant.priceRange && (
              <Badge variant="outline" className="text-white border-white/40 bg-black/20 backdrop-blur-sm mb-2 hover:bg-black/40">
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
              </Badge>
            )}
            <h3 className="font-bold text-xl leading-tight text-white shadow-sm truncate">{restaurant.name}</h3>
            <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{restaurant.city}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.isArray(restaurant.cuisineType) &&
              restaurant.cuisineType.slice(0, 3).map((type, i) => (
                <Badge key={i} variant="secondary" className="font-normal text-xs bg-muted/50 hover:bg-muted">
                  {type}
                </Badge>
              ))}
          </div>

          {restaurant.shortDescription && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{restaurant.shortDescription}</p>}

          {restaurant.features && restaurant.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {restaurant.features.slice(0, 3).map((f) => {
                const key = f.toLowerCase().replace(/ /g, "_");
                // Manual mapping for known discrepancies or strict matching if needed
                const translationKey = `create.steps.details.options.${key}`;
                return (
                  <Badge key={f} variant="outline" className="text-[10px] px-1 h-5">
                    {t(translationKey, { defaultValue: f })}
                  </Badge>
                );
              })}
              {restaurant.features.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{restaurant.features.length - 3}</span>
              )}
            </div>
          )}

          {restaurant.isClosed ? (
            <div className="flex items-center gap-2 text-xs font-medium p-2 rounded border mt-auto text-red-600 bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              {t("pages.restaurant.settings.restaurant_closed")}
            </div>
          ) : (
            restaurant.isOpenNow !== undefined && (
              <div
                className={`flex items-center gap-2 text-xs font-medium p-2 rounded border mt-auto ${
                  restaurant.isOpenNow
                    ? "text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50"
                    : "text-red-600 bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${restaurant.isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {restaurant.isOpenNow ? t("pages.public_restaurant.open_now") : t("pages.public_restaurant.closed_now")}
              </div>
            )
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full font-semibold shadow-sm hover:shadow-md transition-all"
            disabled={restaurant.isClosed}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookingOpen(true);
            }}
          >
            {restaurant.isClosed ? t("pages.restaurant.settings.restaurant_closed") : t("pages.home.card.book_button")}
          </Button>
        </CardFooter>
      </Card>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        restaurant={restaurant}
        initialData={{ date: filters?.date, guests: filters?.guests }}
      />
    </>
  );
};
