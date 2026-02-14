import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { AlertTriangle, CreditCard, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ConfigurationAlertProps {
  restaurant: RestaurantInterface;
}

export const ConfigurationAlert = ({ restaurant }: ConfigurationAlertProps) => {
  const missingFields = [];

  if (!restaurant.name) missingFields.push("Nom du restaurant");
  if (!restaurant.adress) missingFields.push("Adresse");
  if (!restaurant.phone) missingFields.push("Téléphone");
  if (!restaurant.email) missingFields.push("Email");

  const isSubscriptionActive = restaurant.subscriptionStatus === "active";
  const isConfigured = missingFields.length === 0;

  if (isSubscriptionActive && isConfigured) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {!isSubscriptionActive && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
          <CreditCard className="h-4 w-4" />
          <AlertTitle>Abonnement requis</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Votre restaurant n'est pas encore visible par les clients. Veuillez souscrire à un abonnement pour activer votre compte.
            </span>
            <Button variant="outline" size="sm" className="bg-white border-red-200 hover:bg-red-100 text-red-900" asChild>
              <Link to={`/restaurant/${restaurant._id}/billing`}>S'abonner</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isConfigured && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Configuration incomplète</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Certaines informations essentielles sont manquantes : <strong>{missingFields.join(", ")}</strong>.
            </span>
            <Button variant="outline" size="sm" className="bg-white border-yellow-200 hover:bg-yellow-100 text-yellow-900" asChild>
              <Link to={`/restaurant/${restaurant._id}/settings`}>
                <Settings className="h-3 w-3 mr-2" />
                Configurer
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
