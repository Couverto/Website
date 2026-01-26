import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let finalizeCalled = false;

    const finalizeAndVerify = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      // First, call finalize-payment to ensure restaurant is created
      if (!finalizeCalled) {
        finalizeCalled = true;
        try {
          const finalizeResponse = await axiosConfig.post("/restaurants/finalize-payment", { sessionId });
          console.log("[PaymentSuccess] Finalize response:", finalizeResponse.data);

          // If already processed or just created, we're done
          if (finalizeResponse.data.restaurant || finalizeResponse.data.alreadyProcessed) {
            setLoading(false);
            return;
          }
        } catch (error: any) {
          console.error("[PaymentSuccess] Finalize error:", error.response?.data || error);
          // Continue to polling in case webhook handled it
        }
      }

      // Then poll to verify restaurant exists
      try {
        const response = await axiosConfig.get("/restaurants/my");
        const myRestaurants = response.data.restaurants || [];
        if (myRestaurants.length > 0) {
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("[PaymentSuccess] Poll error:", error);
      }
    };

    if (sessionId) {
      finalizeAndVerify();
      // Continue polling in case the finalize call had issues
      pollInterval = setInterval(finalizeAndVerify, 5000);
    } else {
      setLoading(false);
    }

    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (pollInterval) clearInterval(pollInterval);
        toast.error("Le traitement prend plus de temps que prévu. Vérifiez vos restaurants dans quelques instants.");
      }
    }, 30000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [sessionId, loading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">{"Confirmation de votre paiement..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-black/5 animate-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-4">{"Paiement réussi !"}</h2>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          {"Votre abonnement a été activé avec succès. Vous pouvez maintenant commencer à configurer votre restaurant."}
        </p>

        <Button
          onClick={() => navigate("/account/restaurants")}
          className="w-full h-12 text-base font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          {"Voir mes restaurants"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
