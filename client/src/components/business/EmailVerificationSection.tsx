import { useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EmailVerificationSectionProps {
  email: string;
  onSuccess: () => void;
  context?: "restaurant" | "account";
}

export const EmailVerificationSection = ({ email, onSuccess, context = "restaurant" }: EmailVerificationSectionProps) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await axiosConfig.post("/restaurants/send-verification-code", { email, context });
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
          type="button" // Important to prevent form submission
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
          type="button"
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
        <Button onClick={handleVerify} disabled={verifying || code.length < 6} size="sm" type="button">
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Code envoyé à <span className="font-medium text-foreground">{email}</span>
      </p>
    </div>
  );
};
