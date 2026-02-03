import { baseEmailLayout } from "./baseEmail.js";

export const thankYouReviewEmail = (customerName: string, restaurantName: string): string => {
  const content = `
    <h2>Merci ${customerName} ! 🙏</h2>
    
    <p>Nous avons bien reçu votre avis concernant votre expérience chez <strong>${restaurantName}</strong>.</p>
    
    <div class="highlight-box">
      <p>💚 <strong>Votre contribution fait la différence !</strong><br>
      Vos retours sont précieux pour nous et aident la communauté à découvrir les meilleurs établissements.</p>
    </div>
    
    <div class="text-center my-4">
      <p style="font-size: 40px; margin: 0;">🌟</p>
    </div>
    
    <p>Grâce à des membres engagés comme vous, Couverto devient chaque jour une meilleure plateforme pour trouver le restaurant idéal.</p>
    
    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button">
        🍽️ Découvrir d'autres restaurants
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      À très bientôt sur Couverto !
    </p>
  `;

  return baseEmailLayout(content, `Merci pour votre avis - ${restaurantName}`);
};
