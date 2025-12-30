import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Pricing = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pages.landing.pricing.plan_starter_name"),
      price: t("pages.landing.pricing.plan_starter_price"),
      description: t("pages.landing.pricing.plan_starter_desc"),
      popular: false,
      features: [
        // Included first
        { name: t("pages.landing.pricing.feature_reservations"), included: true, limit: "30/mois" },
        { name: t("pages.landing.pricing.feature_floor_plan"), included: true, note: "1 salle" },
        { name: t("pages.landing.pricing.feature_clients"), included: true, limit: "50" },
        { name: t("pages.landing.pricing.feature_multi_device"), included: true },
        { name: t("pages.landing.pricing.feature_support"), included: true, note: "email" },
        // Not included
        { name: t("pages.landing.pricing.feature_reminders_email"), included: false },
        { name: t("pages.landing.pricing.feature_reminders_sms"), included: false },
        { name: t("pages.landing.pricing.feature_stats"), included: false },
        { name: t("pages.landing.pricing.feature_export"), included: false },
        { name: t("pages.landing.pricing.feature_api"), included: false },
      ],
    },
    {
      name: t("pages.landing.pricing.plan_pro_name"),
      price: t("pages.landing.pricing.plan_pro_price"),
      description: t("pages.landing.pricing.plan_pro_desc"),
      popular: true,
      features: [
        // Included first
        { name: t("pages.landing.pricing.feature_reservations"), included: true, limit: t("pages.landing.pricing.unlimited") },
        { name: t("pages.landing.pricing.feature_floor_plan"), included: true, note: "1 salle" },
        { name: t("pages.landing.pricing.feature_clients"), included: true, limit: t("pages.landing.pricing.unlimited") },
        { name: t("pages.landing.pricing.feature_multi_device"), included: true },
        { name: t("pages.landing.pricing.feature_support"), included: true, note: "prioritaire" },
        { name: t("pages.landing.pricing.feature_reminders_email"), included: true },
        { name: t("pages.landing.pricing.feature_stats"), included: true, note: "basiques" },
        { name: t("pages.landing.pricing.feature_export"), included: true },
        // Not included
        { name: t("pages.landing.pricing.feature_reminders_sms"), included: false },
        { name: t("pages.landing.pricing.feature_api"), included: false },
      ],
    },
    {
      name: t("pages.landing.pricing.plan_enterprise_name"),
      price: t("pages.landing.pricing.plan_enterprise_price"),
      description: t("pages.landing.pricing.plan_enterprise_desc"),
      popular: false,
      features: [
        // All included
        { name: t("pages.landing.pricing.feature_reservations"), included: true, limit: t("pages.landing.pricing.unlimited") },
        { name: t("pages.landing.pricing.feature_floor_plan"), included: true, note: "multi-salles" },
        { name: t("pages.landing.pricing.feature_clients"), included: true, limit: t("pages.landing.pricing.unlimited") },
        { name: t("pages.landing.pricing.feature_multi_device"), included: true },
        { name: t("pages.landing.pricing.feature_support"), included: true, note: "dédié 24/7" },
        { name: t("pages.landing.pricing.feature_reminders_email"), included: true },
        { name: t("pages.landing.pricing.feature_reminders_sms"), included: true },
        { name: t("pages.landing.pricing.feature_stats"), included: true, note: "avancées" },
        { name: t("pages.landing.pricing.feature_export"), included: true },
        { name: t("pages.landing.pricing.feature_api"), included: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-6xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
            {t("pages.landing.pricing.badge")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t("pages.landing.pricing.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("pages.landing.pricing.subtitle")}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl bg-background p-5 ${
                plan.popular ? "border-2 border-primary shadow-xl scale-105" : "border border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    {t("pages.landing.pricing.popular")}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{t("pages.landing.pricing.per_month")}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("pages.landing.pricing.price_note")}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${
                        feature.included ? "bg-accent/10" : "bg-muted"
                      }`}
                    >
                      {feature.included ? <Check className="h-3 w-3 text-accent" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {feature.name}
                      {feature.limit && feature.included && <span className="text-muted-foreground text-xs ml-1">({feature.limit})</span>}
                      {feature.note && feature.included && <span className="text-muted-foreground text-xs ml-1">• {feature.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/register" className="block">
                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {t("pages.landing.pricing.cta")}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span>{t("pages.landing.pricing.no_commitment")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span>{t("pages.landing.pricing.cancel_anytime")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span>{t("pages.landing.pricing.secure_payment")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
