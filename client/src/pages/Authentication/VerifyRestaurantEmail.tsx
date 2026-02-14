import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Store } from "lucide-react";

export const VerifyRestaurantEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Jeton de vérification manquant.");
        return;
      }

      try {
        await axiosConfig.get(`/restaurants/verify-email/${token}`);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.error || "La vérification a échoué. Le lien est peut-être expiré.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {status === "loading" && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
            {status === "success" && <Store className="h-8 w-8 text-primary" />}
            {status === "error" && <XCircle className="h-8 w-8 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">Vérification Restaurant</CardTitle>
          <CardDescription>
            {status === "loading" && "Vérification en cours..."}
            {status === "success" && "L'email de votre restaurant a été vérifié !"}
            {status === "error" && "Échec de la vérification"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-4">
          {status === "success" && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 border border-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Vérification réussie</span>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              <p>{message}</p>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={() => navigate("/account/restaurants")}
              className="w-full h-11 text-base"
              variant={status === "error" ? "outline" : "default"}
            >
              Retour à mes restaurants
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
