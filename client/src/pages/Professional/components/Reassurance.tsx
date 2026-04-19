import { Shield, Users, Lock, Store } from "lucide-react";

export const Reassurance = () => {
  const reassurances = [
    {
      icon: Users,
      title: "Conçu avec des restaurateurs",
      description: "Développé en collaboration avec des professionnels du terrain pour répondre à leurs vrais besoins.",
    },
    {
      icon: Shield,
      title: "Conforme RGPD",
      description: "Vos données et celles de vos clients sont traitées dans le respect total de la réglementation européenne.",
    },
    {
      icon: Lock,
      title: "Données sécurisées",
      description: "Hébergement en France, sauvegardes quotidiennes, et chiffrement de bout en bout.",
    },
    {
      icon: Store,
      title: "Pour restaurateurs indépendants",
      description: "Un outil adapté à votre réalité, sans fonctionnalités inutiles ni complexité superflue.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-8xl px-6 md:px-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{"Un partenaire de confiance"}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Nous nous engageons à protéger vos données et à vous fournir un outil fiable au quotidien."}
          </p>
        </div>

        {/* Reassurance Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reassurances.map((item, index) => (
            <div key={index} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
