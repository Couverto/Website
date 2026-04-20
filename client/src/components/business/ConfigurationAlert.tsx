import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { AlertTriangle, CreditCard, Settings, CalendarOff } from "lucide-react";
import { Link } from "react-router-dom";

interface ConfigurationAlertProps {
  restaurant: RestaurantInterface;
}

export const ConfigurationAlert = ({ restaurant }: ConfigurationAlertProps) => {
  const settingsMissing = [];
  if (!restaurant.name) settingsMissing.push("Nom");
  if (!restaurant.adress) settingsMissing.push("Adresse");
  if (!restaurant.city) settingsMissing.push("Ville");
  if (!restaurant.phone) settingsMissing.push("Téléphone");
  if (!restaurant.email) settingsMissing.push("Email");
  if (!restaurant.shortDescription && !restaurant.description) settingsMissing.push("Description");
  if (!restaurant.cuisineType || restaurant.cuisineType.length === 0) settingsMissing.push("Type de cuisine");

  const hasOpeningHours =
    restaurant.openingHours &&
    Object.values(restaurant.openingHours).some(
      (day: any) => !day.isClosed && day.periods && day.periods.length > 0
    );
  if (!hasOpeningHours) settingsMissing.push("Horaires");

  const isFullyClosed = restaurant.isClosed === true;

  const coverImageMissing = !restaurant.coverImage;
  const imagesMissing = !restaurant.images || restaurant.images.length === 0;
  const menuMissing = !restaurant.menu || restaurant.menu.length === 0;
  const galleryMissing = coverImageMissing || imagesMissing || menuMissing;

  const tablePlanMissing = !restaurant.zones || !restaurant.zones.some((zone: any) => zone.tables && zone.tables.length > 0);

  const isSubscriptionActive = restaurant.subscriptionStatus === "active";
  const isConfigured = settingsMissing.length === 0 && !galleryMissing && !tablePlanMissing;

  if (isSubscriptionActive && isConfigured && !isFullyClosed) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {isFullyClosed && (
        <Alert className="bg-orange-50 border-orange-300 text-orange-900 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300">
          <CalendarOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle>Restaurant fermé</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
            <span>
              Votre restaurant est considéré comme fermé. Les clients ne peuvent pas effectuer de réservations.
            </span>
            <Button variant="outline" size="sm" className="bg-white border-orange-300 hover:bg-orange-100 text-orange-900 shrink-0" asChild>
              <Link to={`/restaurant/${restaurant._id}/settings?tab=advanced`}>Ouvrir le restaurant</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {!isSubscriptionActive && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
          <CreditCard className="h-4 w-4" />
          <AlertTitle>Abonnement requis</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Votre restaurant n'est pas encore visible par les clients. Veuillez souscrire à un abonnement pour activer votre compte.
            </span>
            <Button variant="outline" size="sm" className="bg-white border-red-200 hover:bg-red-100 text-red-900" asChild>
              <Link to={`/restaurant/${restaurant._id}/plan`}>S'abonner</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isConfigured && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Configuration incomplète</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Certaines informations essentielles sont manquantes pour rendre votre restaurant public :</p>
            <div className="flex flex-wrap gap-2">
              {settingsMissing.length > 0 && (
                <Button variant="outline" size="sm" className="bg-white border-yellow-200 hover:bg-yellow-100 text-yellow-900 h-auto py-2 text-left flex flex-col items-start gap-1" asChild>
                  <Link to={`/restaurant/${restaurant._id}/settings`}>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      <span className="font-bold uppercase text-[10px] tracking-wider">Réglages</span>
                    </div>
                    <span className="text-[11px] font-normal opacity-70">Manque : {settingsMissing.join(", ")}</span>
                  </Link>
                </Button>
              )}
              {galleryMissing && (
                <Button variant="outline" size="sm" className="bg-white border-yellow-200 hover:bg-yellow-100 text-yellow-900 h-auto py-2 text-left flex flex-col items-start gap-1" asChild>
                  <Link to={`/restaurant/${restaurant._id}/gallery`}>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      <span className="font-bold uppercase text-[10px] tracking-wider">Galerie & Médias</span>
                    </div>
                    <span className="text-[11px] font-normal opacity-70">
                      {[coverImageMissing && "Couverture", imagesMissing && "Photos", menuMissing && "Menu"].filter(Boolean).join(", ") + " manquant(s)"}
                    </span>
                  </Link>
                </Button>
              )}
              {tablePlanMissing && (
                <Button variant="outline" size="sm" className="bg-white border-yellow-200 hover:bg-yellow-100 text-yellow-900 h-auto py-2 text-left flex flex-col items-start gap-1" asChild>
                  <Link to={`/restaurant/${restaurant._id}/table-plan`}>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      <span className="font-bold uppercase text-[10px] tracking-wider">Plan de salle</span>
                    </div>
                    <span className="text-[11px] font-normal opacity-70">Aucune table configurée</span>
                  </Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
