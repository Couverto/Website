import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const CancelBooking = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cancelBooking = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/public/cancel/${token}`, {
          method: "PATCH",
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          toast.success("Votre réservation a été annulée avec succès.");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Une erreur est survenue lors de l'annulation.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      cancelBooking();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Annulation en cours...</h1>
              <p className="text-slate-600">Veuillez patienter pendant que nous traitons votre demande.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Réservation annulée</h1>
              <p className="text-slate-600 mb-8">
                Votre réservation a bien été annulée. Un email de confirmation vous a été envoyé.
              </p>
              <Button onClick={() => navigate("/")} className="w-full py-6 text-lg">
                Retour à l'accueil
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-12 w-12 text-rose-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Oups !</h1>
              <p className="text-slate-600 mb-8">
                {errorMessage}
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full py-6 text-lg">
                Retour à l'accueil
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
