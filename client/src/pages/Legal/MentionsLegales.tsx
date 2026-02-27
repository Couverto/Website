import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale, Building2, Server, UserCircle } from "lucide-react";

export const MentionsLegales = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <Scale className="w-8 h-8 text-primary -rotate-3" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Mentions Légales</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Informations réglementaires concernant l'édition et l'hébergement du site Couverto.
        </p>
      </div>

      <Card className="border shadow-lg shadow-primary/5 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12 space-y-12">
          {/* Introduction */}
          <section>
            <p className="text-justify leading-loose text-foreground/80 font-medium">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé
              aux utilisateurs du site <span className="text-primary font-semibold">Couverto</span> l'identité des différents intervenants
              dans le cadre de sa réalisation et de son suivi.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Editeur */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Édition du site</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Le présent site, accessible à l’URL{" "}
              <a href={window.location.origin} className="text-primary font-medium hover:underline">
                {window.location.origin}
              </a>{" "}
              (le « Site »), est édité par :
            </p>
            <div className="pl-11 p-6 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-justify leading-relaxed text-foreground/80">
                <strong className="text-foreground">Couverto</strong>, résidant au 13 bd maréchal Joffre GRENOBLE 38000, de nationalité
                Française (France), inscrit au R.C.S. de Grenoble sous le numéro{" "}
                <span className="font-mono bg-background px-2 py-0.5 rounded border">101 012 219</span>.
              </p>
            </div>
          </section>

          <Separator className="bg-primary/10" />

          {/* Hébergement */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Hébergement</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Le Site est hébergé par <strong className="text-foreground">OVHcloud</strong>, situé au
              <br />
              <span className="italic">2 rue Kellermann, 59100 Roubaix, France</span>.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Directeur Publication */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Directeur de publication</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Le Directeur de la publication du Site est <strong className="text-foreground">Téo VILLET</strong>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
