import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Pricing = () => {
  const features = [
    "Réservations illimitées",
    "Plan de salle interactif",
    "Fichier clients complet",
    "Rappels automatiques par email",
    "Accès multi-appareils",
    "Support par email inclus",
    "Mises à jour gratuites",
    "Données sécurisées (RGPD)",
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Message */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              Tarification simple
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
              Beaucoup plus abordable que les alternatives
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Pas de plans complexes, pas de frais cachés. Un prix unique qui inclut toutes les fonctionnalités dont vous avez besoin.
            </p>
            <p className="text-muted-foreground mb-8">
              Couverto est conçu pour les restaurateurs indépendants, pas pour les grandes chaînes. Notre tarification reflète cette réalité
              : un outil professionnel à un prix accessible.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Annulation à tout moment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Essai gratuit 14 jours</span>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Card */}
          <div className="relative">
            <div className="rounded-2xl border-2 border-primary bg-background p-8 shadow-xl">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                  Formule unique
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-8 pt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">29€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">HT • Facturation mensuelle</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/register" className="block">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Commencer l'essai gratuit
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground mt-4">Aucune carte bancaire requise pour l'essai</p>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 -top-6 -right-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -z-10 -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
