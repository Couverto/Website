import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, LayoutGrid, Users, Utensils, Clock, Star, ChefHat } from "lucide-react";
import { useConfigContext } from "@/contexts/configContext";
import { FakeTablePlan } from "@/components/customs/FakeTablePlan";

export const Hero = () => {
  // const { configValues } = useConfigContext();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Enhanced Background */}
      {/* Enhanced Background with Image */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px]" />

        {/* Base gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />

        {/* Decorative shapes - made more subtle */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto max-w-8xl px-3 md:px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {"Pour restaurateurs indépendants"}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {"Gérez votre restaurant et votre équipe"} <span className="text-primary">{"sans complexité."}</span>
            </h1>

            {/* Slogan */}
            <p className="text-lg text-muted-foreground md:text-xl max-w-xl">
              <span className="font-logo font-bold text-primary">Couverto</span> est la solution tout-en-un pour piloter votre activité,
              fidéliser vos clients et gérer vos collaborateurs.
            </p>

            {/* Description */}
            <p className="text-muted-foreground max-w-xl">
              {
                "Un outil puissant et intuitif conçu pour les restaurateurs ambitieux qui veulent développer leur visibilité et optimiser leur gestion."
              }
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#pricing">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto">
                  {"Découvrir nos offres"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {"Voir les fonctionnalités"}
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{"Sans engagement"}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{"Configuration en 5 minutes"}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{"Support inclus"}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl">
              {/* Mock Dashboard */}
              <div className="rounded-lg bg-background overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <img src="/logos/logo.svg" alt="Logo" className="w-6 h-6" />
                      <span className="text-primary font-bold text-sm font-logo">Couverto</span>
                    </div>
                    <div className="w-px h-4 bg-border mx-2"></div>
                    <span className="font-semibold text-foreground text-sm">Tableau de bord</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{"Réservations"}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">12</div>
                      <div className="text-xs text-accent">{"Ce soir"}</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Users className="h-3 w-3" />
                        <span>{"Vues profil"}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">843</div>
                      <div className="text-xs text-accent">{"+12%"}</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Users className="h-3 w-3" />
                        <span>{"Couverts"}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">38</div>
                      <div className="text-xs text-muted-foreground">{"Estimés"}</div>
                    </div>
                  </div>

                  {/* Reservations & Table Plan Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Fake Table Plan (Left) */}
                    <div className="rounded-lg bg-card border border-border overflow-hidden h-full min-h-[160px]">
                      <FakeTablePlan className="w-full h-full p-2 scale-90" />
                    </div>

                    {/* Prochaines réservations (Right) */}
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="text-sm font-medium text-foreground mb-3">{"Prochaines réservations"}</div>
                      <div className="space-y-2">
                        {[
                          { name: "Dupont", time: "19:00", covers: 4, table: "T3" },
                          { name: "Martin", time: "19:30", covers: 2, table: "T7" },
                          { name: "Bernard", time: "20:00", covers: 6, table: "T12" },
                        ].map((reservation, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                {reservation.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{reservation.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {reservation.covers} {"couverts"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">{reservation.time}</div>
                              <div className="text-xs text-muted-foreground">{reservation.table}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
        <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};
