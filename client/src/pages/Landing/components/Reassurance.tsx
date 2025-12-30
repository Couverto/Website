import { Shield, Users, Lock, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Reassurance = () => {
  const { t } = useTranslation();

  const reassurances = [
    {
      icon: Users,
      title: t("pages.landing.reassurance.item_1_title"),
      description: t("pages.landing.reassurance.item_1_desc"),
    },
    {
      icon: Shield,
      title: t("pages.landing.reassurance.item_2_title"),
      description: t("pages.landing.reassurance.item_2_desc"),
    },
    {
      icon: Lock,
      title: t("pages.landing.reassurance.item_3_title"),
      description: t("pages.landing.reassurance.item_3_desc"),
    },
    {
      icon: Store,
      title: t("pages.landing.reassurance.item_4_title"),
      description: t("pages.landing.reassurance.item_4_desc"),
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t("pages.landing.reassurance.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("pages.landing.reassurance.subtitle")}</p>
        </div>

        {/* Reassurance Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reassurances.map((item, index) => (
            <div key={index} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
