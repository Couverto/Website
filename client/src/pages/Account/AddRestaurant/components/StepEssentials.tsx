import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { MapPin, Store } from "lucide-react";
import { StepProps } from "@/interfaces/Components";
import { AddressAutocomplete } from "@/components/customs/AddressAutocomplete";
import { PhoneInput } from "@/components/customs/phoneInput";
import { EmailVerificationSection } from "@/components/business/EmailVerificationSection";

export const StepEssentials = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.name ? "text-red-500" : ""}`}
          >
            {"Nom du restaurant"}
          </Label>
          <div className="relative group">
            <Store
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.name ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
            />
            <Input
              id="name"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder={"Le Gourmet"}
              className={`pl-10 h-12 text-base transition-all ${errors?.name ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
            />
          </div>
          {errors?.name && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="phone"
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.phone ? "text-red-500" : ""}`}
          >
            {"Téléphone"}
          </Label>
          <PhoneInput
            defaultCountry="FR"
            value={data.phone}
            onChange={(value) => updateData({ phone: value || "" })}
            placeholder="6 12 34 56 78"
          />
          {errors?.phone && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="adress"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.adress || errors?.addressVerified ? "text-red-500" : ""}`}
        >
          {"Adresse"}
        </Label>
        <AddressAutocomplete
          value={data.adress}
          onChange={(val) => updateData({ adress: val })}
          onValidityChange={(isValid) => updateData({ addressVerified: isValid })}
          onSelect={(addr) => {
            updateData({
              adress: addr.address,
              city: addr.city,
              addressVerified: true,
              cityVerified: true,
            });
          }}
          error={!!errors?.adress || !!errors?.addressVerified}
          placeholder="123 Avenue des Champs-Elysées"
        />
        {(errors?.adress || errors?.addressVerified) && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.adress || errors.addressVerified}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="email"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.email ? "text-red-500" : ""}`}
        >
          {"Email de contact"}
        </Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder={"contact@legourmet.fr"}
            className={`h-12 text-base transition-all ${errors?.email ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
          />
        </div>
        {errors?.email && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.email}
          </p>
        )}

        {/* OTP Verification UI */}
        {!data.isEmailVerified && !errors?.email && data.email && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <EmailVerificationSection email={data.email} onSuccess={() => updateData({ isEmailVerified: true })} />
          </div>
        )}
      </div>
    </div>
  );
};
