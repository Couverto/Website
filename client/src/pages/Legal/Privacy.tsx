import { useConfigContext } from "@/contexts/configContext";

export const Privacy = () => {
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];

  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <h1>Politique de Confidentialité</h1>

      <p>
        La protection de vos données personnelles est une priorité pour {appName}. Cette politique de confidentialité explique comment nous
        collectons, utilisons et protégeons vos informations.
      </p>

      <h2>1. Collecte des données</h2>
      <p>
        Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, utilisez nos services ou nous
        contactez. Ces informations peuvent inclure votre nom, adresse email, numéro de téléphone, et les détails de votre établissement.
      </p>

      <h2>2. Utilisation des données</h2>
      <p>Nous utilisons vos données pour :</p>
      <ul>
        <li>Fournir, maintenir et améliorer nos services.</li>
        <li>Traiter vos transactions et gérer votre compte.</li>
        <li>Vous envoyer des notifications techniques, des mises à jour et des alertes de sécurité.</li>
        <li>Répondre à vos commentaires et questions.</li>
      </ul>

      <h2>3. Partage des données</h2>
      <p>
        Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec des fournisseurs de services tiers qui
        nous aident à opérer notre activité (hébergement, paiement, etc.), sous réserve qu'ils acceptent de garder ces informations
        confidentielles.
      </p>

      <h2>4. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification, la
        divulgation ou la destruction.
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Conformément à la réglementation (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos
        données. Pour exercer ces droits, veuillez nous contacter.
      </p>
    </article>
  );
};
