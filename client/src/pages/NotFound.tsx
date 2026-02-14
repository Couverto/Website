import { Button } from "@/components/ui/button";
import { ArrowLeft, UtensilsCrossed, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center bg-background animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative bg-card p-6 rounded-full shadow-2xl border border-border/50 animate-in zoom-in duration-500 slide-in-from-bottom-4">
          <UtensilsCrossed className="w-16 h-16 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">404</h1>

      <h2 className="text-2xl font-bold tracking-tight mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
        {"Page non trouvée"}
      </h2>

      <p className="text-muted-foreground max-w-[500px] mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-300">
        {"La page que vous recherchez n'existe pas."}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-400">
        <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {"Annuler"}
        </Button>
        <Button onClick={() => navigate("/")} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Home className="w-4 h-4" />
          {"Retour à l'accueil"}
        </Button>
      </div>
    </div>
  );
};
