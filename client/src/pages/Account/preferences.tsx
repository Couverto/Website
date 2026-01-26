import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { Settings2 } from "lucide-react";

export const AccountPreferences = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{"Préférences"}</h2>
          <p className="text-sm text-muted-foreground">{"Gérez les réglages de votre interface."}</p>
        </div>
      </div>

      <Card className="border-none shadow-md p-2">
        <CardHeader>
          <CardTitle>{"Apparence"}</CardTitle>
          <CardDescription>{"Choisissez le mode d'affichage de l'application (clair ou sombre)."}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-6 bg-muted/50 rounded-xl m-4">
          <div className="space-y-1">
            <p className="font-medium">{"Thème de l'interface"}</p>
            <p className="text-xs text-muted-foreground">{"Basculez entre le mode clair et le mode sombre."}</p>
          </div>
          <ThemeChanger />
        </CardContent>
      </Card>
    </div>
  );
};
