import { Calendar, LayoutGrid, Users } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Réservations",
    description:
      "Gérez toutes vos réservations depuis une interface unique. Confirmations automatiques, rappels clients, et vue calendrier pour anticiper vos services.",
    mockContent: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Aujourd'hui</span>
          <span className="text-accent font-medium">24 réservations</span>
        </div>
        <div className="space-y-2">
          {["19:00 - Dupont (4p)", "19:30 - Martin (2p)", "20:00 - Bernard (6p)"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: LayoutGrid,
    title: "Plan de salle",
    description:
      "Visualisez l'occupation de vos tables en temps réel. Glissez-déposez pour réorganiser, voyez d'un coup d'œil les tables disponibles.",
    mockContent: (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
              [0, 2, 5, 6, 8, 10].includes(i) ? "bg-primary/20 text-primary border-2 border-primary/30" : "bg-muted text-muted-foreground"
            }`}
          >
            T{i + 1}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    title: "Fichier clients",
    description:
      "Centralisez les informations de vos clients réguliers. Notes, préférences, allergies - tout est accessible en un clic lors de la prise de réservation.",
    mockContent: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">MD</div>
          <div>
            <div className="font-medium text-sm">Marie Dupont</div>
            <div className="text-xs text-muted-foreground">Cliente régulière • 12 visites</div>
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Préférence:</span> Table près de la fenêtre
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Note:</span> Allergie aux noix
          </div>
        </div>
      </div>
    ),
  },
];

export const ProductOverview = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">Un outil pensé pour le service</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des écrans clairs et des actions rapides pour gérer votre restaurant efficacement.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div key={index} className={`grid gap-8 lg:gap-16 lg:grid-cols-2 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
              {/* Text Content */}
              <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Mock Screen */}
              <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                <div className="rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  <div className="rounded-lg bg-background p-6">
                    {/* Mini Header */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{feature.title}</span>
                    </div>
                    {/* Mock Content */}
                    {feature.mockContent}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
