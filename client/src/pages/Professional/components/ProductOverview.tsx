import { Calendar, Users, TrendingUp, Globe, ShieldCheck } from "lucide-react";

export const ProductOverview = () => {
  const features = [
    {
      icon: Calendar,
      title: "Réservations",
      description:
        "Gérez toutes vos réservations depuis une interface unique. Confirmations automatiques, rappels clients, et vue calendrier pour anticiper vos services.",
      image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000&auto=format&fit=crop", // Tablet/reservation management
    },
    {
      icon: ShieldCheck,
      title: "Gestion d'équipe",
      description:
        "Invitez vos collaborateurs et définissez leurs permissions. Assignez des rôles précis (Manager, Serveur) pour sécuriser l'accès à vos données sensibles.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Team collaboration
    },
    {
      icon: TrendingUp,
      title: "Statistiques détaillées",
      description:
        "Analysez vos performances en temps réel. Nombre de couverts, taux de remplissage, pics d'affluence : pilotez votre activité avec des données claires.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", // Analytics/Graphs
    },
    {
      icon: Globe,
      title: "Visibilité en ligne",
      description:
        "Une page restaurant moderne et référencée sur les moteurs de recherche. Mettez en avant votre menu, vos photos et vos horaires pour attirer de nouveaux clients.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop", // Restaurant ambiance/online presence
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{"Un outil pensé pour le service"}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Des écrans clairs et des actions rapides pour gérer votre restaurant efficacement."}
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
              <div className={`flex ${index % 2 === 1 ? "lg:col-start-1 lg:justify-end" : "lg:justify-start"}`}>
                <div className="relative w-full max-w-[400px] rounded-xl border border-border bg-card shadow-sm overflow-hidden aspect-video group cursor-pointer hover:shadow-md transition-all duration-500">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating badge */}
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-foreground">{feature.title}</span>
                    </div>
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
