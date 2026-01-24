import { Github, Globe, Linkedin, Mail, Heart, Zap, Award, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfigContext } from "@/contexts/configContext";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];
  const navigate = useNavigate();

  const stats = [
    { label: "Restaurants Partenaires", value: "500+" },
    { label: "Utilisateurs Actifs", value: "50k+" },
    { label: "Réservations / mois", value: "120k" },
    { label: "Villes", value: "15" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Nous sommes animés par l'amour de la gastronomie et le désir de soutenir les restaurateurs.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Nous repoussons les limites de la technologie pour simplifier chaque étape de l'expérience culinaire.",
    },
    {
      icon: Award,
      title: "Qualité",
      description: "Nous nous engageons à offrir un service d'excellence, fiable et transparent pour tous.",
    },
  ];

  const team = [
    {
      name: "Axel Elias",
      role: "CEO & Co-Founder",
      image: "/images/about/axel.jpeg",
      bio: "Étudiant à l’IMT Nord Europe en alternance au département du Nord en qualité de Data Engineer. Axel apporte sa vision technique et stratégique au projet.",
      links: {
        linkedin: "https://www.linkedin.com/in/axel-elias/",
        website: "#",
        github: "https://github.com/axel-lexa",
      },
    },
    {
      name: "Téo Villet",
      role: "CTO & Co-Founder",
      image: "/images/about/teo.png",
      bio: "Développeur fullstack freelance basé à Grenoble, Téo apporte son expertise technique pour bâtir une plateforme performante et intuitive.",
      links: {
        linkedin: "https://www.linkedin.com/in/teo-villet",
        website: "https://teovillet.fr",
        github: "https://github.com/teovlt",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Story Section */}
      <section className="py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-primary font-bold tracking-wide uppercase text-sm">
                <TrendingUp className="h-4 w-4" /> {"Notre Histoire"}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl leading-tight">{"D'une frustration à une Révolution"}</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  {
                    "Tout a commencé par un constat simple : pourquoi réserver une table est-il encore si compliqué, alors que tout le reste est devenu instantané ?"
                  }
                </p>
                <p>{`En unissant nos forces, Axel (Vision & Business) et Téo (Tech & Product) ont créé ${appName} avec une obsession : simplifier la vie.`}</p>
                <p>
                  {
                    "Aujourd'hui, nous sommes fiers d'aider des centaines de restaurateurs à se concentrer sur ce qu'ils font de mieux : cuisiner."
                  }
                </p>
              </div>
            </div>

            {/* Right Column: Stats Card */}
            <div className="bg-card border shadow-xl rounded-3xl p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <TrendingUp className="h-48 w-48" />
              </div>

              <div className="text-center mb-8 space-y-4 relative z-10">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full">
                  {"Notre Impact"}
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight">{"Des chiffres qui donnent faim"}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors duration-300"
                  >
                    <div className="text-3xl font-black text-primary mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{"Nos Valeurs"}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{"Ce qui nous guide au quotidien."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <Card key={i} className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary rotate-3 transition-transform group-hover:rotate-6">
                    <val.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">{val.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{val.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-primary font-bold tracking-wide uppercase text-sm">
                <Users className="h-4 w-4" /> {"L'Équipe"}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{"Les fondateurs"}</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-md text-right md:text-left">
              {"Deux profils complémentaires unis par la même ambition."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <div
                key={i}
                className="group relative bg-background rounded-[2rem] overflow-hidden shadow-lg border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 object-top"
                  />
                  <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
                    <h3 className="text-3xl font-bold mb-1">{member.name}</h3>
                    <div className="text-white/80 font-medium text-lg">{member.role}</div>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <p className="text-muted-foreground text-lg leading-relaxed flex-1">{member.bio}</p>

                  <div className="flex gap-4 pt-2 border-t mt-6 justify-center">
                    {member.links.linkedin && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 border-2 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all duration-300"
                        asChild
                      >
                        <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {member.links.website && member.links.website !== "#" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                        asChild
                      >
                        <a href={member.links.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {member.links.github && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 border-2 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300"
                        asChild
                      >
                        <a href={member.links.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">{"Prêt à nous rejoindre ?"}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {"Nous cherchons toujours des talents passionnés pour agrandir l'équipe."}
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 h-12 text-lg font-bold shadow-lg hover:shadow-primary/25"
            onClick={() => navigate("/contact", { state: { reason: "recruitment" } })}
          >
            {"Nous contacter"}
          </Button>
        </div>
      </section>
    </div>
  );
};
