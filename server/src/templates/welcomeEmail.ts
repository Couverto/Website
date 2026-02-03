import { baseEmailLayout } from "./baseEmail.js";

interface WelcomeEmailProps {
  name: string;
}

export const welcomeEmailTemplate = ({ name }: WelcomeEmailProps): string => {
  const content = `
    <h2>Bienvenue ${name} ! 🎉</h2>
    
    <p>Nous sommes ravis de vous accueillir dans la communauté Couverto.</p>
    
    <div class="highlight-box">
      <p>🌟 Vous avez désormais accès à un large choix de restaurants pour vos futures sorties.</p>
    </div>
    
    <p>Voici ce que vous pouvez faire dès maintenant :</p>
    
    <ul>
      <li><strong>Rechercher</strong> des restaurants près de chez vous</li>
      <li><strong>Réserver</strong> une table en quelques clics</li>
      <li><strong>Gérer</strong> vos réservations en temps réel</li>
      <li><strong>Partager</strong> vos avis avec la communauté</li>
    </ul>
    
    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button">
        🍽️ Découvrir les restaurants
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      Une question ? Contactez-nous à tout moment.
    </p>
  `;
  return baseEmailLayout(content, "Bienvenue sur Couverto");
};
