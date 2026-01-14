import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary z-0" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent z-0" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto text-center space-y-8">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary-foreground max-w-2xl mx-auto">
          {t("pages.home.cta.title")}
        </h2>
        <p className="mx-auto max-w-[600px] text-primary-foreground/80 text-xl font-medium">{t("pages.home.cta.subtitle")}</p>

        <Button size="lg" variant="secondary" className="px-8 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
          {t("pages.home.cta.button")}
        </Button>
      </div>
    </section>
  );
};
