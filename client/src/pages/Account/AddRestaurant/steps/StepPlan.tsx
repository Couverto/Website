import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

interface StepPlanProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0€",
    description: "For small restaurants getting started",
    features: ["50 Reservations / month", "Basic Dashboard", "Email Support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29€",
    description: "For growing restaurants",
    features: ["Unlimited Reservations", "Advanced Analytics", "Priority Support", "Table Management"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "99€",
    description: "For restaurant chains",
    features: ["Custom Integration", "Dedicated Account Manager", "Multi-location Management", "API Access"],
  },
];

export const StepPlan = ({ data, updateData, onNext, onBack }: StepPlanProps) => {
  const [selectedPlan, setSelectedPlan] = useState(data.plan || "free");

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleNext = () => {
    updateData({ plan: selectedPlan });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelect(plan.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {plan.name}
                {selectedPlan === plan.id && <Check className="w-5 h-5 text-primary" />}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">{plan.price}</div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
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
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};
