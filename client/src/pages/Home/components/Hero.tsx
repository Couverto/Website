import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    // Navigate to restaurants page with the city filter
    const params = new URLSearchParams();
    if (location) {
      params.append("city", location);
    }
    navigate(`/restaurants?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] dark:bg-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-10 pt-32 animate-in fade-in zoom-in duration-700">
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-md">
            {t("pages.home.hero.title")}
          </h1>
          <p className="mx-auto max-w-[700px] text-lg sm:text-xl md:text-2xl text-foreground/80 font-medium drop-shadow-sm">
            {t("pages.home.hero.subtitle")}
          </p>
        </div>

        <div className="w-full max-w-5xl bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 flex flex-col lg:flex-row gap-4 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              className="pl-12 h-14 text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus-visible:ring-0 focus-visible:bg-transparent"
              placeholder={t("pages.home.search.location_placeholder")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="w-[1px] bg-border hidden lg:block" />

          <div className="flex-1 relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              type="date"
              className="pl-12 h-14 text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus-visible:ring-0 focus-visible:bg-transparent"
            />
          </div>

          <div className="w-[1px] bg-border hidden lg:block" />

          <div className="w-full lg:w-[220px]">
            <Select defaultValue="2">
              <SelectTrigger className="w-full h-14 text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus:ring-0">
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                  <SelectValue placeholder={t("pages.home.search.guests")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {t("pages.home.search.person")}</SelectItem>
                <SelectItem value="2">2 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="3">3 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="4">4 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="5">5 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="6">6+ {t("pages.home.search.people")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="w-full lg:w-auto h-14 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-5 w-5" />
            {t("pages.home.search.button")}
          </Button>
        </div>

        <div className="flex gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Instant Confirmation
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            No Booking Fees
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-muted-foreground/50 hover:text-primary transition-colors"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
};
