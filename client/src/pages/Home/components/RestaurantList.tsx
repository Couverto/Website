import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();

  const fetchRestaurants = async (currentPage: number) => {
    try {
      setLoading(true);
      const { data } = await axiosConfig.get(`/restaurants/public?page=${currentPage}&size=8`);
      if (currentPage === 0) {
        setRestaurants(data.restaurants);
      } else {
        setRestaurants((prev) => [...prev, ...data.restaurants]);
      }
      setHasMore(data.restaurants.length === 8);
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(0);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(nextPage);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.list.title")}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">{t("pages.home.list.subtitle")}</p>
        </div>

        {loading && page === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">{t("pages.home.list.no_results")}</div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" onClick={loadMore} disabled={loading}>
              {loading ? t("pages.home.list.loading") : t("pages.home.list.load_more")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
