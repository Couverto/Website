import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale";

// Register locale
registerLocale("fr", fr);

export const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [guests, setGuests] = useState("2");

  const handleSearch = () => {
    // Navigate to restaurants page with filters
    const params = new URLSearchParams();
    if (location) params.append("city", location);
    // Format date as YYYY-MM-DD for consistency
    if (date) params.append("date", date.toISOString().split("T")[0]);
    if (guests) params.append("guests", guests);

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
        {/* Lighter global overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Radial gradient centered on text for local contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.5)_0%,_rgba(0,0,0,0)_70%)]" />
        {/* Bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-10 pt-32 animate-in fade-in zoom-in duration-700">
        <div className="space-y-4 max-w-4xl px-4">
          <h1 className="text-3xl font-extrabold tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl text-white drop-shadow-lg text-balance">
            {"Réservez une table simplement."}
          </h1>
          <p className="mx-auto max-w-[700px] text-base sm:text-xl md:text-2xl text-white/95 font-medium drop-shadow-md text-balance">
            {"Découvrez les meilleurs restaurants autour de vous en quelques clics."}
          </p>
        </div>

        <div className="w-full max-w-5xl bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 flex flex-col lg:flex-row gap-4 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-50">
          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              className="pl-12 h-14 text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus-visible:ring-0 focus-visible:bg-transparent"
              placeholder={"Où ? (Ville, code postal)"}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="w-[1px] bg-border hidden lg:block" />

          <div className="flex-1 relative group">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors z-10" />
            <DatePicker
              selected={date}
              onChange={(date: Date | null) => setDate(date || undefined)}
              locale="fr"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText={"Date"}
              className="pl-12 h-14 w-full text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus-visible:ring-0 focus-visible:bg-transparent rounded-md outline-none focus:outline-none placeholder:text-muted-foreground"
              wrapperClassName="w-full"
              popperClassName="!z-[100]"
            />
          </div>

          <div className="w-[1px] bg-border hidden lg:block" />

          <div className="w-full lg:w-[220px]">
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="w-full h-14 text-lg border-transparent bg-muted/30 hover:bg-muted/50 focus:ring-0">
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                  <SelectValue placeholder={"Personnes"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {"Personne"}</SelectItem>
                <SelectItem value="2">2 {"Personnes"}</SelectItem>
                <SelectItem value="3">3 {"Personnes"}</SelectItem>
                <SelectItem value="4">4 {"Personnes"}</SelectItem>
                <SelectItem value="5">5 {"Personnes"}</SelectItem>
                <SelectItem value="6">6+ {"Personnes"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="w-full lg:w-auto h-14 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-5 w-5" />
            {"Trouver un restaurant"}
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Confirmation instantanée
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Sans frais de réservation
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
