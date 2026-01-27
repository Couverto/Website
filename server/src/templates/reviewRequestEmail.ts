export const reviewRequestEmail = (customerName: string, restaurantName: string, reviewUrl: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Bonjour ${customerName},</h2>
      
      <p>Nous espérons que vous avez apprécié votre expérience chez <strong>${restaurantName}</strong> hier.</p>
      
      <p>Votre avis compte beaucoup pour nous et pour les futurs clients. Pourriez-vous prendre un moment pour partager votre ressenti ?</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Laisser un avis
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien : <br>
        <a href="${reviewUrl}">${reviewUrl}</a>
      </p>

      <p style="font-size: 12px; color: #999; margin-top: 40px;">
        Cet email vous a été envoyé suite à votre réservation sur Couverto.
      </p>
    </div>
  `;
};
