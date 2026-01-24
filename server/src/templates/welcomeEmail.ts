import { baseEmailLayout } from "./baseEmail.js";

interface WelcomeEmailProps {
  name: string;
}

export const welcomeEmailTemplate = ({ name }: WelcomeEmailProps): string => {
  const content = `
    <h2>Bienvenue ${name} !</h2>
    <p>Nous sommes ravis de vous compter parmi nous.</p>
    <p>Vous avez désormais accès à un large choix de restaurants pour vos futures sorties.</p>
    <p>Vous pouvez dès maintenant :</p>
    <ul>
      <li>Rechercher des restaurants près de chez vous</li>
      <li>Réserver une table en quelques clics</li>
      <li>Gérer vos réservations en temps réel</li>
    </ul>
    <center>
      <a href="${process.env.CORS_ORIGIN || "#"}" class="button">Découvrir les restaurants</a>
    </center>
  `;
  return baseEmailLayout(content, "Bienvenue sur Couverto");
};
