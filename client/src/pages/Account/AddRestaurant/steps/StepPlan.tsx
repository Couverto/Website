import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>(data.plan || "");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosConfig.get("/plans/public");
        setPlans(response.data.plans);
        // Default to the first plan if no plan selected and plans exist
        if (!data.plan && response.data.plans.length > 0) {
          setSelectedPlan(response.data.plans[0]._id);
        }
      } catch (error) {
        console.error("Error fetching plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
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
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === plan._id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelect(plan._id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {plan.name}
                {selectedPlan === plan._id && <Check className="w-5 h-5 text-primary" />}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">{plan.price}€</div>
              <ul className="space-y-2 text-sm">
                {plan.features?.map((feature: any, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature.name}
                  </li>
                ))}
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
