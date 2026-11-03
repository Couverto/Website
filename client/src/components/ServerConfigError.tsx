import { useEffect, useState } from "react";
import { ServerCrash } from "lucide-react";
import { SERVER_MISCONFIGURED_EVENT } from "@/config/axiosConfig";

/**
 * Full-screen message shown when the API answers that its configuration is invalid
 * (missing or unsafe environment variables). The API lists the problems by variable name only.
 */
export const ServerConfigError = () => {
  const [problems, setProblems] = useState<string[] | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      setProblems((event as CustomEvent<{ problems?: string[] }>).detail?.problems ?? []);
    };
    window.addEventListener(SERVER_MISCONFIGURED_EVENT, handler);
    return () => window.removeEventListener(SERVER_MISCONFIGURED_EVENT, handler);
  }, []);

  if (!problems) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-xl p-6 border rounded-xl shadow-lg bg-card border-destructive/40">
        <div className="flex items-center gap-3 mb-4">
          <ServerCrash className="w-8 h-8 shrink-0 text-destructive" />
          <h1 className="text-xl font-bold">Le serveur n'est pas configuré correctement</h1>
        </div>
        <p className="mb-4 text-muted-foreground">
          L'API refuse de démarrer tant que ces variables d'environnement ne sont pas corrigées :
        </p>
        <ul className="p-4 mb-4 space-y-1 font-mono text-sm rounded-lg bg-muted">
          {problems.map((problem) => (
            <li key={problem}>• {problem}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Ajoutez-les dans l'environnement du serveur (modèle : <code>server/.env.example</code>), puis redémarrez-le. Pour un
          secret, générez une valeur avec <code>openssl rand -hex 32</code>.
        </p>
      </div>
    </div>
  );
};
