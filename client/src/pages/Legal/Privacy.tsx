import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Database, Activity, Share2, Lock, Settings2 } from "lucide-react";

export const Privacy = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <ShieldCheck className="w-8 h-8 text-primary -rotate-3" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Politique de Confidentialité</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Comment nous collectons, utilisons et protégeons vos informations personnelles.
        </p>
      </div>

      <Card className="border shadow-lg shadow-primary/5 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12 space-y-12">
          {/* Introduction */}
          <section>
            <p className="text-justify leading-loose text-foreground/80 font-medium">
              La protection de vos données personnelles est une priorité absolue pour{" "}
              <span className="text-primary font-semibold">Couverto</span>. Cette politique de confidentialité vise à vous expliquer en
              toute transparence comment nous traitons vos données dans le cadre de nos services.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">1. Collecte des données</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, utilisez nos services ou
              nous contactez. Ces informations incluent notamment :
            </p>
            <ul className="pl-14 list-disc space-y-2 text-muted-foreground leading-relaxed marker:text-primary/50">
              <li>Votre nom, prénom et coordonnées de contact (adresse email, numéro de téléphone).</li>
              <li>Les détails de votre établissement (nom, adresse, horaires) si applicable.</li>
              <li>Vos préférences d'utilisation et historiques de réservation.</li>
            </ul>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">2. Utilisation des données</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">Nous utilisons vos données principalement pour :</p>
            <ul className="pl-14 list-disc space-y-2 text-muted-foreground leading-relaxed marker:text-primary/50">
              <li>Fournir, maintenir et améliorer continuellement nos services et notre plateforme.</li>
              <li>Traiter vos transactions, vos réservations et gérer l'administration de votre compte.</li>
              <li>Vous envoyer des notifications techniques, des mises à jour et des alertes de sécurité essentielles.</li>
              <li>Répondre efficacement à vos commentaires, demandes de support technique et questions.</li>
            </ul>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">3. Partage des données</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              <strong className="text-foreground">Nous ne vendons en aucun cas vos données personnelles.</strong> Nous pouvons toutefois
              partager vos informations avec des fournisseurs de services tiers de confiance qui nous aident à opérer notre activité (par
              exemple: hébergement web, traitement des paiements), sous réserve absolue qu'ils s'engagent contractuellement à garder ces
              informations confidentielles et sécurisées.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">4. Sécurité</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles strictes pour protéger de manière proactive vos
              données contre l'accès non autorisé, l'altération, la divulgation ou la destruction malveillante.
            </p>
          </section>

          <Separator className="bg-primary/10" />

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">5. Vos Droits (RGPD)</h2>
            </div>
            <p className="text-justify leading-loose text-muted-foreground pl-11">
              Conformément à la réglementation européenne (RGPD), vous disposez à tout moment d'un droit d'accès, de rectification,
              d'effacement (droit à l'oubli) et de portabilité de vos données personnelles. Pour l'exercice de ces droits, n'hésitez pas à
              nous contacter directement depuis votre espace client ou par email.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
