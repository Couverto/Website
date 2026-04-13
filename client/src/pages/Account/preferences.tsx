import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeChanger } from "@/components/customs/themeChanger";
import { Settings2, Volume2, Play } from "lucide-react";
import { useAuthContext } from "@/contexts/authContext";
import { NOTIFICATION_SOUNDS } from "@/constants/sounds";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const AccountPreferences = () => {
  const { authUser, setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSoundChange = async (value: string) => {
    try {
      setLoading(true);
      const response = await axiosConfig.put(`/users/${authUser?._id}`, {
        notificationSound: value,
      });
      setAuthUser(response.data.user);
      toast.success("Préférence mise à jour");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (soundId: string) => {
    const sound = NOTIFICATION_SOUNDS.find((s) => s.id === soundId);
    if (sound?.url) {
      new Audio(sound.url).play().catch((e) => console.error("Audio preview failed", e));
    }
  };

  const currentSound = typeof authUser?.notificationSound === "boolean" ? (authUser?.notificationSound ? "default" : "none") : authUser?.notificationSound || "default";

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

      <div className="flex flex-col gap-6 max-w-4xl">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{"Apparence"}</CardTitle>
            <CardDescription>{"Choisissez le mode d'affichage de l'application."}</CardDescription>
          </CardHeader>
          <CardContent className="bg-muted/30 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">{"Thème de l'interface"}</p>
                <p className="text-xs text-muted-foreground">{"Basculez entre clair et sombre."}</p>
              </div>
              <ThemeChanger />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{"Notifications"}</CardTitle>
            </div>
            <CardDescription>{"Gérez vos alertes sonores."}</CardDescription>
          </CardHeader>
          <CardContent className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <p className="font-medium">{"Son de notification"}</p>
                <p className="text-xs text-muted-foreground">{"Joué lors d'une nouvelle réservation."}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select value={currentSound} onValueChange={handleSoundChange} disabled={loading}>
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="Choisir un son" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_SOUNDS.map((sound) => (
                        <SelectItem key={sound.id} value={sound.id}>
                          {sound.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={currentSound === "none"}
                  onClick={() => playPreview(currentSound)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
