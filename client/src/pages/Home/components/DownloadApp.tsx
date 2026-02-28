import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, Star, MapPin, Search, Heart, Calendar, User, Wifi, Battery, Signal } from "lucide-react";
import { useConfigContext } from "@/contexts/configContext";

export const DownloadApp = () => {
  // const { configValues } = useConfigContext();

  const mobileNav = [
    { icon: Search, active: true },
    { icon: Heart, active: false },
    { icon: Calendar, active: false },
    { icon: User, active: false },
  ];

  const restaurants = [
    {
      name: "Le Gourmet",
      price: "$$$",
      rating: "4.9",
      city: "Paris, 11ème",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Bistrot chic",
      price: "$$",
      rating: "4.7",
      city: "Lyon, 2ème",
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "L'Oasis Plastique",
      price: "$$",
      rating: "4.5",
      city: "Marseille, Vieux Port",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Content Side */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-amber-200 font-semibold tracking-wide">En cours de développement</span>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Couverto arrive <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">bientôt</span>
            </h2>
            <p className="max-w-[600px] mx-auto lg:mx-0 text-white/80 text-xl leading-relaxed">
              Nous préparons une expérience mobile sur-mesure. Bientôt, vous pourrez réserver vos tables préférées directement depuis votre
              poche.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl opacity-80 cursor-default bg-white/5 border border-white/10 hover:bg-white/5 pointer-events-none"
              >
                <Smartphone className="h-6 w-6 text-amber-400/80" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-medium uppercase opacity-70 tracking-wider text-amber-200/80">Prochainement sur</span>
                  <span className="text-lg leading-none font-bold text-white/90">App Store</span>
                </div>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl opacity-80 cursor-default bg-white/5 border border-white/10 hover:bg-white/5 pointer-events-none"
              >
                <Smartphone className="h-6 w-6 text-amber-400/80" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-medium uppercase opacity-70 tracking-wider text-amber-200/80">Prochainement sur</span>
                  <span className="text-lg leading-none font-bold text-white/90">Google Play</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Phone Mockup Side */}
          <div className="flex-1 relative flex justify-center lg:justify-end perspective-[2000px]">
            {/* Main Phone */}
            <div className="relative w-[320px] h-[640px] bg-slate-950 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-slate-900 overflow-hidden z-20 rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-700 ease-in-out ring-1 ring-white/20">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-0 inset-x-0 h-7 bg-black rounded-b-3xl z-30 w-1/3 mx-auto flex justify-center items-center">
                <div className="w-16 h-4 bg-black rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="absolute top-2 inset-x-0 px-8 flex justify-between items-center z-30 text-[10px] font-bold text-foreground/80">
                <div className="flex items-center gap-1">9:41</div>
                <div className="flex items-center gap-1">
                  <Signal className="h-3 w-3" />
                  <Wifi className="h-3 w-3" />
                  <Battery className="h-3 w-3" />
                </div>
              </div>

              {/* Screen Content */}
              <div className="h-full w-full bg-background/95 text-foreground flex flex-col pt-12 relative overflow-hidden">
                {/* App Header */}
                <div className="px-6 pb-4 flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-0 z-10 border-b border-border/10">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <img src="/logos/logo.svg" alt="Logo" className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg font-logo text-primary">Couverto</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">JD</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-6 no-scrollbar">
                  {/* Search Bar */}
                  <div className="mt-4 h-12 rounded-xl bg-muted/50 w-full flex items-center px-4 text-sm text-muted-foreground gap-3">
                    <Search className="h-4 w-4" />
                    Rechercher un restaurant...
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    {["Italien", "Français", "Japonais"].map((cat, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>

                  {/* Restaurant Cards */}
                  <div className="space-y-4">
                    {restaurants.map((rest, i) => (
                      <div
                        key={i}
                        className="rounded-2xl overflow-hidden bg-card shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-[1.02] transition-transform"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="h-32 bg-muted relative">
                          <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {rest.rating}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            2.4 km
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm tracking-tight">{rest.name}</h4>
                            <span className="text-xs text-primary font-bold">{rest.price}</span>
                          </div>
                          <div className="flex items-center text-[11px] text-muted-foreground gap-1">
                            <MapPin className="h-3 w-3" /> {rest.city}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-t border-border/40 flex justify-around items-center px-2 z-20">
                  {mobileNav.map((item, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${item.active ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Badge Floating */}
            <div className="absolute top-20 right-0 lg:-right-12 z-30 animate-bounce delay-1000">
              <div className="bg-white text-black p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-100">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Réservation confirmée</div>
                  <div className="text-xs text-gray-500">Table pour 2 • 20:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
