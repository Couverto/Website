import { baseEmailLayout } from "./baseEmail.js";

export const reviewRequestEmail = (customerName: string, restaurantName: string, reviewUrl: string): string => {
  const content = `
    <h2>Bonjour ${customerName},</h2>
    
    <p>Nous espérons que vous avez passé un excellent moment chez <strong>${restaurantName}</strong> hier.</p>
    
    <p>Votre avis compte beaucoup pour nous et pour les futurs clients. Pourriez-vous prendre un moment pour partager votre ressenti ?</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${reviewUrl}" class="button">
        ⭐ Laisser un avis
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
      <a href="${reviewUrl}" style="color: #2ecc9a; word-break: break-all;">${reviewUrl}</a>
    </p>
  `;

  return baseEmailLayout(content, `Votre avis sur ${restaurantName}`);
};
