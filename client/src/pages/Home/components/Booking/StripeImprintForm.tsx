import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StripeImprintFormProps {
  amount: number;
  onSuccess: (setupIntentId: string) => void;
  onCancel: () => void;
}

export const StripeImprintForm = ({ amount, onSuccess, onCancel }: StripeImprintFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        // Redirects are only triggered if the card requires authentication (3D Secure).
        // If it doesn't, it will just return the setupIntent immediately.
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Erreur lors de la vérification de la carte.");
      setLoading(false);
    } else if (setupIntent && setupIntent.id) {
      onSuccess(setupIntent.id);
    } else {
      toast.error("Erreur inconnue lors de l'enregistrement de la carte.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex flex-col items-center justify-center text-center space-y-2">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h4 className="font-semibold text-primary">Empreinte Bancaire Requise</h4>
        <p className="text-sm text-muted-foreground">
          Afin de valider votre réservation, une empreinte bancaire de <strong>{amount}€</strong> est nécessaire. Aucun montant ne sera
          prélevé immédiatement. Cette somme sert de caution en cas de non-présentation (No-Show).
        </p>
      </div>

      <div className="p-3 border border-border rounded-xl bg-background/50">
        <PaymentElement />
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="button" variant="outline" className="w-full h-12 rounded-xl" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" className="w-full h-12 rounded-xl shadow-lg shadow-primary/20" disabled={!stripe || loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Valider ma méthode de paiement
        </Button>
      </div>
    </form>
  );
};
