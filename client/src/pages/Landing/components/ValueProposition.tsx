import { Calendar, ClipboardList, LayoutGrid, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ValueProposition = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Calendar,
      title: t("pages.landing.value_proposition.benefit_1_title"),
      description: t("pages.landing.value_proposition.benefit_1_desc"),
    },
    {
      icon: LayoutGrid,
      title: t("pages.landing.value_proposition.benefit_2_title"),
      description: t("pages.landing.value_proposition.benefit_2_desc"),
    },
    {
      icon: ClipboardList,
      title: t("pages.landing.value_proposition.benefit_3_title"),
      description: t("pages.landing.value_proposition.benefit_3_desc"),
    },
    {
      icon: Zap,
      title: t("pages.landing.value_proposition.benefit_4_title"),
      description: t("pages.landing.value_proposition.benefit_4_desc"),
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {t("pages.landing.value_proposition.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("pages.landing.value_proposition.subtitle")}</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <benefit.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
