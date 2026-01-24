import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
        setRestaurants(data.restaurants);
      } else {
        setRestaurants((prev) => [...prev, ...data.restaurants]);
      }
      setHasMore(data.restaurants.length === (isPreview ? 4 : 8));
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
        {isPreview && (
          <div className="flex justify-end mb-8">
            <Button variant="ghost" className="hidden md:flex group text-primary font-semibold hover:bg-primary/10" onClick={handleSeeAll}>
              {"Voir tous les restaurants"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {loading && page === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(isPreview ? 4 : 8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} filters={filters} />
            ))}
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div className="text-center py-24 text-muted-foreground text-lg">{"Aucun restaurant trouvé pour le moment."}</div>
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
