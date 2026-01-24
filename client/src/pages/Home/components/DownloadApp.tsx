import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, Star, MapPin } from "lucide-react";
import { useConfigContext } from "@/contexts/configContext";

export const DownloadApp = () => {
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Disponible sur iOS & Android
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Téléchargez {appName} sur votre téléphone{" "}
            </h2>
            <p className="max-w-[600px] mx-auto lg:mx-0 text-white/80 text-xl leading-relaxed">
              {appName + " disponible sur votre portable gratuitement"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
              >
                <Smartphone className="h-6 w-6" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-medium uppercase opacity-70 tracking-wider">Télécharger sur</span>
                  <span className="text-lg leading-none font-bold">App Store</span>
                </div>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
              >
                <Smartphone className="h-6 w-6" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-medium uppercase opacity-70 tracking-wider">DISPONIBLE SUR</span>
                  <span className="text-lg leading-none font-bold">Google Play</span>
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

              {/* Screen Content */}
              <div className="h-full w-full bg-background/95 text-foreground flex flex-col pt-12 relative overflow-hidden">
                {/* App Header */}
                <div className="px-6 pb-4 flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-0 z-10">
                  <span className="font-bold text-lg">{appName}</span>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">JD</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 no-scrollbar">
                  {/* Search Bar */}
                  <div className="h-12 rounded-xl bg-muted/50 w-full flex items-center px-4 text-sm text-muted-foreground">
                    Rechercher un restaurant...
                  </div>

                  {/* Featured Card */}
                  <div className="rounded-2xl overflow-hidden bg-card shadow-sm border border-border/50">
                    <div className="h-32 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
                      <div className="absolute top-2 right-2 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        4.9
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold">Le Gourmet</h4>
                        <span className="text-xs text-muted-foreground">$$$</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <MapPin className="h-3 w-3" /> Paris, 11ème
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll */}
                  <div className="flex gap-3 overflow-x-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="min-w-[120px] h-32 rounded-xl bg-muted/30 p-2 space-y-2">
                        <div className="h-20 rounded-lg bg-gray-200/50 w-full" />
                        <div className="h-3 w-2/3 bg-gray-200/50 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="h-16 bg-background/80 backdrop-blur-md border-t flex justify-around items-center px-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${i === 1 ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                    >
                      <div className="h-4 w-4 bg-current rounded-sm" />
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
