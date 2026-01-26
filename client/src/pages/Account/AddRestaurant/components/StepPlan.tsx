import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { axiosConfig } from "@/config/axiosConfig";
import { Plan } from "@/interfaces/Plan";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StepProps } from "@/interfaces/Components";

export const StepPlan = ({ data, updateData, errors }: StepProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosConfig.get("/plans/public");
        setPlans(response.data.plans);
        // Default to the first plan if no plan selected and plans exist
        if (!data.planId && response.data.plans.length > 0) {
          updateData({ planId: response.data.plans[0]._id });
        }
      } catch (error) {
        console.error("Error fetching plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelect = (planId: string) => {
    updateData({ planId });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {plans.map((plan, index) => {
          const isSelected = data.planId === plan._id;
          const isPopular = index === 1; // Middle plan is "popular"

          return (
            <Card
              key={plan._id}
              className={`relative cursor-pointer transition-all duration-300 border-2 hover:shadow-xl rounded-2xl overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              }`}
              onClick={() => handleSelect(plan._id)}
            >
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center text-xs font-bold py-1.5 uppercase tracking-wider">
                  Le plus populaire
                </div>
              )}
              <CardHeader className={isPopular ? "pt-10" : ""}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}€</span>
                  <span className="text-muted-foreground font-medium">/mois</span>
                </div>
                <ul className="space-y-3">
                  {plan.features?.map((feature: any, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {errors?.planId && <p className="text-center text-sm font-medium text-red-500">{errors.planId}</p>}
    </div>
  );
};
