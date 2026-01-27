import { useState, useEffect } from "react";
import { StepEssentials } from "./components/StepEssentials";
import { StepIdentity } from "./components/StepIdentity";
import { StepDetails } from "./components/StepDetails";
import { StepPlan } from "./components/StepPlan";
import { StepPayment } from "./components/StepPayment";
import { WizardPreview } from "./components/WizardPreview";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardData } from "./types";
import {
  getEssentialsSchema,
  getIdentitySchema,
  getDetailsSchema,
  getMenuSchema,
  getMediaSchema,
  getPlanSchema,
  getPaymentSchema,
} from "./schemas";

const INITIAL_DATA: WizardData = {
  name: "",
  adress: "",
  city: "",
  addressVerified: false,
  cityVerified: false,
  phone: "",
  email: "",
  cuisineType: [],
  priceRange: "$" as const,
  description: "",
  shortDescription: "",
  features: [],
  paymentMethods: [],
  capacity: 0,
  images: [],
  coverImage: "",
  menu: [],
  socials: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
  planId: "",
  openingHours: {
    monday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    tuesday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    wednesday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    thursday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    friday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    saturday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
    sunday: {
      isClosed: false,
      periods: [
        { open: "12:00", close: "14:00" },
        { open: "19:00", close: "22:00" },
      ],
    },
  },
};

export const AddRestaurantWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WizardData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (data: Partial<WizardData>) => {
    setFormData((prev: WizardData) => ({ ...prev, ...data }));
    // Clear errors for fields being updated
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validateStep = (currentStep: number) => {
    let schema;
    switch (currentStep) {
      case 1:
        schema = getEssentialsSchema();
        break;
      case 2:
        schema = getIdentitySchema();
        break;
      case 3:
        schema = getDetailsSchema();
        break;
      case 4:
        schema = getPlanSchema();
        break;
      case 5:
        schema = getPaymentSchema();
        break;
      default:
        return true;
    }

    const result = schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev: number) => Math.min(prev + 1, 5));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((prev: number) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
      };

      const response = await axiosConfig.post("/restaurants", payload);

      if (response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
        return;
      }

      toast.success("Restaurant créé avec succès !");
      navigate("/account/restaurants");
    } catch (error: any) {
      console.error("Failed to create restaurant", error);
      toast.error(error.response?.data?.error || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, key: "essentials", label: "L'essentiel" },
    { id: 2, key: "identity", label: "Identité" },
    { id: 3, key: "details", label: "Détails" },
    { id: 4, key: "plan", label: "Abonnement" },
    { id: 5, key: "payment", label: "Paiement" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Immersive Header */}
      <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/account/restaurants")}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">{"Créer votre restaurant"}</h1>
          </div>

          <div className="flex-1 max-w-xl px-4 md:px-12">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>{steps[step - 1].label}</span>
                <span>
                  {step} / {steps.length}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700 ease-in-out"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/account/restaurants")}
              className="text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
            >
              {"Annuler"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Form Section */}
        <div className="flex-1 overflow-y-auto bg-muted/20 pb-20 pt-8 px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{steps[step - 1].label}</h2>
              <p className="text-muted-foreground text-lg">
                {step === 1
                  ? "Commençons par les informations de base de votre établissement."
                  : step === 2
                    ? "Définissez le style et l'ambiance de votre cuisine."
                    : step === 3
                      ? "Précisez vos services, équipements et moyens de paiement."
                      : step === 4
                        ? "Configurez votre abonnement."
                        : "Configurez vos informations de facturation."}
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border p-8 md:p-12 min-h-[500px]">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {step === 1 && <StepEssentials data={formData} updateData={updateFormData} errors={errors} />}
                {step === 2 && <StepIdentity data={formData} updateData={updateFormData} errors={errors} />}
                {step === 3 && <StepDetails data={formData} updateData={updateFormData} errors={errors} />}
                {step === 4 && <StepPlan data={formData} updateData={updateFormData} errors={errors} />}
                {step === 5 && <StepPayment data={formData} updateData={updateFormData} errors={errors} />}
              </div>

              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {"Précédent"}
                </Button>

                {step < 5 ? (
                  <Button
                    onClick={nextStep}
                    className="gap-2 px-8 h-11 text-base font-medium shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    {"Suivant"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-11 text-base font-medium shadow-lg transition-all min-w-[160px]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {"Payer et Créer"}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bubbles (Minimal) */}
            <div className="mt-8 flex justify-center gap-3">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${s.id === step ? "w-8 bg-primary" : "w-1.5 bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Deep Preview */}
        <aside className="hidden lg:flex w-[400px] xl:w-[500px] border-l bg-background overflow-y-auto p-12 shrink-0">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{"Aperçu en direct"}</h3>
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                {"Direct"}
              </Badge>
            </div>
            <WizardPreview data={formData} />
          </div>
        </aside>
      </main>
    </div>
  );
};
