import { baseEmailLayout } from "./baseEmail.js";

export const reviewRequestEmail = (customerName: string, restaurantName: string, reviewUrl: string): string => {
  const content = `
    <h2>Comment s'est passée votre expérience ? ⭐</h2>
    
    <p>Bonjour ${customerName},</p>
    
    <p>Nous espérons que vous avez passé un excellent moment chez <strong>${restaurantName}</strong>.</p>
    
    <div class="highlight-box">
      <p>💬 Votre avis compte ! Partagez votre expérience et aidez la communauté à découvrir les meilleurs restaurants.</p>
    </div>
    
    <div class="text-center my-6">
      <a href="${reviewUrl}" class="button">
        ⭐ Laisser un avis
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
      Cela ne vous prendra que quelques secondes et permettra à d'autres clients de faire le bon choix.
    </p>
    
    <div class="divider"></div>
    
    <p style="font-size: 12px; color: #9ca3af;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
      <a href="${reviewUrl}" style="word-break: break-all;">${reviewUrl}</a>
    </p>
  `;

  return baseEmailLayout(content, `Votre avis sur ${restaurantName}`);
};
