import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Target, Globe, Copyright, AlertTriangle, RefreshCcw } from "lucide-react";

export const Terms = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <FileText className="w-8 h-8 text-primary -rotate-3" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Conditions Générales d'Utilisation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Règles d'utilisation et responsabilités relatives aux services Couverto.
        </p>
      </div>

      <Card className="border shadow-lg shadow-primary/5 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12 space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">1. Objet</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Les présentes Conditions Générales d'Utilisation (CGU) ont formellement pour objet de définir les modalités de mise à
              disposition des services du site <span className="font-semibold text-foreground">Couverto</span> et les conditions encadrant
              l'utilisation de ce service par le visiteur ou le client (ci-après l'« Utilisateur »).
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">2. Accès au site et aux services</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Le site est accessible à tout Utilisateur disposant d'une connexion internet. Tous les coûts directs ou indirects afférents à
              l'accès au service, que ce soient les frais de matériel informatique, de logiciels ou les abonnements à internet, relèvent de
              la responsabilité et sont exclusivement à la charge de l'utilisateur. L'éditeur met en œuvre tous les moyens raisonnables pour
              assurer un accès de qualité au site, mais n'est tenu à aucune obligation d'y parvenir.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Copyright className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">3. Propriété intellectuelle</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Les marques, logos, visuels, signes ainsi que l'ensemble du contenu composant le site (textes, images, sons, code source...)
              font l'objet d'une stricte protection par le Code de la propriété intellectuelle, et plus spécifiquement par le droit
              d'auteur. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, de ces éléments est
              formellement interdite sans l'autorisation préalable et écrite de l'éditeur.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">4. Limitation de responsabilité</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Les sources des informations diffusées sur le site Couverto sont réputées fiables, néanmoins le site ne peut garantir qu'il
              soit exempt de défauts, d'erreurs logicielles ou d'omissions. En aucun cas, l'éditeur du site ne pourra être tenu responsable
              des dommages directs ou indirects découlant de l'utilisation ou de l'impossibilité d'utiliser les services de la plateforme.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCcw className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">5. Évolution des conditions</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              La plateforme Couverto se réserve le droit impérieux de modifier, unilatéralement et à tout moment, le contenu des présentes
              Conditions Générales d'Utilisation afin de les adapter aux évolutions des services proposés ou de la législation en vigueur.
              L'utilisateur est donc invité à les consulter régulièrement.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
