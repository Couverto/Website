import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Utensils, ArrowRight, Phone, Globe, Mail, Users, Facebook, Instagram, Music } from "lucide-react";
import { PriceIndicator } from "@/components/customs/PriceIndicator";
import { Separator } from "@/components/ui/separator";

export const AccountRestaurants = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = authUser?.role === "admin";

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axiosConfig.get("/restaurants/my");
        setRestaurants(data.restaurants || []);
      } catch (error) {
        console.error("Failed to fetch restaurants", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{"Mes Restaurants"}</CardTitle>
            <CardDescription>{"Gérez vos établissements ici."}</CardDescription>
          </div>
          <Button onClick={() => navigate("/pro/create-restaurant")}>
            <Plus className="mr-2 h-4 w-4" />
            {"Ajouter un restaurant"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore de restaurant.</p>
              <Link to="/pro/create-restaurant">
                <Button variant="outline">Créez votre premier établissement</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 text-card-foreground">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant._id}
                  className="group overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row bg-card cursor-pointer"
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                >
                  {/* Image Section */}
                  <div className="relative w-full md:w-[320px] lg:w-[400px] h-[240px] md:h-auto overflow-hidden">
                    {restaurant.coverImage ? (
                      <img
                        src={restaurant.coverImage}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <Utensils className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {restaurant.rating > 0 && (
                        <Badge className="bg-white/95 text-black hover:bg-white border-none shadow-md backdrop-blur-sm flex items-center gap-1.5 py-1 px-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-black text-sm">{restaurant.rating}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4">
                      {restaurant.priceRange && <PriceIndicator value={restaurant.priceRange} variant="compact" className="shadow-lg" />}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors flex items-center gap-3">
                          {restaurant.name}
                          {restaurant.subscriptionStatus === "active" && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20 pointer-events-none"
                            >
                              {restaurant.subscriptionStatus}
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {restaurant.adress}, {restaurant.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {restaurant.isClosed ? (
                          <Badge variant="destructive" className="px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] shadow-sm">
                            Fermé
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] shadow-sm">
                            Ouvert
                          </Badge>
                        )}
                      </div>
                    </div>

                    {restaurant.shortDescription && (
                      <p className="text-muted-foreground text-sm max-w-2xl mb-6 italic leading-relaxed">"{restaurant.shortDescription}"</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-card-foreground">
                      <div className="flex items-center gap-3 text-sm group/item">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                          <Phone className="w-4 h-4 text-muted-foreground group-hover/item:text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Téléphone</p>
                          <p className="font-semibold">{restaurant.phone || "Non renseigné"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm group/item">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                          <Mail className="w-4 h-4 text-muted-foreground group-hover/item:text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Email</p>
                          <p className="font-semibold truncate max-w-[150px]">{restaurant.email || "Non renseigné"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm group/item">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                          <Users className="w-4 h-4 text-muted-foreground group-hover/item:text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Capacité</p>
                          <p className="font-semibold">{restaurant.capacity || 0} couverts</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-auto pt-6 border-t border-border">
                      <div className="flex flex-wrap gap-2 flex-1">
                        {restaurant.cuisineType?.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="bg-muted/30 text-muted-foreground border-transparent font-medium py-1 px-3"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {restaurant.socials?.instagram && (
                            <a
                              href={restaurant.socials.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-pink-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                          {restaurant.socials?.facebook && (
                            <a
                              href={restaurant.socials.facebook}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-blue-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Facebook className="w-5 h-5" />
                            </a>
                          )}
                          {restaurant.socials?.tiktok && (
                            <a
                              href={restaurant.socials.tiktok}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-black transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Music className="w-5 h-5" />
                            </a>
                          )}
                          {restaurant.website && (
                            <a
                              href={restaurant.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-5 h-5" />
                            </a>
                          )}
                        </div>

                        <Button
                          size="sm"
                          className="font-bold gap-2 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurant/${restaurant._id}`);
                          }}
                        >
                          Tableau de Bord
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
