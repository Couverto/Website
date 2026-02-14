import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { MapPin, Store } from "lucide-react";
import { StepProps } from "@/interfaces/Components";
import { AddressAutocomplete } from "@/components/customs/AddressAutocomplete";
import { PhoneInput } from "@/components/customs/phoneInput";

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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const EmailVerificationSection = ({ email, onSuccess }: { email: string; onSuccess: () => void }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await axiosConfig.post("/restaurants/send-verification-code", { email });
      setSent(true);
      toast.success("Code envoyés à " + email);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;
    setVerifying(true);
    try {
      await axiosConfig.post("/restaurants/verify-verification-code", { email, code });
      toast.success("Email vérifié avec succès");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Code invalide");
    } finally {
      setVerifying(false);
    }
  };

  if (!sent) {
    return (
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-dashed border-primary/20">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">Vérification requise</p>
          <p className="text-xs text-muted-foreground">Nous devons vérifier cette adresse email avant de continuer.</p>
        </div>
        <Button
          size="sm"
          onClick={handleSendCode}
          disabled={loading}
          variant="outline"
          className="border-primary/20 text-primary hover:bg-primary/5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le code"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Entrez le code reçu par email</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
          onClick={() => setSent(false)}
        >
          Changer d'email
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="bg-background border-primary/20" />
            <InputOTPSlot index={1} className="bg-background border-primary/20" />
            <InputOTPSlot index={2} className="bg-background border-primary/20" />
            <InputOTPSlot index={3} className="bg-background border-primary/20" />
            <InputOTPSlot index={4} className="bg-background border-primary/20" />
            <InputOTPSlot index={5} className="bg-background border-primary/20" />
          </InputOTPGroup>
        </InputOTP>
        <Button onClick={handleVerify} disabled={verifying || code.length < 6} size="sm">
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Code envoyé à <span className="font-medium text-foreground">{email}</span>
      </p>
    </div>
  );
};
