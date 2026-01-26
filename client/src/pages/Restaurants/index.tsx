import { RestaurantList } from "../Home/components/RestaurantList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, ChefHat, Wallet, Calendar as CalendarIcon, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { CuisineSelector } from "@/components/CuisineSelector";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr, enUS } from "date-fns/locale";
import { PriceIndicator } from "@/components/customs/PriceIndicator";

// Register locales
registerLocale("fr", fr);
registerLocale("en-US", enUS);

export const PublicRestaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    priceRange: searchParams.get("priceRange") || "",
    cuisineType: searchParams.get("cuisineType") || "",
    date: searchParams.get("date") || "",
    guests: searchParams.get("guests") || "",
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
    if (filters.date) params.set("date", filters.date);
    if (filters.guests) params.set("guests", filters.guests);

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
      date: "",
      guests: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center blur-[2px] scale-105">
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white shadow-sm">{"Tous les restaurants"}</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto shadow-sm">
            {"Découvrez notre sélection des meilleurs restaurants"}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-card rounded-xl shadow-xl p-6 border grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Row 1 */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom du restaurant"
              className="pl-9 bg-background"
              value={filters.search}
              onChange={handleInputChange("search")}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ville"
              className="pl-9 bg-background"
              value={filters.city}
              onChange={handleInputChange("city")}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="md:col-span-2 relative">
            <DatePicker
              selected={filters.date ? new Date(filters.date) : undefined}
              onChange={(date: Date | null) => handleCreateFilterUpdater("date")(date ? date.toISOString().split("T")[0] : "")}
              locale="fr"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText={"Date"}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
              wrapperClassName="w-full"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="md:col-span-2">
            <Select value={filters.guests || "all"} onValueChange={handleCreateFilterUpdater("guests")}>
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <SelectValue placeholder="Convives" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nombre de personnes</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Personne{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
                <SelectItem value="11">10+ Personnes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2 */}
          <div className="md:col-span-2">
            <Select value={filters.priceRange || "all"} onValueChange={handleCreateFilterUpdater("priceRange")}>
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <SelectValue placeholder="Prix" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="$">
                  <PriceIndicator value="$" variant="compact" />
                </SelectItem>
                <SelectItem value="$$">
                  <PriceIndicator value="$$" variant="compact" />
                </SelectItem>
                <SelectItem value="$$$">
                  <PriceIndicator value="$$$" variant="compact" />
                </SelectItem>
                <SelectItem value="$$$$">
                  <PriceIndicator value="$$$$" variant="compact" />
                </SelectItem>
                <SelectItem value="$$$$$">
                  <PriceIndicator value="$$$$$" variant="compact" />
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-8">
            <CuisineSelector
              value={filters.cuisineType ? filters.cuisineType.split(",") : []}
              onChange={(val) => handleCreateFilterUpdater("cuisineType")(val.join(","))}
              variant="compact"
              className=""
            />
          </div>

          <div className="md:col-span-2">
            <Button className="w-full h-9 font-bold shadow-md hover:shadow-xl hover:translate-y-[-1px] transition-all duration-300">
              {"Trouver un restaurant"}
            </Button>
          </div>
        </div>

        {/* Reset Filters Link - Subtle but clear hover */}
        {(filters.search || filters.city || filters.priceRange || filters.cuisineType) && (
          <div className="text-right mt-3">
            <Button
              variant="link"
              onClick={clearFilters}
              className="text-muted-foreground p-0 h-auto hover:text-primary hover:no-underline transition-colors font-medium"
            >
              Réinitialiser les filtres
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
