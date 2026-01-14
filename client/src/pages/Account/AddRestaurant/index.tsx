import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepInfo } from "./steps/StepInfo";
import { StepAddress } from "./steps/StepAddress";
import { StepPlan } from "./steps/StepPlan";
import { StepPayment } from "./steps/StepPayment";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Check, ChevronRight } from "lucide-react";

export const AddRestaurantWizard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    plan: "free",
    payment: {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      cardHolder: "",
    },
  });

  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        // Plan information would normally be handled here
      };

      await axiosConfig.post("/restaurants", payload);
      toast.success(t("Restaurant created successfully"));
      navigate("/account/restaurants");
    } catch (error: any) {
      console.error("Failed to create restaurant", error);
      toast.error(error.response?.data?.error || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors ${
              s <= step ? "border-primary text-primary" : "border-muted text-muted-foreground"
            } ${s < step ? "bg-primary text-primary-foreground" : ""}`}
          >
            {s < step ? <Check className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "General Information"}
            {step === 2 && "Location"}
            {step === 3 && "Choose a Plan"}
            {step === 4 && "Payment Method"}
          </CardTitle>
          <CardDescription>Step {step} of 4</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <StepInfo data={formData} updateData={updateFormData} onNext={nextStep} />}
          {step === 2 && <StepAddress data={formData} updateData={updateFormData} onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <StepPlan data={formData} updateData={updateFormData} onNext={nextStep} onBack={prevStep} />}
          {step === 4 && (
            <StepPayment data={formData} updateData={updateFormData} onSubmit={handleSubmit} onBack={prevStep} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
