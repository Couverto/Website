import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChefHat } from "lucide-react";

interface RestaurantListProps {
  isPreview?: boolean;
  filters?: {
    search?: string;
    city?: string;
    priceRange?: string;
    cuisineType?: string;
    date?: string;
    guests?: string;
  };
}

export const RestaurantList = ({ isPreview = false, filters = {} }: RestaurantListProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchRestaurants = async (currentPage: number, reset = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        size: (isPreview ? 4 : 8).toString(),
        ...filters,
      });

      // Filter out undefined/empty values
      Object.keys(filters).forEach((key) => {
        const k = key as keyof typeof filters;
        if (!filters[k]) queryParams.delete(k);
      });

      const { data } = await axiosConfig.get(`/restaurants/public?${queryParams.toString()}`);

      if (currentPage === 0 || reset) {
        setRestaurants(data.restaurants || []);
      } else {
        setRestaurants((prev) => [...prev, ...(data.restaurants || [])]);
      }
      setHasMore((data.restaurants?.length || 0) === (isPreview ? 4 : 8));
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when switching modes or filters change
    setRestaurants([]);
    setPage(0);
    fetchRestaurants(0, true);
  }, [isPreview, JSON.stringify(filters)]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(nextPage);
  };

  const handleSeeAll = () => {
    navigate("/restaurants");
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-20 bg-muted/20 w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{"Nos restaurants"}</h2>
          {isPreview && (
            <Button
              variant="ghost"
              className="hidden md:flex group text-primary font-bold hover:bg-primary/10 rounded-full px-6 transition-all"
              onClick={handleSeeAll}
            >
              {"Voir tous les restaurants"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

        {loading && page === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(isPreview ? 4 : 8)].map((_, i) => (
              <div key={i} className={`space-y-3 ${isPreview && i === 3 ? "hidden md:block" : ""}`}>
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {restaurants.map((restaurant, index) => (
              <div key={restaurant._id} className={isPreview && index === 3 ? "hidden md:block" : ""}>
                <RestaurantCard restaurant={restaurant} filters={filters} />
              </div>
            ))}
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">{"Les restaurants arrivent bientôt !"}</h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {"Nous sélectionnons actuellement les meilleures adresses pour vous offrir une expérience inoubliable. Revenez très vite !"}
            </p>
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          {isPreview ? (
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => navigate("/restaurants")}>
              {"Voir tous les restaurants"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            hasMore && (
              <Button variant="outline" size="lg" onClick={loadMore} disabled={loading}>
                {loading ? "Chargement..." : "Voir plus de restaurants"}
              </Button>
            )
          )}
        </div>

        {!isPreview && hasMore && (
          <div className="mt-16 text-center hidden md:block">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-12 h-12 text-base shadow-sm hover:shadow-md transition-all"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Voir plus de restaurants"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
