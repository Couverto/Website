import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Pricing = () => {
  const { t } = useTranslation();

  const features = [
    t("pages.landing.pricing.feature_1"),
    t("pages.landing.pricing.feature_2"),
    t("pages.landing.pricing.feature_3"),
    t("pages.landing.pricing.feature_4"),
    t("pages.landing.pricing.feature_5"),
    t("pages.landing.pricing.feature_6"),
    t("pages.landing.pricing.feature_7"),
    t("pages.landing.pricing.feature_8"),
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Message */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              {t("pages.landing.pricing.badge")}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">{t("pages.landing.pricing.title")}</h2>
            <p className="text-lg text-muted-foreground mb-6">{t("pages.landing.pricing.subtitle")}</p>
            <p className="text-muted-foreground mb-8">{t("pages.landing.pricing.description")}</p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <span>{t("pages.landing.pricing.free_trial")}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Card */}
          <div className="relative">
            <div className="rounded-2xl border-2 border-primary bg-background p-8 shadow-xl">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                  {t("pages.landing.pricing.plan_badge")}
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-8 pt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">{t("pages.landing.pricing.price")}</span>
                  <span className="text-muted-foreground">{t("pages.landing.pricing.per_month")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("pages.landing.pricing.price_note")}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/register" className="block">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {t("pages.landing.pricing.cta")}
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground mt-4">{t("pages.landing.pricing.cta_note")}</p>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 -top-6 -right-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -z-10 -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
