import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Instagram, Twitter, Users, Wallet, Share2 } from "lucide-react";

interface StepProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  errors?: Record<string, string>;
}

const FEATURES_LIST = [
  { id: "terrace", value: "terrace" },
  { id: "wifi", value: "wifi" },
  { id: "accessible", value: "accessible" },
  { id: "bar", value: "bar" },
  { id: "air_conditioning", value: "air_conditioning" },
  { id: "parking", value: "parking" },
  { id: "pets_allowed", value: "pets_allowed" },
];

const PAYMENT_METHODS = [
  { id: "card", value: "card" },
  { id: "cash", value: "cash" },
  { id: "apple_pay", value: "apple_pay" },
  { id: "google_pay", value: "google_pay" },
  { id: "tickets_restaurant", value: "tickets_restaurant" },
  { id: "cheque", value: "cheque" },
];

export const StepDetails = ({ data, updateData, errors }: StepProps) => {
  const { t } = useTranslation();

  const handleFeatureToggle = (featureValue: string) => {
    const current = (data.features as string[]) || [];
    const updated = current.includes(featureValue) ? current.filter((f: string) => f !== featureValue) : [...current, featureValue];
    updateData({ features: updated });
  };

  const handlePaymentToggle = (methodValue: string) => {
    const current = (data.paymentMethods as string[]) || [];
    const updated = current.includes(methodValue) ? current.filter((m: string) => m !== methodValue) : [...current, methodValue];
    updateData({ paymentMethods: updated });
  };

  const updateSocial = (key: keyof NonNullable<WizardData["socials"]>, value: string) => {
    updateData({
      socials: {
        ...(data.socials || { facebook: "", instagram: "", tiktok: "" }),
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("create.steps.details.features")}
            </Label>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {FEATURES_LIST.map((feature) => (
              <div
                key={feature.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-primary/[0.04] hover:border-primary/20 ${data.features?.includes(feature.value) ? "border-primary/30 bg-primary/[0.02]" : "border-transparent"}`}
                onClick={() => handleFeatureToggle(feature.value)}
              >
                <Checkbox
                  id={`feat-${feature.id}`}
                  checked={data.features?.includes(feature.value)}
                  className="rounded-md h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                />
                <label htmlFor={`feat-${feature.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                  {t(`create.steps.details.options.${feature.id}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <Label
              className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.paymentMethods ? "text-red-500" : ""}`}
            >
              {t("create.steps.details.payment_methods")}
            </Label>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-primary/[0.04] hover:border-primary/20 ${data.paymentMethods?.includes(method.value) ? "border-primary/30 bg-primary/[0.02]" : "border-transparent"}`}
                onClick={() => handlePaymentToggle(method.value)}
              >
                <Checkbox
                  id={`pay-${method.id}`}
                  checked={data.paymentMethods?.includes(method.value)}
                  className={`rounded-md h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none ${errors?.paymentMethods ? "border-red-400" : ""}`}
                />
                <label htmlFor={`pay-${method.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                  {t(`create.steps.details.payment_options.${method.id}`)}
                </label>
              </div>
            ))}
          </div>
          {errors?.paymentMethods && <p className="text-xs font-medium text-red-500 px-1">{errors.paymentMethods}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
        <div className="space-y-3">
          <Label
            htmlFor="capacity"
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.capacity ? "text-red-500" : ""}`}
          >
            {t("create.steps.details.capacity")}
          </Label>
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="capacity"
              type="number"
              value={data.capacity || ""}
              onChange={(e) => updateData({ capacity: parseInt(e.target.value) || 0 })}
              placeholder="50"
              className={`pl-10 h-12 text-base transition-all ${errors?.capacity ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
            />
          </div>
          {errors?.capacity && <p className="text-xs font-medium text-red-500 px-1">{errors.capacity}</p>}
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t">
        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("create.steps.details.social_networks")}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 group">
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-11 border-muted-foreground/10 focus:border-primary transition-all shadow-sm"
                placeholder="Facebook URL"
                value={data.socials?.facebook || ""}
                onChange={(e) => updateSocial("facebook", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 group">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-11 border-muted-foreground/10 focus:border-primary transition-all shadow-sm"
                placeholder="Instagram URL"
                value={data.socials?.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 group">
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-11 border-muted-foreground/10 focus:border-primary transition-all shadow-sm"
                placeholder="TikTok URL"
                value={data.socials?.tiktok || ""}
                onChange={(e) => updateSocial("tiktok", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
