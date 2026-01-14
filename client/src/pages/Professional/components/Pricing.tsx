import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { axiosConfig } from "@/config/axiosConfig";
import { Plan } from "@/interfaces/Plan";
import { Skeleton } from "@/components/ui/skeleton";

export const Pricing = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosConfig.get("/plans/public");
        setPlans(response.data.plans);
      } catch (error) {
        console.error("Error fetching plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section id="pricing" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto max-w-8xl px-3 md:px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
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
          {plans.map((plan) => (
            <div key={plan._id} className={`relative rounded-2xl bg-background p-5 border border-border flex flex-col`}>
              {/* Plan Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">€ / {t("pages.landing.pricing.per_month")}</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mt-0.5 bg-accent/10">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/register" className="block mt-auto">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
