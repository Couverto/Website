import { RestaurantList } from "../Home/components/RestaurantList";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, ChefHat, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export const PublicRestaurants = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    priceRange: searchParams.get("priceRange") || "",
    cuisineType: searchParams.get("cuisineType") || "",
  });

  // Debounce logic for inputs could be added, but user asked for "execute also if you type".
  // RestaurantList has a useEffect that triggers fetch when filters change.
  // We should update URL params when filters change so the URL is shareable/consistent.

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.city) params.set("city", filters.city);
    if (filters.priceRange) params.set("priceRange", filters.priceRange);
    if (filters.cuisineType) params.set("cuisineType", filters.cuisineType);

    // Replace URL without reloading
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleCreateFilterUpdater = (key: keyof typeof filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  // Handlers for text inputs (direct update)
  const handleInputChange = (key: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // Handler for Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Since state updates trigger fetch in RestaurantList, this is mostly for UX feel
      // or forcing a refetch if we were not determining fetch on state change.
      // But here, it is already live.
      // We can blur the input to hide keyboard on mobile
      (e.target as HTMLInputElement).blur();
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "",
      priceRange: "",
      cuisineType: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white shadow-sm">{t("pages.restaurants.list.title")}</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto shadow-sm">{t("pages.restaurants.list.subtitle")}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-card rounded-xl shadow-xl p-6 border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pages.home.search.name_placeholder", "What restaurant?")}
              className="pl-9"
              value={filters.search}
              onChange={handleInputChange("search")}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pages.home.search.location_placeholder", "City")}
              className="pl-9"
              value={filters.city}
              onChange={handleInputChange("city")}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Select value={filters.priceRange || "all"} onValueChange={handleCreateFilterUpdater("priceRange")}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <SelectValue placeholder="Price Range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="$$">$$</SelectItem>
              <SelectItem value="$$$">$$$</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.cuisineType || "all"} onValueChange={handleCreateFilterUpdater("cuisineType")}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ChefHat className="h-4 w-4" />
                <SelectValue placeholder="Cuisine Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Cuisine</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Mexican">Mexican</SelectItem>
              <SelectItem value="Indian">Indian</SelectItem>
            </SelectContent>
          </Select>

          {/* Search button acts as visual confirmation, but search is live */}
          <Button size="lg" className="w-full font-bold">
            {t("pages.home.search.button")}
          </Button>
        </div>

        {/* Reset Filters Link */}
        {(filters.search || filters.city || filters.priceRange || filters.cuisineType) && (
          <div className="text-right mt-2">
            <Button variant="link" onClick={clearFilters} className="text-muted-foreground p-0 h-auto">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-20 mt-8">
        <RestaurantList isPreview={false} filters={filters} />
      </div>
    </div>
  );
};
