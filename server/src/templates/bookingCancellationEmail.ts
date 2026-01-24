import { baseEmailLayout } from "./baseEmail.js";

interface BookingCancellationProps {
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
}

export const bookingCancellationTemplate = ({ customerName, restaurantName, date, time }: BookingCancellationProps): string => {
  const content = `
    <h2>Annulation de réservation</h2>
    <p>Bonjour ${customerName},</p>
    <p>Nous sommes désolés de vous informer que votre réservation chez <strong>${restaurantName}</strong> prévue le :</p>
    
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
       <p style="margin: 0; font-weight: bold; color: #b91c1c;">📅 ${date} à ${time}</p>
    </div>

    <p>A été annulée par l'établissement.</p>
    <p>Nous vous invitons à contacter le restaurant directement pour plus d'informations ou à effectuer une nouvelle recherche.</p>
    
    <center>
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button" style="background-color: #4b5563;">Trouver un autre restaurant</a>
    </center>
  `;
  return baseEmailLayout(content, `Réservation Annulée - ${restaurantName}`);
};
