import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const VerifyEmailPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full bg-background rounded-xl shadow-lg border p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Vérifiez votre email</h1>
          <p className="text-muted-foreground">
            Nous avons envoyé un lien de vérification à votre adresse email. Veuillez cliquer sur ce lien pour activer votre compte.
          </p>
        </div>

        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">Pensez à vérifier vos spams si vous ne trouvez pas l'email.</div>

        <div className="pt-4 border-t">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    </div>
  );
};
