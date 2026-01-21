import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

export const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden bg-foreground text-background">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-5 mix-blend-overlay" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
          <div className="h-20 w-20 rounded-3xl bg-background/10 backdrop-blur-sm border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-all duration-500">
            <UtensilsCrossed className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl max-w-3xl mx-auto leading-[1.1]">
              {t("pages.home.cta.title")}
            </h2>
            <p className="mx-auto max-w-[600px] text-background/60 text-xl font-medium leading-relaxed">{t("pages.home.cta.subtitle")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              {t("pages.home.cta.button")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg font-bold rounded-full border-2 bg-transparent border-background/20 text-background hover:bg-background hover:text-foreground w-full sm:w-auto"
            >
              En savoir plus <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-background/40">Pas de carte de crédit requise • Annulation gratuite</p>
        </div>
      </div>
    </section>
  );
};
