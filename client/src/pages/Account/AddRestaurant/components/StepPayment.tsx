import { StepProps } from "@/interfaces/Components";
import { CreditCard, ShieldCheck, Zap, Gift } from "lucide-react";

export const StepPayment = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto">
        {data.referralType === "sponsor" && data.referralDiscount === 100 ? (
          <div className="text-center space-y-6 mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 mb-2 animate-bounce">
              <Gift className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-purple-900">Offre Sponsor Activée !</h3>
            <p className="text-muted-foreground text-xl max-w-lg mx-auto">
              Grâce à votre code sponsor, vous bénéficiez de l'offre complète gratuitement à vie.
            </p>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-8 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-sm uppercase tracking-widest font-bold text-purple-400 mb-2">Total à payer</span>
                <span className="text-6xl font-black text-purple-600 mb-2">0€</span>
                <span className="text-sm text-purple-400 font-medium">/ mois à vie</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Aucune carte bancaire n'est requise. Votre restaurant sera activé immédiatement.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-4 mb-10">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                <CreditCard className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{"Paiement sécurisé via Stripe"}</h3>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                {"Vous allez être redirigé vers la plateforme sécurisée de Stripe pour finaliser votre abonnement."}
              </p>

              {/* Show partial discount badge if applicable */}
              {data.referralType === "sponsor" && data.referralDiscount && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-sm animate-in fade-in zoom-in">
                  <Gift className="h-4 w-4" />
                  Offre Sponsor : -{data.referralDiscount}% appliqués au paiement
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="flex gap-4 p-6 rounded-2xl border bg-card/50">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{"Sécurisé"}</h4>
                  <p className="text-sm text-muted-foreground">{"Vos données bancaires ne transitent jamais par nos serveurs."}</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl border bg-card/50">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{"Instantané"}</h4>
                  <p className="text-sm text-muted-foreground">{"Votre restaurant sera activé dès la confirmation du paiement."}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8" />
              <div className="h-6 w-px bg-border" />
              <div className="flex gap-2">
                <div className="h-6 w-10 bg-white border rounded shadow-sm flex items-center justify-center font-bold text-[8px]">VISA</div>
                <div className="h-6 w-10 bg-white border rounded shadow-sm flex items-center justify-center font-bold text-[8px]">MC</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
