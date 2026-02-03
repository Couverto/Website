import { baseEmailLayout } from "./baseEmail.js";

export const thankYouReviewEmail = (customerName: string, restaurantName: string): string => {
  const content = `
    <h2>Merci ${customerName} ! 🙏</h2>
    
    <p>Nous avons bien reçu votre avis concernant votre expérience chez <strong>${restaurantName}</strong>.</p>
    
    <p>Vos retours sont précieux pour nous et aident la communauté à découvrir les meilleurs établissements.</p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2ecc9a;">
      <p style="margin: 0; color: #173B15; font-weight: 500;">
        💚 Votre contribution fait la différence !
      </p>
    </div>
    
    <p>À très bientôt sur Couverto !</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button">
        Découvrir d'autres restaurants
      </a>
    </div>
  `;

  return baseEmailLayout(content, `Merci pour votre avis - ${restaurantName}`);
};
