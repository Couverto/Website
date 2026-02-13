export const MentionsLegales = () => {
  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <h1>Mentions Légales</h1>

      <p>
        Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux
        utilisateurs du site Couverto l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
      </p>

      <h2>Edition du site</h2>
      <p>Le présent site, accessible à l’URL {window.location.origin} (le « Site »), est édité par :</p>
      <p>
        Couverto, résidant au 13 bd maréchal Joffre GRENOBLE 38000, de nationalité Française (France), inscrit au R.C.S. de Grenoble sous le
        numéro 101 012 219.
      </p>

      <h2>Hébergement</h2>
      <p>Le Site est hébergé par OVHcloud, situé 2 rue Kellermann 59100 Roubaix.</p>

      <h2>Directeur de publication</h2>
      <p>Le Directeur de la publication du Site est Téo VILLET.</p>

      {/* <h2>Nous contacter</h2>
      <p>
        Par téléphone : [Numéro]
        <br />
        Par email : [Email]
        <br />
        Par courrier : [Adresse]
      </p> */}
    </article>
  );
};
