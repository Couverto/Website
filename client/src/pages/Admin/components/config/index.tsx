import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const Config = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de l'application</CardTitle>
          <CardDescription>Gérez la configuration globale de l'application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Configuration Statique</AlertTitle>
            <AlertDescription>
              La configuration de l'image de marque (Nom de l'application, Couleurs) est désormais gérée de manière statique par le code
              système (Couverto). Les modifications dynamiques ont été désactivées pour assurer la cohérence de la marque.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
