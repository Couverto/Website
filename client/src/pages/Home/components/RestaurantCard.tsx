import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RestaurantInterface } from "@/interfaces/Restaurant";

interface RestaurantCardProps {
  restaurant: RestaurantInterface;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img
          src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <Badge className="absolute top-2 right-2 bg-white text-black hover:bg-white/90">{restaurant.priceRange}</Badge>
        {restaurant.rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center text-xs">
            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
            {restaurant.rating}
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate" title={restaurant.name}>
            {restaurant.name}
          </h3>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{restaurant.city}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-1">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Utensils className="w-4 h-4 mr-1" />
          <span className="truncate">{restaurant.cuisineType?.join(", ")}</span>
        </div>

        {/* Mock availability for now */}
        <div className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded-md text-center">
          {t("pages.home.card.availability_today")}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">{t("pages.home.card.book_button")}</Button>
      </CardFooter>
    </Card>
  );
};
