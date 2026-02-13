import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import { axiosConfig } from "@/config/axiosConfig";
import { Plan } from "@/interfaces/Plan";
import { Feature } from "@/interfaces/Feature";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/authContext";

export const Pricing = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([axiosConfig.get("/plans/public"), axiosConfig.get("/features/public")]);
        setPlans(plansRes.data.plans || []);
        setAllFeatures(featuresRes.data.features || []);
      } catch (error) {
        console.error("Error fetching pricing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
            {"Tarification claire"}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {"Une formule adaptée à chaque restaurant"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Des tarifs simples et transparents, sans surprise. Choisissez la formule qui correspond à vos besoins."}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl bg-background p-6 border flex flex-col shadow-sm hover:shadow-md transition-shadow 
                ${plan.isPopular ? "border-primary shadow-md scale-105 z-10" : "border-border"}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Le plus populaire
                </div>
              )}
              {/* Plan Header */}
              <div className="text-center mb-8 pb-4 border-b border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">€ / mois</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {allFeatures?.map((feature) => {
                  const isIncluded = plan.features?.some((f) => f._id === feature._id);
                  return (
                    <li
                      key={feature._id}
                      className={`flex items-start gap-3 ${isIncluded ? "text-foreground" : "text-muted-foreground/60"}`}
                    >
                      <div
                        className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${isIncluded ? "bg-accent/10" : "bg-muted/50"}`}
                      >
                        {isIncluded ? <Check className="h-3 w-3 text-accent" /> : <Minus className="h-3 w-3 text-muted-foreground/40" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${!isIncluded && "line-through decoration-muted-foreground/20"}`}>
                          {feature.name}
                        </span>
                        {isIncluded && feature.description && (
                          <span className="text-xs text-muted-foreground mt-0.5">{feature.description}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-auto"
                onClick={() => {
                  if (authUser) {
                    navigate("/pro/create-restaurant");
                  } else {
                    navigate("/register?redirect=/pro/create-restaurant");
                  }
                }}
              >
                {"Choisir cette formule"}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span className="font-medium">{"Sans engagement"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span className="font-medium">{"Annulation à tout moment"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span className="font-medium">{"Paiement sécurisé"}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
