import { useConfigContext } from "@/contexts/configContext";

export const MentionsLegales = () => {
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];

  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <h1>Mentions Légales</h1>

      <p>
        Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux
        utilisateurs du site {appName} l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
      </p>

      <h2>Edition du site</h2>
      <p>Le présent site, accessible à l’URL {window.location.origin} (le « Site »), est édité par :</p>
      <p>
        [Nom de la Société / Entrepreneur], résidant au [Adresse complète], de nationalité Française (France), inscrit au R.C.S. de [Ville]
        sous le numéro [Numéro RCS].
      </p>

      <h2>Hébergement</h2>
      <p>Le Site est hébergé par [Nom de l'hébergeur], situé [Adresse de l'hébergeur], (contact téléphonique ou email : [Contact]).</p>

      <h2>Directeur de publication</h2>
      <p>Le Directeur de la publication du Site est [Nom du directeur].</p>

      <h2>Nous contacter</h2>
      <p>
        Par téléphone : [Numéro]
        <br />
        Par email : [Email]
        <br />
        Par courrier : [Adresse]
      </p>
    </article>
  );
};
