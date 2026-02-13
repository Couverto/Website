import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Plan } from "@/interfaces/Plan";
import { Skeleton } from "@/components/ui/skeleton";

interface StepPlanProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepPlan = ({ data, updateData, onNext, onBack }: StepPlanProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [allFeatures, setAllFeatures] = useState<any[]>([]); // Using any[] for now or Feature[] if imported
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>(data.plan || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([axiosConfig.get("/plans/public"), axiosConfig.get("/features/public")]);
        setPlans(plansRes.data.plans);
        setAllFeatures(featuresRes.data.features || []);

        // Default to the popular plan if no plan selected and plans exist
        if (!data.plan && plansRes.data.plans.length > 0) {
          const popularPlan = plansRes.data.plans.find((p: Plan) => p.isPopular);
          if (popularPlan) {
            setSelectedPlan(popularPlan._id);
          } else {
            setSelectedPlan(plansRes.data.plans[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [data.plan]);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleNext = () => {
    updateData({ plan: selectedPlan });
    onNext();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" disabled>
            Back
          </Button>
          <Button disabled>Next</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className={`cursor-pointer transition-all border-2 relative flex flex-col ${
              selectedPlan === plan._id
                ? "border-primary bg-primary/5 shadow-md"
                : plan.isPopular
                  ? "border-primary/60 shadow-md scale-[1.02]"
                  : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelect(plan._id)}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium z-10">
                Populaire
              </div>
            )}
            <CardHeader className="text-center pb-4 border-b border-border/50">
              <CardTitle className="flex justify-center items-center mb-2">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              <div className="flex items-baseline justify-center gap-1 mt-4">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground font-medium">€ / mois</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <ul className="space-y-3 text-sm">
                {allFeatures?.map((feature: any) => {
                  const isIncluded = plan.features?.some((f: any) => (typeof f === "string" ? f === feature._id : f._id === feature._id));
                  // Note: Depending on populate, plan.features might be strings or objects. Public Plans usually populate features?
                  // Let's check IPlan.ts or just handle both. The Pricing component uses `f._id === feature._id`.
                  // If it doesn't work we might need to adjust.

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
                      <div className="flex flex-col text-left">
                        <span className={`font-medium ${!isIncluded && "line-through decoration-muted-foreground/20"}`}>
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
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!selectedPlan}>
          Next
        </Button>
      </div>
    </div>
  );
};
