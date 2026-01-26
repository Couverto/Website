import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-black/5 animate-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500/10 mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-4">{"Paiement annulé"}</h2>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          {"Le processus de paiement a été interrompu. Aucuns frais n'ont été prélevés sur votre compte."}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/account/restaurants")}
            className="w-full h-12 text-base font-semibold gap-2 shadow-lg shadow-primary/20"
          >
            <RefreshCw className="h-4 w-4" />
            {"Réessayer"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/account/restaurants")}
            className="w-full h-12 text-base font-medium text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {"Retour à mon compte"}
          </Button>
        </div>
      </div>
    </div>
  );
};
