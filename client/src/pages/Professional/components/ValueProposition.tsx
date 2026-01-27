import { Calendar, ClipboardList, Users, Zap } from "lucide-react";

export const ValueProposition = () => {
  const benefits = [
    {
      icon: Calendar,
      title: "Gestion des réservations en temps réel",
      description: "Recevez et gérez vos réservations instantanément, depuis n'importe quel appareil.",
    },
    {
      icon: Users,
      title: "Collaboration efficace",
      description: "Une gestion d'équipe fluide avec des rôles adaptés à chacun (service, cuisine, direction).",
    },
    {
      icon: ClipboardList,
      title: "Données clients centralisées",
      description: "Retrouvez l'historique et les préférences de vos clients en quelques clics.",
    },
    {
      icon: Zap,
      title: "Prise en main immédiate",
      description: "Aucune formation nécessaire. Interface intuitive pensée pour le terrain.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {"Tout ce dont vous avez besoin, rien de superflu"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Des fonctionnalités essentielles pensées pour le quotidien des restaurateurs indépendants."}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <benefit.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
