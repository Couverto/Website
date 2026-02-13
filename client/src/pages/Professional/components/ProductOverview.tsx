import { Calendar, Users, TrendingUp, Globe, ShieldCheck, LayoutGrid } from "lucide-react";
import { FakeTablePlan } from "@/components/customs/FakeTablePlan";

export const ProductOverview = () => {
  const features = [
    {
      icon: Calendar,
      title: "Réservations",
      description:
        "Gérez toutes vos réservations depuis une interface unique. Confirmations automatiques, rappels clients, et vue calendrier pour anticiper vos services.",
      image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000&auto=format&fit=crop",
    },
    {
      icon: ShieldCheck,
      title: "Gestion d'équipe",
      description:
        "Invitez vos collaborateurs et définissez leurs permissions. Assignez des rôles précis (Manager, Serveur) pour sécuriser l'accès à vos données sensibles.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    },
    {
      icon: TrendingUp,
      title: "Statistiques détaillées",
      description:
        "Analysez vos performances en temps réel. Nombre de couverts, taux de remplissage, pics d'affluence : pilotez votre activité avec des données claires.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
    {
      icon: LayoutGrid,
      title: "Plan de salle",
      description:
        "Modélisez votre restaurant pour une gestion visuelle. Assignez des tables, suivez l'état du service et optimisez votre taux d'occupation en un coup d'œil.",
      image: "custom_table_plan", // Marker for custom render
    },
    {
      icon: Globe,
      title: "Visibilité en ligne",
      description:
        "Une page restaurant moderne et référencée sur les moteurs de recherche. Mettez en avant votre menu, vos photos et vos horaires pour attirer de nouveaux clients.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  const FakeTablePlan = () => (
    <div className="w-full h-full bg-muted/30 p-4 relative overflow-hidden flex items-center justify-center">
      {/* Floor Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative w-full max-w-[300px] h-[180px] border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-wrap gap-4 items-center justify-center content-center">
        {/* Round Table 1 */}
        <div className="relative w-16 h-16 rounded-full border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Rect Table 2 */}
        <div className="relative w-20 h-14 rounded-md border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="w-12 h-8 rounded-sm bg-green-500/10 border border-green-500/20" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-muted-foreground/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Round Table 3 (Occupied) */}
        <div className="relative w-14 h-14 rounded-full border-2 border-orange-500/30 bg-orange-50/50 shadow-sm flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-600 flex items-center justify-center">
            2
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-orange-500/20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-orange-500/20" />
        </div>

        {/* Square Table 4 */}
        <div className="relative w-14 h-14 rounded-md border-2 border-primary/30 bg-background shadow-sm flex items-center justify-center">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      {/* Floating Controls Mockup */}
      <div className="absolute bottom-4 right-4 flex gap-1">
        <div className="w-6 h-6 rounded bg-primary/20" />
        <div className="w-6 h-6 rounded bg-primary/20" />
      </div>
    </div>
  );

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
                  {feature.image === "custom_table_plan" ? (
                    <FakeTablePlan />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </>
                  )}

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
