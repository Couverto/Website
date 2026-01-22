import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Instagram,
  Users,
  Wallet,
  Share2,
  Check,
  Wifi,
  Umbrella,
  Accessibility,
  Beer,
  Wind,
  Car,
  Dog,
  CreditCard,
  Banknote,
  Smartphone,
  Ticket,
  StickyNote,
  Clock,
  Music2,
} from "lucide-react";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import { StepProps } from "@/interfaces/Components";

const FEATURES_LIST = [
  { id: "terrace", value: "terrace", icon: Umbrella },
  { id: "wifi", value: "wifi", icon: Wifi },
  { id: "accessible", value: "accessible", icon: Accessibility },
  { id: "bar", value: "bar", icon: Beer },
  { id: "air_conditioning", value: "air_conditioning", icon: Wind },
  { id: "parking", value: "parking", icon: Car },
  { id: "pets_allowed", value: "pets_allowed", icon: Dog },
];

const PAYMENT_METHODS = [
  { id: "card", value: "card", icon: CreditCard },
  { id: "cash", value: "cash", icon: Banknote },
  { id: "apple_pay", value: "apple_pay", icon: Smartphone },
  { id: "google_pay", value: "google_pay", icon: Smartphone },
  { id: "tickets_restaurant", value: "tickets_restaurant", icon: Ticket },
  { id: "cheque", value: "cheque", icon: StickyNote },
  { id: "ancv", value: "ancv", icon: Ticket },
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-5">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("create.steps.details.features")}
              </Label>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
              Multiple possible
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES_LIST.map((feature) => {
              const Icon = feature.icon;
              const isSelected = data.features?.includes(feature.value);
              return (
                <div
                  key={feature.id}
                  onClick={() => handleFeatureToggle(feature.value)}
                  className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                    isSelected
                      ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                      : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm"
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-bold text-center transition-all ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {t(`create.steps.details.options.${feature.id}`)}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <Label
                className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.paymentMethods ? "text-red-500" : ""}`}
              >
                {t("create.steps.details.payment_methods")}
              </Label>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
              Multiple possible
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = data.paymentMethods?.includes(method.value);
              return (
                <div
                  key={method.id}
                  onClick={() => handlePaymentToggle(method.value)}
                  className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                    isSelected
                      ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                      : errors?.paymentMethods
                        ? "border-red-200 bg-red-50/20"
                        : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm"
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-bold text-center transition-all ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {t(`create.steps.details.payment_options.${method.id}`)}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors?.paymentMethods && (
            <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.paymentMethods}</p>
          )}
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
              value={data.capacity}
              onChange={(e) => updateData({ capacity: parseInt(e.target.value) || 0 })}
              placeholder="50"
              className={`pl-10 h-12 text-base transition-all ${errors?.capacity ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
            />
          </div>
          {errors?.capacity && <p className="text-xs font-medium text-red-500 px-1">{errors.capacity}</p>}
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("create.steps.details.opening_hours", "Opening Hours")}
          </Label>
        </div>
        <OpeningHoursEditor value={data.openingHours as any} onChange={(val) => updateData({ openingHours: val as any })} />
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
              <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-11 border-muted-foreground/10 focus:border-primary transition-all shadow-sm"
                placeholder="Tiktok URL"
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
