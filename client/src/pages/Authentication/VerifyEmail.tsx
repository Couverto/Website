import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/authContext";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { setAuthUser } = useAuthContext();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Jeton de vérification manquant.");
      return;
    }

    const verify = async () => {
      try {
        const response = await axiosConfig.get(`/auth/verify-email/${token}`);

        // Auto-login on success if token is provided
        if (response.data.accessToken && response.data.user) {
          setAuthUser(response.data.user);
          localStorage.setItem("accessToken", response.data.accessToken);
        }

        setStatus("success");
        setMessage("Votre email a été vérifié avec succès !");

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.error || "Le lien de vérification est invalide ou a expiré.");
      }
    };

    verify();
  }, [token, navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full bg-background rounded-xl shadow-lg border p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500
          ${status === "loading" ? "bg-primary/10" : status === "success" ? "bg-green-100" : "bg-red-100"}`}
        >
          {status === "loading" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-8 h-8 text-green-600" />}
          {status === "error" && <XCircle className="w-8 h-8 text-red-600" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {status === "loading" ? "Vérification..." : status === "success" ? "Compte vérifié" : "Erreur"}
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        {status === "success" && <p className="text-sm text-muted-foreground animate-pulse">Redirection automatique...</p>}

        {status === "error" && (
          <div className="pt-4 border-t">
            <Button onClick={() => navigate("/login")}>Retour à la connexion</Button>
          </div>
        )}
      </div>
    </div>
  );
};
