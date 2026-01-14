import { Calendar, LayoutGrid, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ProductOverview = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calendar,
      title: t("pages.landing.product_overview.reservations_title"),
      description: t("pages.landing.product_overview.reservations_desc"),
      image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000&auto=format&fit=crop", // Tablet/reservation management
    },
    {
      icon: LayoutGrid,
      title: t("pages.landing.product_overview.floor_plan_title"),
      description: t("pages.landing.product_overview.floor_plan_desc"),
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop", // Restaurant interior/layout
    },
    {
      icon: Users,
      title: t("pages.landing.product_overview.clients_title"),
      description: t("pages.landing.product_overview.clients_desc"),
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop", // Team/Client interaction
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {t("pages.landing.product_overview.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("pages.landing.product_overview.subtitle")}</p>
        </div>

        {/* Features */}
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div key={index} className={`grid gap-8 lg:gap-16 lg:grid-cols-2 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
              {/* Text Content */}
              <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Mock Screen */}
              <div className={`flex ${index % 2 === 1 ? "lg:col-start-1 lg:justify-end" : "lg:justify-start"}`}>
                <div className="relative w-full max-w-[400px] rounded-xl border border-border bg-card shadow-sm overflow-hidden aspect-video group cursor-pointer hover:shadow-md transition-all duration-500">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating badge */}
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-foreground">{feature.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
